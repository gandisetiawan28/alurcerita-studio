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
const { ProjectRepo, ApiKeyRepo, TtsRepo, ChannelRepo, PersonaRepo, TtsVoiceRepo, PromptTemplateRepo, SettingsRepo, AudioPresetRepo, AudioRecordingRepo, MediaRepo } = require('./db');
const { GEMINI_MODELS, runGeminiGeneration, runGeminiTranscreation, testGeminiApiKey, analyzeSrtForCutScenes } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3000;

const multer = require('multer');

// Ensure audio and video storage directories exist
const publicAudioDir = path.join(__dirname, 'public', 'audio');
const publicBgmDir = path.join(publicAudioDir, 'bgm');
const publicVideosDir = path.join(__dirname, 'public', 'videos');
const publicVideosRawDir = path.join(publicVideosDir, 'raw');
const publicVideosProcessedDir = path.join(publicVideosDir, 'processed');

[publicAudioDir, publicBgmDir, publicVideosDir, publicVideosRawDir, publicVideosProcessedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for video & audio upload storage
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|mkv|webm|mov|avi|flv|wmv|m4v)$/i.test(file.originalname);
    const isAudio = file.mimetype.startsWith('audio/') || /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(file.originalname);
    if (isVideo) {
      cb(null, publicVideosRawDir);
    } else if (isAudio) {
      cb(null, publicAudioDir);
    } else {
      cb(null, publicVideosRawDir);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.mp4';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 50);
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    cb(null, `${base}_${unique}${ext}`);
  }
});
const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB max file size for full-length high-res movie files
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Serve frontend static files and media files directly
app.use(express.static(path.join(__dirname)));
app.use('/audio', express.static(publicAudioDir));
app.use('/videos', express.static(publicVideosDir));
app.get('/favicon.ico', (req, res) => res.status(204).end());

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

