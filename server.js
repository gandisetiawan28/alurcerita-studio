/**
 * AlurCerita Studio — Backend API Server
 * Provides RESTful API for:
 * 1. Film Projects management (SQLite)
 * 2. Multi-Agent Script Generation (Google Gemini API with Smart Round-Robin)
 * 3. Text-to-Speech Voiceover Bridge (Google Colab: Kokoro-82M, Coqui XTTS v2, Bark)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { spawn, execSync } = require('node:child_process');
const { ProjectRepo, ApiKeyRepo, TtsRepo } = require('./db');
const { GEMINI_MODELS, runGeminiGeneration, testGeminiApiKey } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure audio storage directory exists
const publicAudioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(publicAudioDir)) {
  fs.mkdirSync(publicAudioDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve frontend static files and audio files directly
app.use(express.static(path.join(__dirname)));
app.use('/audio', express.static(publicAudioDir));

// ---------------------------------------------------------------------------
// Health & Environment Status
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const activeKeysCount = ApiKeyRepo.countActive();
  const ttsSettings = TtsRepo.getSettings();
  res.json({
    status: 'online',
    appName: 'AlurCerita Studio API',
    database: 'SQLite (alurcerita.db)',
    activeKeysCount,
    hasActiveKeys: activeKeysCount > 0 || Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
    ttsColabConnected: Boolean(ttsSettings.is_connected && ttsSettings.colab_url)
  });
});

// ---------------------------------------------------------------------------
// API Key Management Routes (SQLite Stored, Smart Round-Robin)
// ---------------------------------------------------------------------------

// 1. List all keys (masked)
app.get('/api/keys', (req, res) => {
  try {
    const keys = ApiKeyRepo.getAll();
    res.json({
      success: true,
      data: keys,
      activeCount: keys.filter(k => k.is_active && k.status !== 'invalid').length
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Add one or multiple keys
app.post('/api/keys', (req, res) => {
  try {
    const { keys, label } = req.body;
    if (!keys || typeof keys !== 'string') {
      return res.status(400).json({ success: false, error: 'Kunci API wajib diisi.' });
    }
    const result = ApiKeyRepo.addKeys(keys, label);
    res.status(201).json({
      success: true,
      message: `${result.addedCount} dari ${result.totalSubmitted} kunci API berhasil disimpan ke SQLite.`,
      data: result,
      keys: ApiKeyRepo.getAll()
    });
  } catch (error) {
    console.error('Error adding API keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Toggle key active status
app.put('/api/keys/:id/toggle', (req, res) => {
  try {
    const { is_active } = req.body;
    const updated = ApiKeyRepo.toggleActive(req.params.id, Boolean(is_active));
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error toggling key status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Delete key
app.delete('/api/keys/:id', (req, res) => {
  try {
    const deleted = ApiKeyRepo.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Kunci tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Kunci API berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Test specific stored key
app.post('/api/keys/:id/test', async (req, res) => {
  try {
    const keyRecord = ApiKeyRepo.getKeyWithSecret(req.params.id);
    if (!keyRecord) {
      return res.status(404).json({ success: false, error: 'Kunci tidak ditemukan.' });
    }
    const testResult = await testGeminiApiKey(keyRecord.key_value);
    if (testResult.success) {
      ApiKeyRepo.recordUsage(keyRecord.id, true);
    } else {
      ApiKeyRepo.recordUsage(keyRecord.id, false, testResult.error);
    }
    res.json({
      success: testResult.success,
      message: testResult.message || testResult.error,
      modelUsed: testResult.modelUsed,
      key: ApiKeyRepo.getById(req.params.id)
    });
  } catch (error) {
    console.error('Error testing key:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Get official Gemini API models catalog (8 models strictly allowed)
app.get('/api/gemini/models', (req, res) => {
  res.json({
    success: true,
    models: GEMINI_MODELS
  });
});

// 6. Test a raw key before saving
app.post('/api/keys/test-raw', async (req, res) => {
  try {
    const { key } = req.body;
    const testResult = await testGeminiApiKey(key);
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Google Colab TTS Bridge Routes (Kokoro-82M, Coqui XTTS v2, Bark)
// ---------------------------------------------------------------------------

// 1. Get current TTS config
app.get('/api/tts/config', (req, res) => {
  try {
    const config = TtsRepo.getSettings();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Save TTS config
app.post('/api/tts/config', (req, res) => {
  try {
    const { colab_url, model, voice, speed } = req.body;
    const updated = TtsRepo.updateSettings({
      colab_url: colab_url !== undefined ? colab_url.trim().replace(/\/+$/, '') : undefined,
      model,
      voice,
      speed
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Test Google Colab connection
app.post('/api/tts/test-colab', async (req, res) => {
  try {
    let colabUrl = req.body.colab_url;
    if (!colabUrl) {
      const cfg = TtsRepo.getSettings();
      colabUrl = cfg.colab_url;
    }
    if (!colabUrl || !colabUrl.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'URL Google Colab belum diisi atau tidak valid.' });
    }
    colabUrl = colabUrl.trim().replace(/\/+$/, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const healthRes = await fetch(`${colabUrl}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!healthRes.ok) {
      throw new Error(`HTTP ${healthRes.status}: ${healthRes.statusText}`);
    }
    const healthData = await healthRes.json();
    TtsRepo.updateSettings({ colab_url: colabUrl, is_connected: 1 });

    res.json({
      success: true,
      message: 'Berhasil terhubung ke GPU Google Colab!',
      data: healthData
    });
  } catch (error) {
    console.error('Error testing Colab connection:', error);
    TtsRepo.updateSettings({ is_connected: 0 });
    res.status(500).json({
      success: false,
      error: `Gagal terhubung ke Colab: ${error.name === 'AbortError' ? 'Koneksi timeout (10 detik)' : error.message}. Pastikan cell notebook sudah selesai dijalankan.`
    });
  }
});

// 4. Generate TTS via Google Colab
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { projectId, text, model = 'kokoro', voice = 'am_michael', speed = 1.0, temperature = 0.75, cfg_scale = 2.5, dialogue_mode = 'auto', tone_style = 'natural' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Teks voiceover kosong.' });
    }

    const cfg = TtsRepo.getSettings();
    const colabUrl = (req.body.colab_url || cfg.colab_url || '').trim().replace(/\/+$/, '');
    if (!colabUrl || !colabUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'URL Google Colab belum diset. Silakan jalankan notebook Colab dan masukkan URL Gradio Live pada menu Voiceover TTS.'
      });
    }

    // Clean text: strip visual cues like (Visual: ...) and markdown formatting
    const cleanSpokenText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('**Genre') || trimmed.startsWith('**Channel')) return false;
        if (/^\((?:Visual:.*)\)$/i.test(trimmed)) return false;
        return true;
      })
      .join('\n')
      .replace(/[\*_~`#]/g, '')
      .trim();

    if (!cleanSpokenText) {
      return res.status(400).json({ success: false, error: 'Tidak ada teks narasi yang bisa disuarakan setelah membersihkan tag visual.' });
    }

    console.log(`🎙️ Mengirim request TTS ke Google Colab (${model} / ${voice} / ${speed}x / mp3)...`);
    const ttsRes = await fetch(`${colabUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanSpokenText,
        model,
        voice,
        speed: Number(speed),
        format: 'mp3',
        temperature: Number(temperature) || 0.75,
        cfg_scale: Number(cfg_scale) || 2.5,
        dialogue_mode: dialogue_mode || 'auto',
        tone_style: tone_style || 'natural'
      })
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      throw new Error(`Google Colab Error (${ttsRes.status}): ${errText}`);
    }

    const contentType = ttsRes.headers.get('content-type') || 'audio/mpeg';
    const isMp3 = contentType.includes('mpeg') || contentType.includes('mp3');
    const ext = isMp3 ? 'mp3' : 'wav';

    const arrayBuffer = await ttsRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save audio file locally
    const timestamp = Date.now();
    const safeModel = String(model).toLowerCase().replace(/[^a-z0-9]/g, '');
    const filename = `voice_${projectId || 'draft'}_${safeModel}_${timestamp}.${ext}`;
    const filePath = path.join(publicAudioDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Estimate duration:
    // MP3 192kbps = 24000 bytes/sec; WAV 24kHz 16-bit mono = 48000 bytes/sec
    const byteRate = isMp3 ? 24000 : 48000;
    const durationSeconds = Math.max(1, Math.round((buffer.length / byteRate) * 10) / 10);

    // Record in SQLite
    if (projectId) {
      TtsRepo.addAudio(projectId, filename, model, voice, speed, durationSeconds);
    }

    console.log(`✅ File audio berhasil disimpan: /audio/${filename} (${durationSeconds}s)`);
    res.json({
      success: true,
      audio_url: `/audio/${filename}`,
      filename,
      duration_seconds: durationSeconds,
      model,
      voice,
      speed
    });
  } catch (error) {
    console.error('TTS Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Smart Sentence Segmentation for Indonesian & English Storytelling
// Prevents truncating titles (Mr., Mrs., Dr.), abbreviations (dll., dsb.), numbers (2.5, 10.000), initials, etc.
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const P = '\uE000';

  const titles = [
    'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'rev', 'capt', 'sgt', 'col', 'gen', 'lt', 'maj', 'cpl', 'pvt', 'adm',
    'jr', 'sr', 'st', 'master', 'bpk', 'ibu', 'sdr', 'sdri', 'ust', 'habib', 'kyai',
    'ir', 'drs', 'dra', 'sh', 'se', 'mm', 'mh', 'pt', 'cv', 'tbk', 'alm'
  ];
  const titlesRegex = new RegExp('\\b(' + titles.join('|') + ')\\.', 'gi');
  let processed = text.replace(titlesRegex, (m, t) => t + P);

  processed = processed.replace(/(\d+)\.(\d+)/g, '$1' + P + '$2');
  processed = processed.replace(/\b(no|nomor|hal|hlm|vol|art|bab)\.\s*(\d+)/gi, (m, w, n) => w + P + ' ' + n);
  processed = processed.replace(/\b([A-Z])\./g, '$1' + P);

  const midAbbr = ['dll', 'dsb', 'dst', 'dlsb', 'tsb', 'ttg', 'yg', 'dgn', 'spt', 'etc', 'eg', 'ie', 'vs', 'al'];
  const midAbbrRegex = new RegExp('\\b(' + midAbbr.join('|') + ')\\.(?=\\s+[a-z0-9]|[,;:]|\\s*$)', 'gi');
  processed = processed.replace(midAbbrRegex, (m, a) => a + P);
  processed = processed.replace(new RegExp('\\b(' + midAbbr.join('|') + ')\\.(?=[)"]\\s+[a-z0-9])', 'gi'), (m, a) => a + P);

  processed = processed.replace(/\.{2,}/g, m => P.repeat(m.length));
  const rawSentences = processed.match(/[^.!?]+(?:[.!?]+["'”’)]*|\s*$)/g) || [processed];

  return rawSentences
    .map(s => s.replace(new RegExp(P, 'g'), '.').trim())
    .filter(s => s.length > 0);
}

// 4b. Generate Sentence-by-Sentence TTS with Live SSE Progress Stream
app.post('/api/tts/generate-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let { projectId, sentences, text, voice = 'am_adam', speed = 1.1, model = 'kokoro', temperature = 0.75, cfg_scale = 2.5, dialogue_mode = 'auto', tone_style = 'natural' } = req.body;
    if ((!Array.isArray(sentences) || sentences.length === 0) && text) {
      sentences = splitIntoSentences(text);
    }
    if (!Array.isArray(sentences) || sentences.length === 0) {
      sendEvent({ type: 'error', message: 'Daftar kalimat kosong.' });
      return res.end();
    }

    const cfg = TtsRepo.getSettings();
    const colabUrl = (req.body.colab_url || cfg?.colab_url || '').trim().replace(/\/+$/, '');

    if (!colabUrl || !colabUrl.startsWith('http')) {
      sendEvent({
        type: 'error',
        message: 'URL Google Colab belum diset. Pastikan Google Colab sudah dijalankan dan URL Cloudflare Tunnel sudah terhubung di menu Voiceover TTS.'
      });
      return res.end();
    }

    const scratchDir = path.join(__dirname, 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    const outputId = `s_${projectId || 'draft'}_${Date.now()}`;
    const chunkDir = path.join(publicAudioDir, 'chunks', outputId);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    sendEvent({ type: 'init', total: sentences.length });
    console.log(`🚀 [SSE] Memulai sintesis ${sentences.length} kalimat via Colab: ${colabUrl}...`);

    let aborted = false;
    let currentFetchController = null;
    res.on('close', () => {
      if (!res.writableEnded) {
        aborted = true;
        if (currentFetchController) {
          try { currentFetchController.abort(); } catch (_) {}
        }
      }
    });

    const chunkFiles = [];

    // Synthesize each sentence sequentially
    for (let i = 0; i < sentences.length; i++) {
      if (aborted) {
        console.log(`⚠️ [SSE] Client disconnected, menghentikan sintesis.`);
        break;
      }

      const sentence = sentences[i].trim();
      if (!sentence) continue;

      sendEvent({ type: 'sentence_start', index: i, text: sentence });

      const chunkFileName = `chunk_${String(i).padStart(4, '0')}.mp3`;
      const chunkFilePath = path.join(chunkDir, chunkFileName);

      let success = false;
      let lastErr = null;

      // Retry up to 2 times on transient network hiccup
      for (let attempt = 1; attempt <= 2; attempt++) {
        if (aborted) break;
        try {
          const controller = new AbortController();
          currentFetchController = controller;
          // Timeout adaptif: Kokoro (35s), Dia-1.6B & Coqui XTTS (120s karena model 1.6B membutuhkan waktu komputasi)
          const timeoutMs = (model === 'dia' || model === 'xtts') ? 120000 : 35000;
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(`${colabUrl}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: sentence,
              model,
              voice,
              speed: Number(speed),
              format: 'mp3',
              temperature: Number(temperature) || 0.75,
              cfg_scale: Number(cfg_scale) || 2.5,
              dialogue_mode: dialogue_mode || 'auto',
              tone_style: tone_style || 'natural'
            }),
            signal: controller.signal
          });
          clearTimeout(timer);
          currentFetchController = null;

          if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errBody}`);
          }

          const arrayBuf = await response.arrayBuffer();
          fs.writeFileSync(chunkFilePath, Buffer.from(arrayBuf));
          chunkFiles.push(chunkFilePath);
          success = true;
          break;
        } catch (err) {
          lastErr = err;
          if (attempt === 1 && !aborted) {
            await new Promise(r => setTimeout(r, 600));
          }
        }
      }

      if (!success) {
        if (aborted) break;
        throw new Error(`Gagal pada kalimat #${i + 1} ("${sentence.slice(0, 30)}..."): ${lastErr?.message || 'Timeout'}`);
      }

      // Read chunk duration via ffprobe
      let chunkDuration = 0;
      try {
        const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${chunkFilePath}"`).toString().trim();
        chunkDuration = parseFloat(durStr) || 0;
      } catch (_) {}

      const chunkAudioUrl = `/audio/chunks/${outputId}/${chunkFileName}`;
      sendEvent({
        type: 'sentence_done',
        index: i,
        audio_url: chunkAudioUrl,
        duration: chunkDuration,
        text: sentence
      });
    }

    if (aborted || chunkFiles.length === 0) {
      return res.end();
    }

    // Step 2: Ensure 250ms silence mp3 exists for natural narrative pacing
    const silenceFilePath = path.join(scratchDir, 'silence_250ms.mp3');
    if (!fs.existsSync(silenceFilePath)) {
      try {
        execSync(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.25 -c:a libmp3lame -b:a 192k "${silenceFilePath}"`, { stdio: 'ignore' });
      } catch (e) {
        console.warn('Could not generate silence mp3, continuing without silence:', e.message);
      }
    }

    // Step 3: Concat chunks into master file using ffmpeg
    const masterFileName = `voice_${outputId}.mp3`;
    const masterFilePath = path.join(publicAudioDir, masterFileName);
    const listFilePath = path.join(chunkDir, 'list.txt');

    const hasSilence = fs.existsSync(silenceFilePath);
    const normalizedSilencePath = silenceFilePath.replace(/\\/g, '/');

    let listContent = '';
    for (let i = 0; i < chunkFiles.length; i++) {
      const normChunk = chunkFiles[i].replace(/\\/g, '/');
      listContent += `file '${normChunk}'\n`;
      if (hasSilence && i < chunkFiles.length - 1) {
        listContent += `file '${normalizedSilencePath}'\n`;
      }
    }
    fs.writeFileSync(listFilePath, listContent, 'utf8');

    console.log(`🔗 [SSE] Menggabungkan ${chunkFiles.length} kalimat menjadi ${masterFileName}...`);
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listFilePath}" -c:a libmp3lame -b:a 192k "${masterFilePath}"`, { stdio: 'ignore' });

    // Read total duration via ffprobe
    let totalDuration = 0;
    try {
      const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${masterFilePath}"`).toString().trim();
      totalDuration = Math.round(parseFloat(durStr) || 0);
    } catch (_) {}

    // Save to SQLite
    if (projectId) {
      TtsRepo.addAudio(projectId, masterFileName, model, voice, speed, totalDuration);
    }

    console.log(`🎉 [SSE] Selesai! File: ${masterFileName}, Durasi: ${totalDuration}s`);
    sendEvent({
      type: 'complete',
      audio_url: `/audio/${masterFileName}`,
      filename: masterFileName,
      total_duration: totalDuration,
      total_sentences: chunkFiles.length,
      output_id: outputId,
      chunks: chunkFiles.map((f, idx) => ({
        index: idx,
        filename: path.basename(f),
        audio_url: `/audio/chunks/${outputId}/${path.basename(f)}`
      }))
    });

    res.end();

  } catch (err) {
    console.error('Generate-stream error:', err);
    sendEvent({ type: 'error', message: err.message });
    res.end();
  }
});

// 5. Get audio history for a project
app.get('/api/projects/:id/audios', (req, res) => {
  try {
    const audios = TtsRepo.getAudiosByProject(req.params.id);
    res.json({ success: true, data: audios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Projects CRUD API (SQLite)
// ---------------------------------------------------------------------------

// 1. List all projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = ProjectRepo.getAll();
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get single project by ID (with all sources & script)
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = ProjectRepo.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan.' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create new project
app.post('/api/projects', (req, res) => {
  try {
    const newProject = ProjectRepo.create(req.body);
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update existing project
app.put('/api/projects/:id', (req, res) => {
  try {
    const updated = ProjectRepo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const deleted = ProjectRepo.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Proyek berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// AI Multi-Agent Generation Trigger
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/generate', async (req, res) => {
  try {
    const project = ProjectRepo.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan.' });
    }

    const generationPayload = {
      movieTitle: req.body.title || project.title,
      movieDirector: req.body.director_year || project.director_year,
      movieDescription: req.body.synopsis || project.synopsis,
      channelName: req.body.channel_name || project.channel_name,
      openingHook: req.body.opening_hook || project.opening_hook,
      outroBridge: req.body.outro_bridge || project.outro_bridge,
      personaStyle: req.body.persona_style || project.persona_style,
      includeAnalysis: req.body.include_analysis !== undefined ? req.body.include_analysis : Boolean(project.include_analysis),
      enforceVisualCues: req.body.enforce_visual_cues !== undefined ? req.body.enforce_visual_cues : Boolean(project.enforce_visual_cues),
      sources: req.body.sources || project.sources || {},
      preferredModel: req.body.gemini_model || 'auto'
    };

    const aiResult = await runGeminiGeneration(generationPayload);

    // Save to SQL database
    const updated = ProjectRepo.update(req.params.id, {
      ...generationPayload,
      script_markdown: aiResult.script_markdown,
      word_count: aiResult.word_count
    });

    res.json({
      success: true,
      data: updated,
      mode: aiResult.mode,
      used_keys: aiResult.used_keys,
      used_models: aiResult.used_models,
      active_model: aiResult.active_model
    });
  } catch (error) {
    console.error('Error in project generation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start listening
app.listen(PORT, () => {
  const count = ApiKeyRepo.countActive();
  const ttsSettings = TtsRepo.getSettings();
  console.log(`\n======================================================`);
  console.log(`🎬 AlurCerita Studio Server berjalan di:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📦 Database SQL : SQLite (alurcerita.db)`);
  console.log(`🔑 Smart Keys   : ${count} Kunci API aktif di database`);
  console.log(`🎙️ TTS Colab    : ${ttsSettings.colab_url ? ttsSettings.colab_url : 'Belum terhubung'}`);
  console.log(`======================================================\n`);
});