// 5. Update key info
app.put('/api/keys/:id', (req, res) => {
  try {
    const updated = ApiKeyRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Kunci tidak ditemukan.' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Reset key status/cooldown
app.post('/api/keys/:id/reset', (req, res) => {
  try {
    const updated = ApiKeyRepo.resetStatus(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Test specific stored key
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

// ===========================================================================
// CHANNEL MANAGEMENT ROUTES (Database SQLite)
// ===========================================================================

// 1. Get all channels
app.get('/api/channels', (req, res) => {
  try {
    const channels = ChannelRepo.getAll();
    res.json({ success: true, data: channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get single channel
app.get('/api/channels/:id', (req, res) => {
  try {
    const channel = ChannelRepo.getById(req.params.id);
    if (!channel) return res.status(404).json({ success: false, error: 'Channel tidak ditemukan.' });
    res.json({ success: true, data: channel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create channel
app.post('/api/channels', (req, res) => {
  try {
    const { name, greeting, outro_bridge, persona_style, target_language, is_default } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Nama channel tidak boleh kosong.' });
    }
    const created = ChannelRepo.create({
      name: name.trim(),
      greeting,
      outro_bridge,
      persona_style,
      target_language,
      is_default
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update channel
app.put('/api/channels/:id', (req, res) => {
  try {
    const updated = ChannelRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Channel tidak ditemukan.' });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete channel
app.delete('/api/channels/:id', (req, res) => {
  try {
    const deleted = ChannelRepo.delete(req.params.id);
    res.json({ success: true, message: 'Channel berhasil dihapus.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Set channel as default
app.post('/api/channels/:id/default', (req, res) => {
  try {
    const channel = ChannelRepo.setDefault(req.params.id);
    res.json({ success: true, data: channel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Persona / Gaya Tutur CRUD Routes (SQLite Stored)
// ---------------------------------------------------------------------------

// 1. List all personas
app.get('/api/personas', (req, res) => {
  try {
    const personas = PersonaRepo.getAll();
    res.json({ success: true, data: personas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get single persona
app.get('/api/personas/:id', (req, res) => {
  try {
    const persona = PersonaRepo.getById(req.params.id);
    if (!persona) return res.status(404).json({ success: false, error: 'Persona tidak ditemukan.' });
    res.json({ success: true, data: persona });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create persona
app.post('/api/personas', (req, res) => {
  try {
    const { name, key, description, tone_prompt, is_default } = req.body;
    if (!name || !tone_prompt) {
      return res.status(400).json({ success: false, error: 'Nama persona dan instruksi gaya tutur wajib diisi.' });
    }
    const created = PersonaRepo.create({ name, key, description, tone_prompt, is_default });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update persona
app.put('/api/personas/:id', (req, res) => {
  try {
    const updated = PersonaRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Persona tidak ditemukan.' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete persona
app.delete('/api/personas/:id', (req, res) => {
  try {
    PersonaRepo.delete(req.params.id);
    res.json({ success: true, message: 'Persona berhasil dihapus.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Set persona as default
app.post('/api/personas/:id/default', (req, res) => {
  try {
    const persona = PersonaRepo.setDefault(req.params.id);
    res.json({ success: true, data: persona });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// TTS Character & Voices CRUD Routes (SQLite Stored)
// ---------------------------------------------------------------------------

// 1. List all voices (optional filter by model: ?model=kokoro|dia|xtts)
app.get('/api/tts/voices', (req, res) => {
  try {
    const { model } = req.query;
    const voices = TtsVoiceRepo.getAll(model || null);
    res.json({ success: true, data: voices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Create voice
app.post('/api/tts/voices', (req, res) => {
  try {
    const { model, voice_code, display_name, gender, description, is_default } = req.body;
    if (!model || !voice_code || !display_name) {
      return res.status(400).json({ success: false, error: 'Model, Kode Suara, dan Nama Tampilan wajib diisi.' });
    }
    const created = TtsVoiceRepo.create({ model, voice_code, display_name, gender, description, is_default });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update voice
app.put('/api/tts/voices/:id', (req, res) => {
  try {
    const updated = TtsVoiceRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Karakter suara tidak ditemukan.' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Delete voice
app.delete('/api/tts/voices/:id', (req, res) => {
  try {
    TtsVoiceRepo.delete(req.params.id);
    res.json({ success: true, message: 'Karakter suara berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Set voice as default
app.post('/api/tts/voices/:id/default', (req, res) => {
  try {
    const updated = TtsVoiceRepo.setDefault(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Prompt Templates CRUD Routes (SQLite Stored)
// ---------------------------------------------------------------------------

// 1. List all prompt templates
app.get('/api/prompts', (req, res) => {
  try {
    const prompts = PromptTemplateRepo.getAll();
    res.json({ success: true, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get single prompt template by stage_key
app.get('/api/prompts/:stageKey', (req, res) => {
  try {
    const prompt = PromptTemplateRepo.getByKey(req.params.stageKey);
    if (!prompt) return res.status(404).json({ success: false, error: 'Template prompt tidak ditemukan.' });
    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update prompt template
app.put('/api/prompts/:stageKey', (req, res) => {
  try {
    const { name, description } = req.body;
    const prompt_content = req.body.prompt_content || req.body.content;
    if (!prompt_content) {
      return res.status(400).json({ success: false, error: 'Konten instruksi prompt wajib diisi.' });
    }
    const updated = PromptTemplateRepo.update(req.params.stageKey, { name, description, prompt_content });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Reset prompt templates to built-in defaults
app.post('/api/prompts/reset', (req, res) => {
  try {
    const reset = PromptTemplateRepo.resetDefaults();
    res.json({ success: true, message: 'Template prompt berhasil dikembalikan ke standar bawaan.', data: reset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Global App Settings Routes (SQLite Stored)
// ---------------------------------------------------------------------------

// 1. Get settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = SettingsRepo.get();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Update settings
app.put('/api/settings', (req, res) => {
  try {
    const updated = SettingsRepo.update(req.body);
    res.json({ success: true, data: updated });
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
    const audios = AudioRecordingRepo.getByProject(req.params.id);
    res.json({ success: true, data: audios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Audio Mixing & Mastering Suite API (Presets, Upload, Recording, MP3 Convert)
// ---------------------------------------------------------------------------

// 1. Get all audio presets
app.get('/api/audio/presets', (req, res) => {
  try {
    const presets = AudioPresetRepo.getAll();
    res.json({ success: true, data: presets });
  } catch (error) {
    console.error('Error fetching audio presets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Create custom preset
app.post('/api/audio/presets', (req, res) => {
  try {
    const { name, description, settings_json, category } = req.body;
    if (!name || !settings_json) {
      return res.status(400).json({ success: false, error: 'Nama preset dan konfigurasi DSP wajib diisi.' });
    }
    const id = AudioPresetRepo.create({
      name,
      description,
      settings_json,
      category: category || 'custom'
    });
    const created = AudioPresetRepo.getById(id);
    res.json({ success: true, data: created, message: 'Preset mixing & mastering berhasil disimpan.' });
  } catch (error) {
    console.error('Error creating audio preset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update preset
app.put('/api/audio/presets/:id', (req, res) => {
  try {
    const updated = AudioPresetRepo.update(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Preset berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating audio preset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Delete custom preset
app.delete('/api/audio/presets/:id', (req, res) => {
  try {
    AudioPresetRepo.delete(req.params.id);
    res.json({ success: true, message: 'Preset berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting audio preset:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Upload or save recorded/mastered audio
app.post('/api/audio/upload', (req, res) => {
  try {
    const { projectId, base64Data, filename, sourceType, isMastered, presetUsed, durationSeconds, model, voice } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Data audio base64 wajib dikirim.' });
    }

    const cleanBase64 = base64Data.replace(/^data:audio\/[a-zA-Z0-9\-_]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const ext = filename && filename.includes('.') ? filename.split('.').pop().toLowerCase() : (sourceType === 'recording' ? 'wav' : 'mp3');
    const safeExt = ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'webm'].includes(ext) ? ext : 'wav';
    const timestamp = Date.now();
    const prefix = isMastered ? 'mastered' : (sourceType === 'recording' ? 'rec' : 'audio');
    const safeFilename = `${prefix}_${projectId || 'draft'}_${timestamp}.${safeExt}`;
    const targetPath = path.join(publicAudioDir, safeFilename);

    fs.writeFileSync(targetPath, buffer);

    const calcDuration = durationSeconds ? Number(durationSeconds) : Math.round((buffer.length / 44100 / 2) * 10) / 10;
    const audioId = AudioRecordingRepo.add({
      project_id: projectId || 0,
      filename: safeFilename,
      model: model || (isMastered ? `Master (${presetUsed || 'Manual'})` : 'Audio Track'),
      voice: voice || (sourceType === 'recording' ? 'Live Microphone' : 'Uploaded Audio'),
      speed: 1.0,
      duration_seconds: calcDuration,
      source_type: sourceType || (isMastered ? 'mastered' : 'upload'),
      original_filename: filename || safeFilename,
      is_mastered: isMastered ? 1 : 0,
      preset_used: presetUsed || null
    });

    res.json({
      success: true,
      id: audioId,
      filename: safeFilename,
      audio_url: `/audio/${safeFilename}`,
      duration_seconds: calcDuration,
      message: 'Audio berhasil disimpan.'
    });
  } catch (error) {
    console.error('Error saving audio upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. High-Quality MP3 Transcoding (320 kbps broadcast master via FFmpeg)
app.post('/api/audio/convert-mp3', (req, res) => {
  try {
    const { base64Data, filename, projectId, presetUsed, durationSeconds } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Data audio base64 wajib dikirim.' });
    }

    const cleanBase64 = base64Data.replace(/^data:audio\/[a-zA-Z0-9\-_]+;base64,/, '');
    const wavBuffer = Buffer.from(cleanBase64, 'base64');
    const timestamp = Date.now();
    const tempWavName = `temp_${timestamp}.wav`;
    const tempWavPath = path.join(publicAudioDir, tempWavName);
    const outMp3Name = `mastered_${projectId || 'draft'}_${timestamp}.mp3`;
    const outMp3Path = path.join(publicAudioDir, outMp3Name);

    fs.writeFileSync(tempWavPath, wavBuffer);

    // Run FFmpeg 320kbps MP3 conversion
    execSync(`ffmpeg -y -i "${tempWavPath}" -codec:a libmp3lame -b:a 320k "${outMp3Path}"`, {
      stdio: 'pipe'
    });

    // Cleanup temp WAV
    if (fs.existsSync(tempWavPath)) {
      try { fs.unlinkSync(tempWavPath); } catch (e) {}
    }

    const mp3Stats = fs.statSync(outMp3Path);
    const estDuration = durationSeconds ? Number(durationSeconds) : Math.round((mp3Stats.size / 40000) * 10) / 10;

    let audioId = null;
    if (projectId) {
      audioId = AudioRecordingRepo.add({
        project_id: projectId,
        filename: outMp3Name,
        model: `Master (${presetUsed || 'Custom 320k'})`,
        voice: 'Mastered Studio Track',
        speed: 1.0,
        duration_seconds: estDuration,
        source_type: 'mastered',
        original_filename: filename || outMp3Name,
        is_mastered: 1,
        preset_used: presetUsed || null
      });
    }

    res.json({
      success: true,
      id: audioId,
      filename: outMp3Name,
      audio_url: `/audio/${outMp3Name}`,
      duration_seconds: estDuration,
      format: 'MP3 (320 kbps)',
      message: 'Mastering MP3 320 kbps berhasil dibuat.'
    });
  } catch (error) {
    console.error('Error transcoding to MP3:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Get BGM tracks list
app.get('/api/audio/bgm-list', (req, res) => {
  try {
    const files = fs.readdirSync(publicBgmDir).filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f));
    const items = files.map(f => {
      let displayName = f.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      return {
        filename: f,
        name: displayName,
        url: `/audio/bgm/${f}`
      };
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Upload Custom BGM track
app.post('/api/audio/bgm/upload', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, error: 'File BGM dan data base64 wajib diisi.' });
    }
    const cleanBase64 = base64Data.replace(/^data:audio\/[a-zA-Z0-9\-_]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = 'custom_' + Date.now() + '_' + filename.replace(/[^a-zA-Z0-9._-]/g, '');
    fs.writeFileSync(path.join(publicBgmDir, safeName), buffer);

    res.json({
      success: true,
      filename: safeName,
      url: `/audio/bgm/${safeName}`,
      message: 'Musik latar BGM berhasil diunggah.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Delete Audio record & file
app.delete('/api/audio/:id', (req, res) => {
  try {
    const record = AudioRecordingRepo.getById(req.params.id);
    if (record) {
      const filePath = path.join(publicAudioDir, record.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      AudioRecordingRepo.delete(req.params.id);
    }
    res.json({ success: true, message: 'File audio berhasil dihapus.' });
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

// 6. Clone / Duplicate project
app.post('/api/projects/:id/clone', (req, res) => {
  try {
    const cloned = ProjectRepo.clone(req.params.id);
    if (!cloned) {
      return res.status(404).json({ success: false, error: 'Proyek asal tidak ditemukan.' });
    }
    res.status(201).json({ success: true, message: 'Proyek berhasil disalin!', data: cloned });
  } catch (error) {
    console.error('Error cloning project:', error);
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

    const releaseYear = req.body.release_year !== undefined ? req.body.release_year : project.release_year;
    const director = req.body.director !== undefined ? req.body.director : project.director;

    const generationPayload = {
      movieTitle: req.body.title || project.title,
      movieYear: releaseYear,
      movieDirector: director || req.body.director_year || project.director_year,
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
      release_year: releaseYear,
      director: director,
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

// ---------------------------------------------------------------------------
// AI Transcreation & Anti-Duplicate Localization (YouTube Global Content)
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/transcreate', async (req, res) => {
  try {
    const project = ProjectRepo.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan.' });
    }

    const {
      targetLanguage = 'en-US',
      customLanguage = '',
      channelName = 'Movie Recap Hub',
      openingHook = 'Hey movie fans, welcome back!',
      personaStyle = 'engaging_storyteller',
      antiDuplicateLevel = 'ultra',
      saveMode = 'new_project',
      preferredModel = 'auto'
    } = req.body;

    const sourceScript = req.body.source_script || project.script_markdown;
    if (!sourceScript || sourceScript.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Naskah proyek ini masih kosong. Silakan buat naskah terlebih dahulu.' });
    }

    const transResult = await runGeminiTranscreation({
      sourceScript,
      movieTitle: project.title,
      targetLanguage,
      customLanguage,
      channelName,
      openingHook,
      personaStyle,
      antiDuplicateLevel,
      preferredModel
    });

    let newProjectRecord = null;
    if (saveMode === 'new_project') {
      const langLabels = {
        'en-US': 'English US',
        'en-GB': 'English UK',
        'es': 'Español',
        'pt-BR': 'Português',
        'ja': '日本語',
        'de': 'Deutsch',
        'fr': 'Français',
        'ko': '한국어',
        'ar': 'العربية'
      };
      const langSuffix = langLabels[targetLanguage] || customLanguage || 'Global';

      newProjectRecord = ProjectRepo.create({
        title: `${project.title} [${langSuffix}]`,
        director_year: project.director_year,
        synopsis: project.synopsis,
        channel_name: channelName,
        opening_hook: openingHook,
        outro_bridge: 'Thanks for watching, and see you in the next recap!',
        persona_style: personaStyle,
        include_analysis: project.include_analysis,
        enforce_visual_cues: project.enforce_visual_cues,
        script_markdown: transResult.transcreated_markdown,
        word_count: transResult.word_count,
        sources: project.sources || {}
      });
    } else {
      ProjectRepo.update(req.params.id, {
        script_markdown: transResult.transcreated_markdown,
        word_count: transResult.word_count,
        channel_name: channelName,
        opening_hook: openingHook
      });
    }

    res.json({
      success: true,
      transcreatedScript: transResult.transcreated_markdown,
      word_count: transResult.word_count,
      active_model: transResult.active_model,
      saveMode,
      newProject: newProjectRecord,
      message: saveMode === 'new_project'
        ? `Naskah versi ${transResult.target_language} berhasil dibuat sebagai proyek baru!`
        : `Naskah berhasil diperbarui ke versi ${transResult.target_language}!`
    });
  } catch (error) {
    console.error('Error in transcreation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Media Management & Fair-Use Video Slicer Studio (FFmpeg Native + SQLite)
// ---------------------------------------------------------------------------

/**
 * Extract media metadata (duration, resolution, streams) using native ffprobe
 */
function probeMediaFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { duration_seconds: 0, resolution: '', file_size: 0, hasVideo: false, hasAudio: false };
    }
    const fileSize = fs.statSync(filePath).size;
    const stdout = execSync(`ffprobe -v error -show_entries stream=width,height,codec_type,duration -show_entries format=duration,size -of json "${filePath}"`, {
      encoding: 'utf8',
      timeout: 15000,
      windowsHide: true
    });
    const parsed = JSON.parse(stdout || '{}');
    let duration = 0;
    if (parsed.format && parsed.format.duration) {
      duration = parseFloat(parsed.format.duration) || 0;
    }
    let resolution = '';
    let hasVideo = false;
    let hasAudio = false;

    if (Array.isArray(parsed.streams)) {
      for (const st of parsed.streams) {
        if (st.codec_type === 'video') {
          if (st.duration && parseFloat(st.duration) > 0) {
            duration = parseFloat(st.duration);
          }
          if (st.width && st.height && !resolution) {
            resolution = `${st.width}x${st.height}`;
            hasVideo = true;
          }
        }
        if (st.codec_type === 'audio') {
          hasAudio = true;
        }
      }
    }

    return {
      duration_seconds: Math.round(duration * 100) / 100,
      resolution,
      file_size: Number(fileSize),
      hasVideo,
      hasAudio
    };
  } catch (err) {
    console.warn(`[ffprobe] Gagal membaca metadata ${filePath}:`, err.message);
    const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    return {
      duration_seconds: 0,
      resolution: '',
      file_size: size,
      hasVideo: false,
      hasAudio: false
    };
  }
}

// 1. List all media with optional filters
app.get('/api/media', (req, res) => {
  try {
    const { projectId, fileType, category, search } = req.query;
    const items = MediaRepo.getAll({ projectId, fileType, category, search });
    res.json({ success: true, data: items, count: items.length });
  } catch (error) {
    console.error('Error fetching media list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Media storage stats
app.get('/api/media/stats', (req, res) => {
  try {
    const stats = MediaRepo.getStats(req.query.projectId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching media stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get single media item
app.get('/api/media/:id', (req, res) => {
  try {
    const item = MediaRepo.getById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'File media tidak ditemukan.' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3b. Direct Media Download Endpoint with Content-Disposition Attachment
app.get('/api/media/:id/download', (req, res) => {
  try {
    const item = MediaRepo.getById(req.params.id);
    if (!item) {
      return res.status(404).send('File media tidak ditemukan di database.');
    }
    let filePath = null;
    if (item.file_url.startsWith('/videos/raw/')) {
      filePath = path.join(publicVideosRawDir, item.filename);
    } else if (item.file_url.startsWith('/videos/processed/')) {
      filePath = path.join(publicVideosProcessedDir, item.filename);
    } else if (item.file_url.startsWith('/audio/')) {
      filePath = path.join(publicAudioDir, item.filename);
    } else {
      filePath = path.join(__dirname, 'public', item.file_url.replace(/^\//, ''));
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File fisik tidak ditemukan pada disk penyimpanan.');
    }

    let downloadName = item.original_name || item.filename;
    if (!path.extname(downloadName)) {
      downloadName += path.extname(item.filename) || '.mp4';
    }

    res.download(filePath, downloadName);
  } catch (err) {
    console.error('Error downloading media:', err);
    res.status(500).send('Gagal mengunduh file media.');
  }
});

// 4. Upload raw video or audio file
app.post('/api/media/upload', uploadMedia.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Tidak ada file yang diunggah.' });
    }

    const { projectId = 0, category = 'raw_footage', tags = '', notes = '' } = req.body;
    const filePath = req.file.path;
    const isVideo = req.file.mimetype.startsWith('video/') || /\.(mp4|mkv|webm|mov|avi|flv|wmv|m4v)$/i.test(req.file.originalname);
    const isAudio = req.file.mimetype.startsWith('audio/') || /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(req.file.originalname);

    const probed = probeMediaFile(filePath);
    const fileType = isVideo ? 'video' : (isAudio ? 'audio' : 'other');
    const relativeUrl = isVideo ? `/videos/raw/${req.file.filename}` : `/audio/${req.file.filename}`;

    const record = MediaRepo.create({
      project_id: projectId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_type: fileType,
      category: category || (isVideo ? 'raw_footage' : 'audio_misc'),
      file_size: probed.file_size || req.file.size,
      duration_seconds: probed.duration_seconds || 0,
      resolution: probed.resolution || '',
      mime_type: req.file.mimetype,
      file_url: relativeUrl,
      tags: tags || (isVideo ? 'video, mentah' : 'audio'),
      notes: notes || `Diunggah manual pada ${new Date().toLocaleString('id-ID')}`
    });

    res.status(201).json({
      success: true,
      data: record,
      message: `File "${req.file.originalname}" berhasil disimpan dan dicatat di database SQLite.`
    });
  } catch (error) {
    console.error('Error in media upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Fair-Use Video Slicer (Ambil X detik, Buang Y detik) via native FFmpeg
app.post('/api/media/slice-video', uploadMedia.single('file'), async (req, res) => {
  try {
    const keep = Math.max(1, parseInt(req.body.keepSeconds, 10) || 3);
    const skip = Math.max(1, parseInt(req.body.skipSeconds, 10) || 10);
    const period = keep + skip;
    const muteAudio = req.body.muteAudio === 'true' || req.body.muteAudio === true || req.body.muteAudio === undefined;
    const mirror = req.body.mirror === 'true' || req.body.mirror === true;
    const speed = Math.max(0.5, Math.min(2.0, parseFloat(req.body.speed) || 1.0));
    const projectId = Number(req.body.projectId || 0);

    let inputPath = null;
    let originalName = 'video.mp4';
    let sourceMediaRecord = null;

    if (req.file) {
      // Direct file upload into slicer
      inputPath = req.file.path;
      originalName = req.file.originalname;

      // Register raw video into MediaRepo if not exists
      try {
        const rawProbed = probeMediaFile(inputPath);
        sourceMediaRecord = MediaRepo.create({
          project_id: projectId || 0,
          filename: req.file.filename,
          original_name: originalName,
          file_type: 'video',
          category: 'raw_footage',
          file_size: rawProbed.file_size || req.file.size,
          duration_seconds: rawProbed.duration_seconds || 0,
          resolution: rawProbed.resolution || '1080p',
          mime_type: req.file.mimetype || 'video/mp4',
          file_url: `/videos/raw/${req.file.filename}`,
          tags: 'uploaded, raw footage',
          notes: `Video sumber diunggah langsung ke Slicer.`
        });
      } catch (errReg) {
        console.warn('[Slicer] Info registrasi raw video:', errReg.message);
      }
    } else if (req.body.mediaId) {
      // Existing video from File Manager
      sourceMediaRecord = MediaRepo.getById(req.body.mediaId);
      if (!sourceMediaRecord) {
        return res.status(404).json({ success: false, error: 'Video sumber tidak ditemukan di database.' });
      }
      originalName = sourceMediaRecord.original_name;
      // Resolve path
      if (sourceMediaRecord.file_url.startsWith('/videos/raw/')) {
        inputPath = path.join(publicVideosRawDir, sourceMediaRecord.filename);
      } else if (sourceMediaRecord.file_url.startsWith('/videos/processed/')) {
        inputPath = path.join(publicVideosProcessedDir, sourceMediaRecord.filename);
      } else {
        inputPath = path.join(__dirname, 'public', sourceMediaRecord.file_url.replace(/^\//, ''));
      }
    } else if (req.body.videoPath) {
      inputPath = path.resolve(__dirname, req.body.videoPath.replace(/^\//, ''));
      originalName = path.basename(inputPath);
    }

    if (!inputPath || !fs.existsSync(inputPath)) {
      return res.status(400).json({ success: false, error: 'File video sumber tidak ditemukan atau belum dipilih.' });
    }

    // Inspect source metadata
    const sourceProbed = probeMediaFile(inputPath);

    // Prepare output filename
    const cleanBase = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 40);
    const outFilename = `sliced_${keep}s_${skip}s_${cleanBase}_${Date.now()}.mp4`;
    const outputPath = path.join(publicVideosProcessedDir, outFilename);

    // Construct FFmpeg select filter
    // Video: select='lt(mod(t\,period)\,keep)'
    let videoFilters = [`select='lt(mod(t\\,${period})\\,${keep})'`];
    if (mirror) {
      videoFilters.push('hflip');
    }
    if (speed !== 1.0) {
      const speedFactor = (1.0 / speed).toFixed(4);
      videoFilters.push(`setpts=${speedFactor}*N/FRAME_RATE/TB`);
    } else {
      videoFilters.push('setpts=N/FRAME_RATE/TB');
    }

    const ffmpegArgs = [
      '-y',
      '-threads', '0',
      '-i', inputPath,
      '-vf', videoFilters.join(','),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p'
    ];

    if (muteAudio) {
      ffmpegArgs.push('-an');
    } else {
      let audioFilters = [
        `aselect='lt(mod(t\\,${period})\\,${keep})'`,
        'asetpts=N/SR/TB',
        'aresample=async=1000:first_pts=0'
      ];
      if (speed !== 1.0) {
        audioFilters.push(`atempo=${speed.toFixed(2)}`);
      }
      ffmpegArgs.push('-af', audioFilters.join(','), '-c:a', 'aac', '-b:a', '192k', '-shortest');
    }

    ffmpegArgs.push(outputPath);

    console.log(`[FFmpeg Slicer] Memproses video: ${inputPath} -> ${outputPath}`);
    console.log(`[FFmpeg Slicer] Parameter: Ambil ${keep}s, Lewati ${skip}s (Siklus ${period}s), Mute: ${muteAudio}, Mirror: ${mirror}, Speed: ${speed}x`);

    // Run FFmpeg in spawn process
    await new Promise((resolve, reject) => {
      const proc = spawn('ffmpeg', ffmpegArgs, { windowsHide: true });
      let stderrData = '';
      proc.stderr.on('data', chunk => {
        stderrData += chunk.toString();
      });
      proc.on('close', code => {
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve(true);
        } else {
          console.error('[FFmpeg Error Output]:', stderrData.slice(-1000));
          reject(new Error(`FFmpeg slicing gagal dengan kode keluar ${code}. Detail: ${stderrData.slice(-400)}`));
        }
      });
      proc.on('error', err => reject(err));
    });

    // Probe the sliced result
    const slicedProbed = probeMediaFile(outputPath);

    // Save record to SQLite
    const slicedRecord = MediaRepo.create({
      project_id: projectId,
      filename: outFilename,
      original_name: req.body.customName || `✂️ Sliced (${keep}s/${skip}s) - ${originalName}`,
      file_type: 'video',
      category: 'footage_sliced',
      file_size: slicedProbed.file_size,
      duration_seconds: slicedProbed.duration_seconds,
      resolution: slicedProbed.resolution || sourceProbed.resolution,
      mime_type: 'video/mp4',
      file_url: `/videos/processed/${outFilename}`,
      tags: `sliced, ${keep}s-${skip}s, fair-use${mirror ? ', mirror' : ''}`,
      notes: `Montage fair-use: ambil ${keep}s, buang ${skip}s secara otomatis. Durasi: ${sourceProbed.duration_seconds}s -> ${slicedProbed.duration_seconds}s.`
    });

    res.json({
      success: true,
      data: slicedRecord,
      summary: {
        source_name: originalName,
        source_duration: sourceProbed.duration_seconds,
        sliced_duration: slicedProbed.duration_seconds,
        time_saved_percent: sourceProbed.duration_seconds > 0
          ? Math.round((1 - (slicedProbed.duration_seconds / sourceProbed.duration_seconds)) * 100)
          : 0,
        keep_seconds: keep,
        skip_seconds: skip,
        mirror,
        mute_audio: muteAudio,
        speed
      },
      message: `Berhasil memotong video! Durasi terpangkas menjadi ${slicedProbed.duration_seconds} detik montage fair-use.`
    });

  } catch (error) {
    console.error('Error slicing video:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Update media metadata (Name, Category, Tags, Notes)
app.put('/api/media/:id', (req, res) => {
  try {
    const updated = MediaRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'File media tidak ditemukan.' });
    res.json({ success: true, data: updated, message: 'Metadata media berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Delete media file & DB record
app.delete('/api/media/:id', (req, res) => {
  try {
    const item = MediaRepo.getById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'File media tidak ditemukan.' });

    // Try deleting physical file on disk
    let diskPath = null;
    if (item.file_url) {
      if (item.file_url.startsWith('/videos/raw/')) {
        diskPath = path.join(publicVideosRawDir, item.filename);
      } else if (item.file_url.startsWith('/videos/processed/')) {
        diskPath = path.join(publicVideosProcessedDir, item.filename);
      } else if (item.file_url.startsWith('/audio/')) {
        diskPath = path.join(publicAudioDir, item.filename);
      }
    }

    if (diskPath && fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
        console.log(`[Media Delete] File fisik dihapus: ${diskPath}`);
      } catch (e) {
        console.warn(`[Media Delete] Gagal menghapus file fisik ${diskPath}:`, e.message);
      }
    }

    MediaRepo.delete(req.params.id);
    res.json({ success: true, message: `File "${item.original_name}" berhasil dihapus dari database dan penyimpanan.` });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// AI Cut Scene Detector: Analisis Subtitle / Dialog Film & Batch Cut FFmpeg
// ---------------------------------------------------------------------------

function timeStringToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]) || 0;
    const m = parseFloat(parts[1]) || 0;
    const s = parseFloat(parts[2]) || 0;
    return Math.round((h * 3600 + m * 60 + s) * 1000) / 1000;
  }
  return 0;
}

function parseSrtContent(srtText) {
  if (!srtText || typeof srtText !== 'string') return [];
  const normalized = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const entries = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    let timeLineIdx = 1;
    if (lines[0].includes('-->')) {
      timeLineIdx = 0;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
    const startSec = timeStringToSeconds(startStr);
    const endSec = timeStringToSeconds(endStr);
    const text = lines.slice(timeLineIdx + 1).join(' ').replace(/<[^>]*>/g, '').trim();

    if (text && endSec > startSec) {
      entries.push({
        id: entries.length + 1,
        startTime: startStr.replace(',', '.'),
        endTime: endStr.replace(',', '.'),
        startSec,
        endSec,
        duration: Math.round((endSec - startSec) * 10) / 10,
        text
      });
    }
  }
  return entries;
}

// 8. Analyze SRT Subtitle for Important Cut Scenes using Gemini
app.post('/api/media/ai-analyze-srt', uploadMedia.single('file'), async (req, res) => {
  try {
    let srtText = '';
    const movieTitle = req.body.movieTitle || 'Film';
    const focusHint = req.body.focusHint || '';
    const maxClips = req.body.maxClips || 'all';
    const maxDurationSeconds = parseFloat(req.body.maxDurationSeconds) || 5.0;
    const preferredModel = req.body.preferredModel || 'auto';

    if (req.file) {
      srtText = fs.readFileSync(req.file.path, 'utf8');
    } else if (req.body.srtText) {
      srtText = req.body.srtText;
    } else if (req.body.mediaId) {
      // Try extracting embedded subtitle stream from video using ffmpeg
      const source = MediaRepo.getById(req.body.mediaId);
      if (source && source.file_url) {
        let videoDiskPath = '';
        if (source.file_url.startsWith('/videos/raw/')) {
          videoDiskPath = path.join(publicVideosRawDir, source.filename);
        } else if (source.file_url.startsWith('/videos/processed/')) {
          videoDiskPath = path.join(publicVideosProcessedDir, source.filename);
        }

        if (fs.existsSync(videoDiskPath)) {
          try {
            console.log(`[FFmpeg] Mencoba mengekstrak subtitle embedded dari: ${videoDiskPath}...`);
            const extracted = execSync(`ffmpeg -y -i "${videoDiskPath}" -map 0:s:0 -f srt -`, {
              encoding: 'utf8',
              timeout: 15000,
              windowsHide: true
            });
            if (extracted && extracted.trim().length > 50) {
              srtText = extracted;
            }
          } catch (subErr) {
            console.log('[FFmpeg] Video tidak memiliki stream subtitle internal, menunggu file SRT upload.');
          }
        }
      }
    }

    if (!srtText || srtText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'File atau teks subtitle (.SRT / .VTT) tidak ditemukan atau kosong. Silakan unggah file subtitle film terlebih dahulu.'
      });
    }

    const srtEntries = parseSrtContent(srtText);
    if (srtEntries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Format subtitle tidak valid. Pastikan file memiliki timecode (00:00:00 --> 00:00:00).'
      });
    }

    const aiResult = await analyzeSrtForCutScenes({
      srtEntries,
      movieTitle,
      focusHint,
      maxClips,
      maxDurationSeconds,
      preferredModel
    });

    res.json({
      success: true,
      data: aiResult,
      total_subtitles_analyzed: srtEntries.length,
      message: `Gemini berhasil mengidentifikasi ${aiResult.scenes.length} adegan kunci untuk dipotong jadi cut-scene!`
    });
  } catch (error) {
    console.error('Error analyzing SRT for cut scenes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Batch Cut Video Scenes via FFmpeg
app.post('/api/media/ai-batch-cut', async (req, res) => {
  try {
    const { 
      mediaId, 
      videoPath, 
      scenes, 
      muteAudio = false, 
      mirror = false, 
      speed = 1.0, 
      projectId = 0,
      audioPadding = true,
      audioFade = true,
      paddingSeconds = 0.5
    } = req.body;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar adegan yang akan dipotong tidak boleh kosong.' });
    }

    let inputPath = null;
    let sourceMediaRecord = null;

    if (mediaId) {
      sourceMediaRecord = MediaRepo.getById(mediaId);
      if (sourceMediaRecord) {
        if (sourceMediaRecord.file_url.startsWith('/videos/raw/')) {
          inputPath = path.join(publicVideosRawDir, sourceMediaRecord.filename);
        } else if (sourceMediaRecord.file_url.startsWith('/videos/processed/')) {
          inputPath = path.join(publicVideosProcessedDir, sourceMediaRecord.filename);
        } else {
          inputPath = path.join(__dirname, 'public', sourceMediaRecord.file_url.replace(/^\//, ''));
        }
      }
    } else if (videoPath) {
      inputPath = path.resolve(__dirname, videoPath.replace(/^\//, ''));
    }

    if (!inputPath || !fs.existsSync(inputPath)) {
      return res.status(400).json({ success: false, error: 'File video sumber tidak ditemukan untuk dipotong.' });
    }

    const createdClips = [];

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      const rawStart = Math.max(0, parseFloat(sc.start_seconds) || 0);
      let rawEnd = parseFloat(sc.end_seconds) || (rawStart + 2.8);
      if (rawEnd <= rawStart) rawEnd = rawStart + 2.0;
      
      // Batas durasi cut-scene (default: hingga 4.85 detik, atau 2.85 detik jika mode ketat dipilih)
      const maxAllowed = Math.max(2.85, Math.min(6.0, parseFloat(req.body.maxDurationSeconds) || 5.0));
      const upperCap = maxAllowed <= 3.0 ? 2.85 : 4.85;

      let startSec = rawStart;
      let endSec = rawEnd;

      // Smart Padding (Buffer Audio Dialog ±0.5s sebelum dan sesudah)
      if (audioPadding) {
        const pad = Math.max(0.1, Math.min(1.0, parseFloat(paddingSeconds) || 0.5));
        const rawDur = rawEnd - rawStart;
        if (rawDur >= upperCap) {
          const excess = rawDur - upperCap;
          startSec = Math.max(0, rawStart + (excess / 2));
          endSec = startSec + upperCap;
        } else {
          const availablePad = upperCap - rawDur;
          const padBefore = Math.min(pad, availablePad / 2);
          const padAfter = Math.min(pad, availablePad - padBefore);
          startSec = Math.max(0, rawStart - padBefore);
          endSec = rawEnd + padAfter;
          if ((endSec - startSec) > upperCap) endSec = startSec + upperCap;
        }
      } else {
        if ((endSec - startSec) > upperCap) {
          endSec = Math.round((startSec + upperCap) * 100) / 100;
        } else if ((endSec - startSec) < 0.5) {
          endSec = Math.round((startSec + 2.0) * 100) / 100;
        }
      }

      startSec = Math.round(startSec * 100) / 100;
      endSec = Math.round(endSec * 100) / 100;
      const duration = Math.round((endSec - startSec) * 100) / 100;

      const cleanTitle = (sc.title || `Clip_${i+1}`).replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 30);
      const outFilename = `cutscene_${i+1}_${cleanTitle}_${Date.now()}.mp4`;
      const outputPath = path.join(publicVideosProcessedDir, outFilename);

      // Construct FFmpeg command
      let videoFilters = [];
      if (mirror) videoFilters.push('hflip');
      if (speed && speed !== 1.0) {
        const speedFactor = (1.0 / speed).toFixed(4);
        videoFilters.push(`setpts=${speedFactor}*PTS`);
      }

      const args = [
        '-y',
        '-ss', startSec.toString(),
        '-to', endSec.toString(),
        '-i', inputPath
      ];

      if (videoFilters.length > 0) {
        args.push('-vf', videoFilters.join(','));
      }

      args.push(
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '22',
        '-pix_fmt', 'yuv420p'
      );

      if (muteAudio) {
        args.push('-an');
      } else {
        let audioFilters = [];
        if (speed && speed !== 1.0) {
          audioFilters.push(`atempo=${speed.toFixed(2)}`);
        }
        if (audioFade && duration >= 0.5) {
          // Micro audio fade-in & fade-out (0.08s = 80ms) to prevent pop/click noise
          const fadeDur = Math.min(0.08, duration / 8);
          const fadeOutStart = Math.max(0, duration - fadeDur);
          audioFilters.push(`afade=t=in:ss=0:d=${fadeDur.toFixed(3)}`);
          audioFilters.push(`afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${fadeDur.toFixed(3)}`);
        }
        if (audioFilters.length > 0) {
          args.push('-af', audioFilters.join(','));
        }
        args.push('-c:a', 'aac', '-b:a', '192k');
      }

      args.push(outputPath);

      console.log(`[FFmpeg Batch Cut #${i+1}] Memotong: ${startSec}s -> ${endSec}s (${duration}s, pad: ${audioPadding}, fade: ${audioFade}) ke ${outFilename}`);

      await new Promise((resolve) => {
        const proc = spawn('ffmpeg', args, { windowsHide: true });
        let stderr = '';
        proc.stderr.on('data', d => stderr += d.toString());
        proc.on('close', code => {
          if (code === 0 && fs.existsSync(outputPath)) {
            resolve(true);
          } else {
            console.warn(`[FFmpeg Cut Error Klip #${i+1}]:`, stderr.slice(-400));
            resolve(false);
          }
        });
        proc.on('error', () => resolve(false));
      });

      if (fs.existsSync(outputPath)) {
        const probed = probeMediaFile(outputPath);
        const record = MediaRepo.create({
          project_id: projectId || (sourceMediaRecord ? sourceMediaRecord.project_id : 0),
          filename: outFilename,
          original_name: `🎬 Cut Scene #${sc.clip_number || (i+1)} - ${sc.title || 'Adegan Kunci'}`,
          file_type: 'video',
          category: 'cut_scene',
          file_size: probed.file_size,
          duration_seconds: probed.duration_seconds || duration,
          resolution: probed.resolution || 'HD',
          mime_type: 'video/mp4',
          file_url: `/videos/processed/${outFilename}`,
          tags: `cut_scene, ai_gemini, dialog${mirror ? ', mirror' : ''}`,
          notes: `${sc.dialogue || ''} — ${sc.reason || ''}`
        });
        createdClips.push(record);
      }
    }

    res.json({
      success: true,
      clips: createdClips,
      total_requested: scenes.length,
      total_created: createdClips.length,
      message: `Berhasil memotong ${createdClips.length} klip cut scene dengan AI Gemini & FFmpeg!`
    });
  } catch (error) {
    console.error('Error in batch cut:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global Error Handler Middleware (Multer, File Size Limits & Unhandled Server Errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.warn(`[Multer] File upload melebihi batas: ${err.message}`);
      return res.status(413).json({
        success: false,
        error: 'Ukuran file video terlalu besar (melebihi batas sistem 10GB). Silakan gunakan file video dengan resolusi standar atau pilih file yang sudah ada di File Manager.'
      });
    }
    console.warn(`[Multer] Upload error (${err.code}):`, err.message);
    return res.status(400).json({
      success: false,
      error: `Gagal mengunggah file (${err.code}): ${err.message}`
    });
  }

  if (err) {
    console.error('[Server Error] Unhandled error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Terjadi kesalahan internal pada server.'
    });
  }

  next();
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
