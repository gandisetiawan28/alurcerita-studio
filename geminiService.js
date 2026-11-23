/**
 * AlurCerita Studio — Multi-Agent AI Script Generation Service
 * Powered exclusively by Google Gemini API (@google/generative-ai)
 * 
 * STRICT MODEL SPECIFICATION (Wajib 8 Model Resmi):
 * 1. Gemini 2.5 Flash
 * 2. Gemini 2.5 Flash Lite
 * 3. Gemini 3 Flash
 * 4. Gemini 3.1 Flash Lite
 * 5. Gemini 3.6 Flash
 * 6. Gemini 3.5 Flash Lite
 * 7. Gemini 3.8 Flash
 * 8. Gemini 4 Hydrogen
 * 
 * Implements Smart Auto-Fallback:
 * - Automatic failover if model fails, server busy (503), quota limit (429), or overloaded
 * - Combined with SQLite Smart Round-Robin API Key rotation & health tracking
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiKeyRepo, PersonaRepo, PromptTemplateRepo, SettingsRepo } = require('./db');

// Katalog Resmi 8 Model Gemini (Wajib Tidak Ada Yang Lain)
const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'flash', desc: 'Cepat, seimbang & cerdas (Prioritas Utama)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'lite', desc: 'Ultra-ringan & efisien' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', tier: 'flash', desc: 'Generasi 3.0 penalaran tinggi' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tier: 'lite', desc: 'Generasi 3.1 respons kilat & hemat token' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', tier: 'flash', desc: 'Generasi 3.6 presisi struktur naskah' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', tier: 'lite', desc: 'Generasi 3.5 hemat kuota harian' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tier: 'flash', desc: 'Generasi 3.8 multitasking performa tinggi' },
  { id: 'gemini-4-hydrogen', name: 'Gemini 4 Hydrogen', tier: 'flagship', desc: 'Generasi 4 Hydrogen ultra flagship' }
];

/**
 * Menyusun urutan model fallback secara pintar:
 * Model pilihan ditaruh di awal, disusul model resmi lainnya sebagai jaring pengaman failover.
 */
function getModelSequence(preferredModel = 'auto') {
  const allowed = [...GEMINI_MODELS];
  if (!preferredModel || preferredModel === 'auto') {
    return allowed;
  }
  const matchIdx = allowed.findIndex(m => m.id === preferredModel || m.name.toLowerCase() === preferredModel.toLowerCase());
  if (matchIdx !== -1) {
    const chosen = allowed[matchIdx];
    const rest = allowed.filter((_, idx) => idx !== matchIdx);
    return [chosen, ...rest];
  }
  return allowed;
}

/**
 * Membersihkan kata pengantar, basa-basi, atau chit-chat AI (seperti "Tentu, Nakama! Siap-siap...")
 * Memastikan output naskah 100% murni langsung dimulai dari judul atau adegan pembuka.
 */
function stripAiConversationalPreamble(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text.trim();

  // Strip Markdown code fences ```markdown ... ```
  cleaned = cleaned.replace(/^```(?:markdown)?\s*\r?\n/i, '').replace(/\r?\n```\s*$/i, '').trim();

  // Pattern 1: Leading conversational paragraphs (Tentu, Siap-siap, Baik, Berikut, dll)
  const preambleRegex = /^(?:Tentu|Baik|Siap|Tentu saja|Berikut|Ini dia)[^\n]*?(?:satukan|naskah|alur cerita|kepala lu|permintaan|lu minta|versi|buatkan|simak|ngampleh)[^\n]*(\r?\n)+([\s\*\-_]*\r?\n)*/i;
  while (preambleRegex.test(cleaned)) {
    cleaned = cleaned.replace(preambleRegex, '').trim();
  }

  // Pattern 2: Any conversational chatter before script headings, [OPENING], or visual note
  const scriptStartMatch = cleaned.match(/(?:^|\n)(#\s+[^\n]+|##\s*\[[^\n]+|\[OPENING\]|\(Visual:[^\n]+)/i);
  if (scriptStartMatch && scriptStartMatch.index > 0 && scriptStartMatch.index < 500) {
    const priorText = cleaned.substring(0, scriptStartMatch.index).trim();
    if (/tentu|siap|satukan|naskah|ngampleh|minta|gua udah|berikut adalah|versi/i.test(priorText)) {
      cleaned = cleaned.substring(scriptStartMatch.index).trim();
    }
  }

  // Pattern 3: Stray markdown separators (*, ***, ---) at the very start
  cleaned = cleaned.replace(/^[\*\-_]{1,5}\s*(\r?\n)+/m, '').trim();
  return cleaned;
}

/**
 * Live test kunci API terhadap 8 Model Gemini Resmi dengan smart auto-fallback
 */
async function testGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
    return { success: false, error: 'Format kunci API tidak valid (minimal 15 karakter).' };
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const models = getModelSequence('auto');
  const errors = [];

  for (const modelDef of models) {
    try {
      console.log(`🧪 Menguji koneksi Gemini API dengan model ${modelDef.name} (${modelDef.id})...`);
      const model = genAI.getGenerativeModel({ model: modelDef.id });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Ping. Balas satu kata: SIAP.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      const text = result.response.text();
      return {
        success: true,
        modelUsed: modelDef.name,
        message: `Berhasil terhubung ke Google Gemini via ${modelDef.name}! Respons: "${text.trim()}"`
      };
    } catch (error) {
      console.warn(`⚠️ [Test Key] Model ${modelDef.name} gagal (${error.message}). Mencoba model cadangan...`);
      errors.push(`${modelDef.name}: ${error.message}`);
    }
  }

  return {
    success: false,
    error: `Semua 8 model Gemini gagal diuji pada kunci ini: ${errors[0] || 'Koneksi gagal atau kuota limit'}`
  };
}

/**
 * Pemanggil Gemini AI Pintar dengan Auto-Fallback Model & Rotasi Kunci API:
 * 1. Mencoba model pilihan pertama kali.
 * 2. Jika gagal karena server busy (503), kuota penuh/limit habis (429), atau error, otomatis beralih ke model berikutnya dari 8 model resmi.
 * 3. Jika seluruh 8 model gagal pada satu kunci, beralih ke kunci cadangan di database SQLite.
 */
async function callGeminiSmartStage(prompt, stageName, preferredModel = 'auto', options = {}) {
  const triedKeyIds = [];
  let lastError = null;
  const modelChain = getModelSequence(preferredModel);

  const generationConfig = {
    maxOutputTokens: options.maxOutputTokens || 8192,
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {})
  };

  while (true) {
    const keyRecord = ApiKeyRepo.getNextSmartKey(triedKeyIds);
    if (!keyRecord) {
      // Coba fallback ke process.env.GEMINI_API_KEY jika tidak ada key di database
      if (triedKeyIds.length === 0 && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.includes('YOUR_GEMINI')) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        for (const modelDef of modelChain) {
          try {
            console.log(`🔑 Menggunakan GEMINI_API_KEY (.env) dengan model ${modelDef.name} untuk ${stageName}...`);
            const model = genAI.getGenerativeModel({ model: modelDef.id, generationConfig });
            const result = await model.generateContent(prompt);
            return {
              text: result.response.text(),
              keyInfo: 'Environment Key (.env)',
              modelId: modelDef.id,
              modelName: modelDef.name
            };
          } catch (envErr) {
            console.warn(`⚠️ [.env] Model ${modelDef.name} gagal (${envErr.message}). Fallback ke model berikutnya...`);
            lastError = envErr;
          }
        }
      }

      if (triedKeyIds.length > 0) {
        throw new Error(`Semua Kunci API & 8 Model Gemini (${triedKeyIds.length} key diuji) sedang sibuk/limit (429/503): ${lastError?.message || 'Gagal'}`);
      }
      return null; // Tidak ada kunci sama sekali -> trigger local fallback
    }

    triedKeyIds.push(keyRecord.id);
    console.log(`🤖 [Smart Round-Robin] Memakai Key #${keyRecord.id} [${keyRecord.label || 'Gemini'}] (${keyRecord.masked_key}) untuk ${stageName}...`);

    const genAI = new GoogleGenerativeAI(keyRecord.key_value);

    // Coba setiap model dalam 8 Model Gemini Resmi dengan urutan prioritas pintar
    for (const modelDef of modelChain) {
      try {
        console.log(`🚀 [Smart Model Routing] Mencoba ${modelDef.name} (${modelDef.id}) untuk ${stageName}...`);
        const model = genAI.getGenerativeModel({ model: modelDef.id, generationConfig });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Rekam penggunaan sukses di SQLite
        ApiKeyRepo.recordUsage(keyRecord.id, true);
        console.log(`✅ [Sukses] ${stageName} berhasil diselesaikan dengan ${modelDef.name} via Key #${keyRecord.id}`);

        return {
          text,
          keyInfo: `${keyRecord.label || 'Key'} (${keyRecord.masked_key})`,
          modelId: modelDef.id,
          modelName: modelDef.name
        };
      } catch (error) {
        lastError = error;
        const errStr = error.message || '';
        const isQuotaOrBusy = errStr.includes('429') || errStr.includes('503') || errStr.includes('ResourceExhausted') || errStr.includes('quota') || errStr.includes('overloaded');
        console.warn(`⚠️ [Auto-Fallback] Model ${modelDef.name} gagal (${isQuotaOrBusy ? 'Server Busy/Limit Habis' : errStr.slice(0, 90)}). Beralih pintar ke model berikutnya...`);
      }
    }

    // Jika seluruh 8 model gagal pada kunci ini, catat error pada kunci dan failover ke kunci berikutnya
    ApiKeyRepo.recordUsage(keyRecord.id, false, lastError?.message);
    console.warn(`🔄 Key #${keyRecord.id} gagal di semua 8 model. Failover otomatis ke Kunci API berikutnya di database...`);
  }
}

async function runGeminiGeneration(data) {
  const {
    movieTitle = 'Film Tanpa Judul',
    movieYear = '',
    movieDirector = '',
    movieDescription = '',
    channelName = 'AAAlur Cerita',
    openingHook = 'Halo Nakama',
    outroBridge = 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
    personaStyle = 'teman_ngopi',
    includeAnalysis = true,
    enforceVisualCues = true,
    sources = {},
    preferredModel = 'auto'
  } = data;

  const sourceTexts = Object.entries(sources)
    .filter(([_, text]) => text && text.trim().length > 0)
    .map(([key, text], idx) => `=== SUMBER ${idx + 1} (${key.toUpperCase()}) ===\n${text.trim()}`)
    .join('\n\n');

  // Ambil Persona & Tone Instruction dari Database SQLite
  const personaRecord = PersonaRepo.getByKey(personaStyle) || PersonaRepo.getByKey('teman_ngopi');
  const personaPrompt = personaRecord ? personaRecord.tone_prompt : 'Persona: Santai layaknya teman ngopi, pakai "Lo-Gue", alami dan asik.';

  // -------------------------------------------------------------------------
  // STAGE 1: Lead Scriptwriter Agent (Chronological Merger + Visual Cues)
  // -------------------------------------------------------------------------
  const stage1Template = PromptTemplateRepo.getByKey('stage1_story')
  let stage1Prompt = '';
  if (stage1Template && stage1Template.prompt_content) {
    stage1Prompt = stage1Template.prompt_content
      .replace(/{{channelName}}/g, channelName)
      .replace(/{{movieTitle}}/g, movieTitle)
      .replace(/{{releaseYear}}/g, movieYear || 'Tidak disebutkan')
      .replace(/{{movieDirector}}/g, movieDirector || 'Tidak disebutkan')
      .replace(/{{synopsis}}/g, movieDescription || 'Tidak ada sinopsis ringkas.')
      .replace(/{{openingHook}}/g, openingHook)
      .replace(/{{outroBridge}}/g, outroBridge)
      .replace(/{{personaPrompt}}/g, personaPrompt);
    stage1Prompt += `\n\nData Sumber Narasi:\n${sourceTexts}\n\n${enforceVisualCues ? 'Catatan Tambahan: WAJIB menyisipkan tag (Visual: ...) di setiap adegan penting.' : ''}

ATURAN MUTLAK ANTI-SPOILER:
- DILARANG KERAS membocorkan spoiler, plot twist, rahasia/kebohongan karakter, atau akhir cerita di bagian Opening/Hook atau di Part-part awal cerita!
- DILARANG menggunakan gaya narasi pembocor masa depan ("foreshadowing spoiler"), contoh terlarang: "Tapi nanti kita tahu nih kalau dia ini sebenarnya banyak bohongnya", "Yang nantinya bakal mati", atau "Ternyata dia penjahatnya".
- Alur cerita WAJIB dituturkan secara KRONOLOGIS MURNI (Linear Storytelling). Rahasia atau kedok karakter HANYA BOLEH diungkapkan ketika alur adegan film tersebut memang sudah sampai di titik pengungkapan resminya. Biarkan penonton menikmati ketegangan cerita langkah demi langkah tanpa spoiler awal!`;
  } else {
    stage1Prompt = `
Anda adalah Lead Scriptwriter profesional untuk channel YouTube alur cerita film "${channelName}".
${personaPrompt}

Informasi Film:
- Judul: ${movieTitle}
- Tahun Rilis: ${movieYear || 'Tidak disebutkan'}
- Sutradara: ${movieDirector || 'Tidak disebutkan'}
- Sinopsis/IMDb: ${movieDescription}
- Sapaan Pembuka: "${openingHook}"
- Outro Opening: "${outroBridge}"

Data Sumber Narasi:
${sourceTexts}

Tugas Utama:
1. ATURAN WAJIB HOOK / INTRO (MAKSIMAL 30 DETIK):
   Bagian "## [OPENING]" HARUS ringkas, memikat, dan berdurasi baca MAKSIMAL 30 DETIK (antara 45 sampai 65 kata).
   DILARANG bertele-tele agar retensi penonton YouTube tetap tinggi di detik-detik awal.
   Format Opening:
   - (Visual: [Adegan pembuka yang dramatis/memikat])
   - Sapaan "${openingHook}!" langsung dilanjutkan 1-2 kalimat pertanyaan retoris atau paradoks premis film yang memancing rasa penasaran audiens.
   - Ditutup langsung dengan kalimat outro bridge: "${outroBridge}!"
2. ATURAN KERAS: DILARANG SPOILER DI AWAL / HOOK / PART AWAL (ANTI-SPOILER):
   - DILARANG KERAS membocorkan spoiler, plot twist, rahasia/kebohongan karakter, atau akhir cerita di Hook/Opening maupun di Part-Part awal (contoh terlarang: "Tapi nanti kita tahu nih kalau dia ini sebenarnya banyak bohongnya", "Yang nantinya bakal mati", "Ternyata dia pelakunya").
   - Ceritakan alur secara KRONOLOGIS MURNI (Linear Storytelling). Rahasia karakter HANYA boleh diungkap saat adegan film tersebut benar-benar sampai di titik pengungkapannya.
3. Gabungkan semua sumber di atas menjadi 1 naskah alur cerita utuh, runut, dan tanpa plot hole (linear storytelling).
4. Gunakan sumber dengan detail paling kaya untuk setiap adegan. Jika ada bagian terputus di satu sumber, sambungkan dengan sumber lain.
5. Jelaskan motivasi karakter (Why), bukan cuma aksinya saja.
6. ${enforceVisualCues ? 'WAJIB menyisipkan tag (Visual: [Deskripsi adegan detail untuk editor]) di setiap perpindahan adegan atau perubahan tensi suasana.' : ''}
7. Bagi cerita ke dalam pembagian babak yang teratur:
   - # ${movieTitle.toUpperCase()}
   - **Genre**: Drama / Action / Misteri
   - **Channel**: ${channelName}
   - ## [OPENING]
   - ## [BODY STORY]
     - ### PART 1: [Judul Babak 1]
     - ### PART 2: [Judul Babak 2]
     - (lanjutkan sampai babak final)
   - ## [KESIMPULAN & CLOSING]
`;
  }

  const isVideoEssay = (personaStyle === 'video_esai_analitis');
  if (isVideoEssay) {
    stage1Prompt += `\n\nPETUNJUK KHUSUS GAYA VIDEO ESAI EKSPOSITORIS-ANALITIS (MIND-BLOWING FILM DEEP DIVE):
1. Buka bagian Opening dengan hook berbingkai pertanyaan reflektif/kebingungan penonton (misal: "Baru selesai nonton ${movieTitle}, tapi masih mikir gak sih sama nasib tokohnya? Ini film beneran bad ending ya? Nah pertanyaan-pertanyaan itu...").
2. Soroti sudut pandang karakter utama sebagai orang biasa/kurir/NPC dan konflik batinnya yang manusiawi (misal takut perubahan hidup, belum siap mengemban tanggung jawab baru, dll).
3. Ceritakan alur secara kronologis, tetapi jalin setiap rintangan, perjumpaan monster, atau musuh sebagai simbol psikologis dari ketakutan tokoh utama.
4. Hadirkan detail visual kontras (stiker, foto keluarga, benda peninggalan) yang menjadi pemicu titik balik batin tokoh.
5. Puncak ketegangan/survival diuji di lokasi yang memiliki makna simbolik (kelahiran kembali).\n`;
  }

  console.log(`🤖 Menjalankan Stage 1 (Lead Scriptwriter Agent) [Target Model: ${preferredModel}]...`);
  const stage1Result = await callGeminiSmartStage(stage1Prompt, 'Stage 1 (Lead Scriptwriter)', preferredModel);

  if (!stage1Result) {
    console.log('ℹ️ Belum ada API Key aktif di database, beralih ke engine fallback lokal.');
    return generateLocalFallback(data, sourceTexts);
  }

  const narrativeScript = stripAiConversationalPreamble(stage1Result.text);
  const usedKeys = [stage1Result.keyInfo];
  const usedModels = [stage1Result.modelName];

  if (!includeAnalysis) {
    return {
      script_markdown: narrativeScript,
      word_count: countWords(narrativeScript),
      mode: 'ai_gemini_direct',
      used_keys: usedKeys,
      used_models: usedModels,
      active_model: stage1Result.modelName
    };
  }

  // -------------------------------------------------------------------------
  // STAGE 2: Film Analyst Agent (Deep Insights without Cringe Jargon)
  // -------------------------------------------------------------------------
  const stage2Template = PromptTemplateRepo.getByKey('stage2_analysis');
  let stage2Prompt = '';
  if (stage2Template && stage2Template.prompt_content) {
    stage2Prompt = stage2Template.prompt_content
      .replace(/{{channelName}}/g, channelName)
      .replace(/{{openingHook}}/g, openingHook.replace(/^Halo\s+/i, ''));
    stage2Prompt += `\n\nBahan Naskah Cerita yang Dianalisis:\n${narrativeScript.slice(0, 15000)}`;
  } else {
    stage2Prompt = `
Anda adalah Storyteller & Analis Film untuk channel "${channelName}".
Aturan Utama:
1. DILARANG keras pakai salam pembuka atau kata "Halo". Langsung masuk ke pokok pembahasan analisis.
2. DILARANG pakai istilah asing klise seperti "Chef’s kiss", "Stakes", "Arc", atau "Vibe". Pakai bahasa Indonesia sehari-hari yang mudah dipahami penonton umum.
3. Transisi antar paragraf harus mengalir mulus ("Ngomong-ngomong soal itu...", "Bukan cuma itu...", "Nah, yang menariknya...").
4. Persona: Santai, kritis, pakai kata "Gua-Lu", panggil audiens dengan "${openingHook.replace(/^Halo\s+/i, '')}".

Struktur yang wajib dihasilkan:
## [BEDAH ANALISIS & PESAN FILM]
### 1. KENAPA FILM INI SERU BANGET?
(Jelaskan genre, tensi, dan kenapa orang awam bakal betah nonton dari awal sampai akhir)

### 2. BEDAH RENCANA & PESAN MORAL FILM
(Bahas apakah masalah dari awal terjawab di akhir. Apakah ada hikmah atau pesan mendalam soal kehidupan/keadilan)

### 3. ANALISIS SIFAT & PERKEMBANGAN KARAKTER
(Jelaskan motivasi dan kerapuhan tokoh utama, serta bagaimana sifat mereka bertransformasi sepanjang film)

Bahan Naskah Cerita yang Dianalisis:
${narrativeScript.slice(0, 15000)}
`;
  }

  if (isVideoEssay) {
    stage2Prompt = `Anda adalah Storyteller & Analis Film untuk channel "${channelName}".
Format Analisis: Video Esai Eksploratif & Reinterpretasi Makna (Gaya Zach Cregger / Nerdwriter).
Aturan:
1. DILARANG pakai istilah klise AI. Gunakan bahasa Indonesia sehari-hari yang luwes, santai ("Gua-Lu"), tapi kaya wawasan.
2. Struktur yang wajib dihasilkan:
## [BEDAH ANALISIS & REINTERPRETASI MAKNA]
### 1. TESIS UTAMA: RINTANGAN/MONSTER SEBAGAI WUJUD KETAKUTAN BATIN TOKOH
(Bedah bagaimana ancaman atau monster dalam film bukan cuma musuh fisik, melainkan metafora psikologis atas ketakutan terbesar sang tokoh)

### 2. TITIK BALIK SIMBOLIK & UJIAN KELAHIRAN KEMBALI
(Jelaskan bagaimana detail visual kontras memicu titik balik, dan bagaimana lokasi pertarungan akhir menyimbolkan ujian batin yang harus dilewati)

### 3. REINTERPRETASI ENDING: BUKAN SEKADAR BAD ENDING, TAPI PENERIMAAN PERUBAHAN
(Lakukan pembacaan ulang mendalam atas akhir film: kenapa tokoh mengalami nasib tersebut, dan bagaimana itu menjadi wujud konkret bahwa dia akhirnya berhenti lari dari perubahan)

### 4. KERESAHAN META SUTRADARA & KONEKSI KEHIDUPAN NYATA
(Hubungkan tema film dengan keresahan nyata sutradara/manusia pada umumnya)

Bahan Naskah Cerita yang Dianalisis:
${narrativeScript.slice(0, 15000)}`;
  }

  console.log('🧠 Menjalankan Stage 2 (Film Analyst Agent)...');
  const stage2Result = await callGeminiSmartStage(stage2Prompt, 'Stage 2 (Film Analyst)', preferredModel);
  const analysisOutput = stripAiConversationalPreamble(stage2Result.text);
  usedKeys.push(stage2Result.keyInfo);
  usedModels.push(stage2Result.modelName);

  // -------------------------------------------------------------------------
  // STAGE 3: Synthesizer Agent (Seamless Merge with Emotional Bridge)
  // -------------------------------------------------------------------------
  const audienceCall = openingHook.replace(/^Halo\s+/i, '') || 'Nakama';
  const stage3Template = PromptTemplateRepo.getByKey('stage3_synthesis');
  const stage3AntiPreamble = `
ATURAN OUTPUT MUTLAK (DILARANG CHAT / BASA-BASI):
- DILARANG KERAS menyertakan kata pengantar, basa-basi, atau salam pembuka ke user (CONTOH YANG SANGAT DILARANG: "Tentu, Nakama! Siap-siap, karena gua udah satukan semua yang lu minta...", "Ini dia naskah alur cerita...", "Baik, berikut naskahnya...").
- DILARANG memberikan komentar penutup di luar naskah.
- OUTPUT HARUS 100% NASKAH MURNI, langsung dimulai dari naskah cerita tanpa pengantar atau sapaan apa pun!`;

  let stage3Prompt = '';
  if (stage3Template && stage3Template.prompt_content) {
    stage3Prompt = stage3Template.prompt_content
      .replace(/{{audienceName}}/g, audienceCall);
    stage3Prompt += `\n\nINPUT 1 (NARASI CERITA):\n${narrativeScript}\n\nINPUT 2 (ANALISIS FILM):\n${analysisOutput}\n\n${stage3AntiPreamble}\n\nHasilkan naskah final utuh dalam format Markdown yang rapi:`;
  } else {
    stage3Prompt = `
Tugas Anda: Satukan Narasi Cerita dan Analisis Film di bawah ini menjadi satu naskah alur cerita utuh yang mengalir sempurna tanpa celah.

Aturan Penempatan:
Sisipkan teks ANALISIS tepat sebelum bagian "## [KESIMPULAN & CLOSING]" dari NARASI CERITA.

Instruksi Jembatan Emosi:
Sebelum masuk ke segmen analisis, buat 1 paragraf singkat yang "menjemput" emosi penonton setelah selesai menonton alur filmnya.
Contoh: "Gimana, ${audienceCall}? Ceritanya gokil dan nendang banget kan? Tapi tunggu dulu, sebenernya ada hal yang lebih dalam yang mungkin lu lewatin pas lagi asyik nonton..."

Gaya Bahasa:
Tetap gunakan kata "Gua", panggil penonton dengan "${audienceCall}", santai dan natural.
${stage3AntiPreamble}

INPUT 1 (NARASI CERITA):
${narrativeScript}

INPUT 2 (ANALISIS FILM):
${analysisOutput}

Hasilkan naskah final utuh dalam format Markdown yang rapi:
`;
  }

  if (isVideoEssay) {
    stage3Prompt = `Tugas Anda: Satukan Narasi Cerita dan Analisis Simbolik di bawah ini menjadi satu Naskah Video Esai Utuh yang mengalir dinamis layaknya esai film bioskop kelas atas.

Instruksi Penyatuan Gaya Video Esai:
- Tenun argumen simbolik langsung ke dalam perjalanan cerita dan reinterpretasi ending.
- Buat penonton merasa mendapatkan pencerahan baru ("mind-blown") setelah menonton video ini.
- Gunakan bahasa "Gua", santai, cerdas, bersahabat, dan reflektif.
${stage3AntiPreamble}

INPUT 1 (NARASI CERITA):
${narrativeScript}

INPUT 2 (ANALISIS SIMBOLIK):
${analysisOutput}

Hasilkan naskah final utuh dalam format Markdown yang rapi:`;
  }

  console.log('✨ Menjalankan Stage 3 (Synthesizer Agent)...');
  const stage3Result = await callGeminiSmartStage(stage3Prompt, 'Stage 3 (Synthesizer)', preferredModel);
  const finalScript = stripAiConversationalPreamble(stage3Result.text);
  usedKeys.push(stage3Result.keyInfo);
  usedModels.push(stage3Result.modelName);

  return {
    script_markdown: finalScript,
    word_count: countWords(finalScript),
    mode: 'ai_gemini_multi_agent',
    used_keys: [...new Set(usedKeys)],
    used_models: [...new Set(usedModels)],
    active_model: stage3Result.modelName || stage1Result.modelName
  };
}

function countWords(str) {
  if (!str) return 0;
  const matches = str.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

// Fallback synthesizer if no API key is provided
function generateLocalFallback(data, sourceTexts) {
  const {
    movieTitle = 'Film Pilihan',
    channelName = 'AAAlur Cerita',
    openingHook = 'Halo Nakama',
    outroBridge = 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya'
  } = data;

  const fallbackScript = `# ${movieTitle.toUpperCase()}
**Genre**: Action / Martial Arts / Drama  
**Channel**: ${channelName}  
**Pacing Narasi**: Lo-Gue Santai, Teman Ngopi, Berwibawa  

---

## [OPENING]
(Visual: Montage adegan pembuka memperlihatkan tokoh utama dengan tatapan mendalam menghadapi dunia baru)

${openingHook}! Selamat datang kembali di channel ${channelName}. Pernah gak sih lu ngerasa terlempar ke lingkungan yang 100% asing, di mana lu gak ngerti bahasanya, gak punya temen, dan hari pertama lu langsung diuji sama masalah besar?

Nah, film ${movieTitle} ngebuktiin kalau keberanian sejati itu bukan soal cara kita membalas pukulan hidup, tapi soal keteguhan hati buat bangkit berdiri pas hidup ngehantam kita berkali-kali.

${outroBridge}!

---

## [BODY STORY]

### PART 1: KOTA BARU, MASALAH BARU
(Visual: Karakter utama menatap keluar jendela kendaraan melintasi pemandangan kota asing yang ramai)

Kisah bermula saat tokoh utama kita harus pindah ke tempat yang baru dan asing bersama ibunya. Rasa canggung dan culture shock langsung terasa sejak pertama kali menginjakkan kaki di tempat baru ini. Semuanya terasa berbeda, mulai dari orang-orangnya, bahasanya, sampai lingkungan tempat tinggal barunya.

(Visual: Tokoh utama mengalami perundungan oleh kelompok lokal di lapangan terbuka)

Masalah mulai muncul ketika perkenalan dengan teman baru memicu kecemburuan kelompok jagoan lokal. Terjadilah bentrokan yang membuat tokoh utama kita babak belur dan terpaksa menanggung rasa takut setiap kali berangkat ke sekolah.

---

### PART 2: TITIK BALIK & DISIPLIN SEJATI
(Visual: Sang guru misterius menolong tokoh utama dengan teknik bela diri yang tenang tanpa kekerasan)

Di saat situasi sudah sangat terdesak, muncullah sosok mentor yang selama ini dianggap biasa saja. Dengan teknik yang tenang dan efisien, sang guru berhasil menyelamatkan tokoh utama. Dari situlah sebuah perjanjian dibuat: sang tokoh utama akan dilatih seni bela diri sejati bukan untuk ajang balas dendam, melainkan untuk membuktikan diri di atas arena turnamen resmi.

(Visual: Latihan berulang-ulang yang melelahkan dari pagi hingga malam di bawah pengawasan ketat sang guru)

Latihan fisik yang awalnya terkesan sepele ternyata menanamkan memori otot dan kedisiplinan batin yang luar biasa kuat. Tokoh utama mulai memahami bahwa esensi bela diri bukan sekadar fisik, melainkan ketenangan jiwa dalam menghadapi segala badai kehidupan.

---

## [BEDAH ANALISIS & PESAN FILM]
(Visual: Sorotan klip puncak latihan dengan latar belakang alam yang megah)

Gimana, ${openingHook.replace(/^Halo\s+/i, '')}? Ceritanya nendang banget, kan? Tapi tunggu dulu, ada lapisan makna filosofis yang jauh lebih dalam yang mungkin lu lewatin pas lagi asyik nonton ceritanya.

### 1. KENAPA FILM INI SERU BANGET?
Film ini berhasil menggabungkan dinamika culture shock dengan perjalanan batin seorang anak yang belajar arti resiliensi. Hubungan mentor dan murid terasa sangat emosional dan memberi bobot emosional yang kuat bagi penonton.

### 2. BEDAH RENCANA & PESAN MORAL: KEKUATAN SEJATI ADALAH PENGENDALIAN DIRI
Pesan moral terbesarnya adalah kekuatan tanpa kendali diri hanyalah arogansi yang merusak. Kemenangan terbesar diraih ketika kita berhasil menaklukkan ketakutan di dalam diri kita sendiri.

---

## [KESIMPULAN & CLOSING]
(Visual: Foto close-up tokoh utama dan sang guru tersenyum bangga di akhir perjalanan)

Dari kisah ${movieTitle}, kita bisa belajar bahwa hidup ini pasti bakal sering ngehantam kita sampai terpuruk, tapi yang menentukan siapa diri kita bukanlah seberapa keras kita jatuh, melainkan seberapa tangguh kita bangkit berdiri dan melangkah maju lagi.

Makasih banyak buat ${openingHook.replace(/^Halo\s+/i, '')} yang udah nonton sampai habis. Jangan lupa like, tinggalkan komentar, dan subscribe ke channel ${channelName} biar gak ketinggalan alur cerita seru lainnya. Gua pamit dulu, salam hangat, dan sampai jumpa di alur cerita selanjutnya!`;

  return {
    script_markdown: fallbackScript,
    word_count: countWords(fallbackScript),
    mode: 'local_synthesizer',
    used_models: ['Local Fallback Engine']
  };
}

/**
 * Transcreation & Anti-Duplicate Localization Engine
 * Mengubah naskah alur cerita bahasa Indonesia menjadi versi bahasa asing
 * dengan gaya penceritaan penutur asli (native recap) agar 100% bebas dari
 * deteksi Duplicate / Reused Content algoritma YouTube, serta menyinkronkan
 * seluruh tag arahan visual (Visual: ...) untuk mempermudah editor video.
 */
async function runGeminiTranscreation(data) {
  const {
    sourceScript,
    movieTitle = 'Film Pilihan',
    targetLanguage = 'en-US',
    customLanguage = '',
    channelName = 'Movie Recap Hub',
    openingHook = 'Hey movie fans, welcome back!',
    personaStyle = 'engaging_storyteller',
    antiDuplicateLevel = 'ultra',
    preferredModel = 'auto'
  } = data;

  if (!sourceScript || sourceScript.trim().length === 0) {
    throw new Error('Naskah sumber kosong. Tulis atau buat naskah terlebih dahulu.');
  }

  const langMap = {
    'en-US': 'American English (US) in the fast-paced, high-retention storytelling style of top YouTube movie recap channels (like Movie Recaps / Mystery Recapped)',
    'en-GB': 'British English (UK) in an articulate, cinematic, and engaging storytelling style',
    'es': 'Neutral Spanish (Español) in the engaging style of Latin American and Spanish movie recap channels (Resumen de Películas)',
    'pt-BR': 'Brazilian Portuguese (Português do Brasil) tailored for YouTube movie recaps (Resumo de Filmes)',
    'ja': 'Japanese (日本語) in natural, immersive cinema recap storytelling style (映画解説・あらすじ)',
    'de': 'German (Deutsch) in natural and captivating movie recap narrative style (Filmzusammenfassung)',
    'fr': 'French (Français) in engaging movie recap narrative style (Récapitulatif de film)',
    'ko': 'Korean (한국어) in captivating cinema recap style (영화 결말포함 리뷰)',
    'ar': 'Modern Standard Arabic (العربية) in cinematic storytelling recap style'
  };

  const resolvedLang = langMap[targetLanguage] || (customLanguage ? customLanguage.trim() : 'American English (US)');

  let uniquenessInstruction = '';
  if (antiDuplicateLevel === 'ultra') {
    uniquenessInstruction = `
- ULTRA-MAXIMUM RE-FRAMING (CRITICAL FOR YOUTUBE REUSED CONTENT EVASION):
  * Completely dismantle and rebuild the phrasing from scratch using native colloquial idioms.
  * DO NOT mirror Indonesian syntax, word order, or direct sentence boundaries.
  * Craft a fresh opening hook question and thematic angle tailored to "${channelName}".
  * Rephrase emotional reflections, character reactions, and plot transitions so that automated subtitle/transcript matchers calculate ZERO duplicate similarity with literal translations.
  * Plot facts, character names, and the chronological sequence of movie events MUST remain 100% accurate.`;
  } else if (antiDuplicateLevel === 'balanced') {
    uniquenessInstruction = `
- BALANCED NATIVE LOCALIZATION:
  * Paraphrase thoroughly using natural conversational flow of target language speakers.
  * Avoid direct word-for-word translation. Keep sentence lengths varied and engaging.`;
  } else {
    uniquenessInstruction = `
- FAITHFUL ADAPTIVE TRANSLATION:
  * Follow the scene-by-scene narrative closely, but ensure smooth, natural grammatical flow in ${resolvedLang}.`;
  }

  const prompt = `
You are a world-class YouTube Movie Recap Scriptwriter, Localization Expert, and Transcreation Specialist.
Your task: TRANSCREATE the following Indonesian film recap script into:
**TARGET LANGUAGE**: ${resolvedLang}

CHANNEL BRANDING & PERSONA:
- Target Channel Name: "${channelName}"
- Opening Greeting / Hook: "${openingHook}"
- Persona / Tone: ${personaStyle.replace(/_/g, ' ')} (Engaging, conversational, crisp, immersive)

STRICT ANTI-DUPLICATE & YOUTUBE POLICY RULES:
1. ZERO LITERAL TRANSLATION:
   Literal translation triggers YouTube's duplicate/reused content detection. You must RE-WRITE (transcreate) the storytelling so that it sounds like it was originally written by a native creator in ${resolvedLang}.
2. PRESERVE ALL (Visual: ...) TAGS EXACTLY:
   Every single visual cue tag in the script, like:
   \`(Visual: [Deskripsi adegan])\`
   MUST be retained in its exact narrative position, but translated and adapted clearly into the target language, for example:
   \`(Visual: Close-up of Dre looking out the plane window at Beijing skyline)\`
   This is MANDATORY so the video editor can synchronize the visual footage with the new voiceover.
3. PRESERVE STRUCTURAL HEADERS:
   Keep standard Markdown chapter structure:
   - # [TITLE OF MOVIE IN TARGET LANGUAGE/ORIGINAL]
   - **Genre**: Drama / Action / Mystery
   - **Channel**: ${channelName}
   - ## [OPENING]
   - ## [BODY STORY]
     - ### PART 1: [Localized Part Title]
     - ### PART 2: [Localized Part Title]
     - (continue all parts)
   - ## [BEDAH ANALISIS & PESAN FILM] -> Localize header to: ## [FILM ANALYSIS & DEEP DIVE] (or target language equivalent)
     - ### 1. WHY THIS FILM IS SO COMPELLING
     - ### 2. THE CORE MESSAGE & PHILOSOPHY
     - ### 3. CHARACTER GROWTH & INNER MOTIVATION
   - ## [CONCLUSION & OUTRO]
4. STRICT 30-SECOND LIMIT FOR HOOK / OPENING (MAX 45–65 WORDS):
   The "## [OPENING]" section MUST be strictly under 30 SECONDS of spoken voiceover (between 45 to 65 words total).
   Start with greeting "${openingHook}", deliver 1-2 punchy, curiosity-inducing hook sentences setting up the high-stakes dilemma, and jump straight into the story without filler so YouTube retention remains at peak.
${uniquenessInstruction}

INPUT SCRIPT TO TRANSCREATE (INDONESIAN):
${sourceScript}

Produce the full, complete transcreated script in clean Markdown without conversational preamble or apology:
`;

  console.log(`🌐 [Transcreation Engine] Memulai terjemah anti-duplikat ke ${resolvedLang} [Model: ${preferredModel}]...`);
  const result = await callGeminiSmartStage(prompt, `Transcreation (${targetLanguage})`, preferredModel);

  if (!result) {
    throw new Error('Gagal memproses terjemahan AI: Tidak ada Kunci API aktif yang tersedia.');
  }

  return {
    transcreated_markdown: result.text,
    word_count: countWords(result.text),
    target_language: resolvedLang,
    active_model: result.modelName,
    used_key: result.keyInfo
  };
}

// Helper format seconds to timecode HH:MM:SS.mmm
function formatSecondsToTimecode(totalSec) {
  const s = Math.max(0, parseFloat(totalSec) || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const ms = Math.floor((s - Math.floor(s)) * 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Parser JSON robust dengan pemulihan cerdas untuk respons JSON Gemini yang terpotong (truncated)
function parseGeminiCutScenesJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Respons teks dari Gemini kosong.');
  }

  let text = rawText.trim();
  // Bersihkan markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Coba parse langsung
  try {
    const direct = JSON.parse(text);
    if (direct && Array.isArray(direct.scenes)) return direct;
  } catch (err1) {}

  // 2. Coba potong antara { pertama dan } terakhir
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && Array.isArray(parsed.scenes)) return parsed;
    } catch (err2) {}

    // Coba perbaiki trailing comma
    try {
      const fixedCommas = candidate.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(fixedCommas);
      if (parsed && Array.isArray(parsed.scenes)) return parsed;
    } catch (err3) {}
  }

  // 3. Perbaikan jika JSON terpotong di tengah jalan (truncated response karena batas token)
  if (firstBrace !== -1) {
    const lastValidObjEnd = text.lastIndexOf('}');
    if (lastValidObjEnd > firstBrace) {
      let repaired = text.substring(firstBrace, lastValidObjEnd + 1);
      if (!repaired.includes(']')) repaired += ']';
      if (!repaired.endsWith('}')) repaired += '}';
      repaired = repaired.replace(/,\s*([}\]])/g, '$1');
      try {
        const parsed = JSON.parse(repaired);
        if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          console.log(`🔧 [JSON Repair] Berhasil memulihkan ${parsed.scenes.length} adegan dari respons JSON terpotong.`);
          return parsed;
        }
      } catch (errRep) {}
    }
  }

  // 4. Ekstraksi darurat individual objek scene dengan regex
  const scenes = [];
  const objRegex = /\{[^{}]*"(?:clip_number|start_seconds|start_time)"[^{}]*\}/g;
  let match;
  while ((match = objRegex.exec(text)) !== null) {
    let str = match[0].trim().replace(/,\s*}/g, '}');
    try {
      const obj = JSON.parse(str);
      if (obj.start_seconds !== undefined || obj.start_time) {
        scenes.push(obj);
      }
    } catch (e) {
      try {
        const sanitized = str.replace(/(:\s*"[^"]*)"([^"]*")/g, '$1\\"$2');
        const obj = JSON.parse(sanitized);
        if (obj.start_seconds !== undefined || obj.start_time) {
          scenes.push(obj);
        }
      } catch (e2) {}
    }
  }

  if (scenes.length > 0) {
    console.log(`🔧 [Regex Fallback] Berhasil mengekstrak ${scenes.length} adegan kunci dari teks Gemini.`);
    let summary = 'Koleksi cut scene kunci berhasil dianalisis oleh Gemini.';
    const sumMatch = text.match(/"summary"\s*:\s*"([^"\r\n]+)"/);
    if (sumMatch) summary = sumMatch[1];
    return { summary, scenes };
  }

  console.error('[Gemini JSON Parse Error] Cuplikan teks respons:', text.slice(0, 400));
  throw new Error('Gagal mem-parsing format JSON hasil analisis adegan Gemini.');
}

/**
 * AI Smart Cut Scene Detector: Analisis Subtitle / Dialog Film menggunakan Gemini
 * Memilih momen dramatis, punchline, dialog kunci, dan klimaks untuk dipotong jadi cut scene fair-use.
 * SYARAT MUTLAK: Durasi setiap klip adegan TIDAK BOLEH LEBIH DARI 3 DETIK (WAJIB DI BAWAH 3 DETIK).
 */
async function analyzeSrtForCutScenes({
  srtEntries = [],
  movieTitle = 'Film',
  channelPersona = 'alur_cerita',
  focusHint = '',
  maxClips = 'all',
  maxDurationSeconds = 5.0,
  preferredModel = 'auto'
}) {
  if (!srtEntries || srtEntries.length === 0) {
    throw new Error('Data subtitle film kosong atau tidak valid.');
  }

  // Format subtitle entries compactly for prompt efficiency (dukung hingga 3500 baris subtitle film panjang)
  const condensedDialog = srtEntries.slice(0, 3500).map((item, idx) => 
    `[#${idx + 1}] ${item.startTime} -> ${item.endTime} (${item.duration}s) | ${item.text}`
  ).join('\n');

  const maxDuration = parseFloat(maxDurationSeconds) || 5.0;
  const isStrict3s = maxDuration <= 3.0;
  const upperLimit = isStrict3s ? 2.85 : 4.85;
  const minLimit = isStrict3s ? 1.5 : 2.5;

  let clipInstruction = '';
  const parsedMax = parseInt(maxClips, 10);
  const isTargetFixed = !isNaN(parsedMax) && parsedMax > 0 && parsedMax < 999;
  const targetCount = isTargetFixed ? parsedMax : 35;

  if (isTargetFixed) {
    clipInstruction = `PERINTAH JUMLAH WAJIB (SANGAT KETAT):
- Anda WAJIB memilih dan menghasilkan TEPAT ${parsedMax} ADEGAN KUNCI di dalam array "scenes".
- Daftar "scenes" HARUS berisi PERSIS ${parsedMax} objek adegan bernomor dari 1 sampai ${parsedMax}.
- DILARANG BERHENTI atau memotong respons sebelum nomor ${parsedMax} selesai tertulis!
- Distribusikan ke-${parsedMax} adegan tersebut secara proporsional dari awal hingga akhir film:
  * Babak 1 (Awal / Pembukaan / Konflik Awal): ~${Math.ceil(parsedMax * 0.3)} adegan
  * Babak 2 (Pertengahan / Perkembangan / Titik Balik): ~${Math.ceil(parsedMax * 0.4)} adegan
  * Babak 3 (Klimaks / Puncak Pertarungan / Ending): ~${Math.ceil(parsedMax * 0.3)} adegan`;
  } else {
    clipInstruction = `PERINTAH JUMLAH WAJIB (SANGAT KETAT):
- Anda WAJIB mengekstrak SEBANYAK-BANYAKNYA adegan kunci (TARGET MINIMAL 35 HINGGA 50 ADEGAN LENGKAP) di dalam array "scenes", mencakup seluruh alur dari awal sampai akhir film tanpa ada babak penting yang terlewat.`;
  }

  const prompt = `
Anda adalah Sutradara & Video Editor Profesional khusus YouTube Alur Cerita / Movie Recap.
${clipInstruction}

${focusHint ? `FOKUS KHUSUS PEMILIHAN DARI PENGGUNA:\n"${focusHint}"\n` : ''}

KRITERIA WAJIB & ATURAN DURASI PEMILIHAN CUT SCENE:
1. ATURAN DURASI SCENE: DURASI SETIAP SCENE HARUS BERKISAR ANTARA ${minLimit} HINGGA ${upperLimit} DETIK (DURASI MAKSIMAL ${upperLimit} DETIK, DILARANG MENCAPAI ATAU MELEBIHI ${maxDuration} DETIK).
   - Rumus wajib: (end_seconds - start_seconds) <= ${upperLimit} detik.
   - Ambil bagian dialog, punchline, atau kalimat penentu cerita yang utuh dan dramatis dengan durasi presisi ${minLimit}s s/d ${upperLimit}s agar aman untuk Fair-Use YouTube.
2. PUNCHLINE & PLOT TWIST: Dialog pengungkapan rahasia, momen kejutan, atau kata-kata penentu cerita.
3. MOMEN EMOSIONAL / DILEMA: Kalimat penuh ketakutan, keputusasaan, kemarahan, atau pengakuan mendalam tokoh.
4. KATA KUNCI PERISTIWA (EVENT TRIGGER): Titik balik wabah, keputusan berbahaya, atau ancaman monster/musuh.
5. BUFFER WAKTU CEPAT: Sesuaikan start_seconds dan end_seconds secara presisi sehingga durasi total klip berkisar ${minLimit} s/d ${upperLimit} detik.

SUBTITLE & TIMECODE FILM (${movieTitle}):
${condensedDialog}

FORMAT OUTPUT WAJIB:
Hasilkan HANYA format JSON VALID murni (tanpa tanda kutip markdown tambahan seperti \`\`\`json):
{
  "summary": "Ringkasan kurasi: mengapa adegan-adegan ini dipilih untuk memperkuat alur cerita film ini (seluruh klip dipastikan berdurasi maksimal ${upperLimit} detik)",
  "scenes": [
    {
      "clip_number": 1,
      "title": "Judul Adegan Singkat & Padat",
      "start_time": "00:03:14.500",
      "end_time": "00:03:18.500",
      "start_seconds": 194.5,
      "end_seconds": 198.5,
      "dialogue": "Teks dialog atau kalimat kunci film",
      "reason": "Alasan singkat mengapa adegan ini krusial (1 kalimat padat)"
    }
  ]
}

PANDUAN KETAT AGAR FORMAT JSON VALID & LENGKAP:
- Tulis teks dialogue dan reason secara ringkas (1 kalimat pendek) agar seluruh ${isTargetFixed ? parsedMax : 'adegan'} termuat lengkap tanpa terpotong token.
- JANGAN gunakan tanda petik dua unescaped di dalam string. Jika ada kutipan dalam dialog, gunakan tanda petik satu (') atau escape (\").
- Hasilkan HANYA JSON, dilarang memberi kata pembuka atau penutup di luar objek JSON.
`;

  console.log(`🤖 [AI Cut Scene Engine] Menganalisis subtitle untuk "${movieTitle}" (${srtEntries.length} baris, target: ${isTargetFixed ? parsedMax + ' klip' : 'sebanyak-banyaknya'}, durasi: ${minLimit}s - ${upperLimit}s)...`);
  const result = await callGeminiSmartStage(prompt, `AI Cut Scene Detector (${movieTitle})`, preferredModel, { maxOutputTokens: 8192, temperature: 0.2 });

  if (!result || !result.text) {
    throw new Error('Gemini tidak memberikan respons analisis cut scene.');
  }

  // Parse JSON response safely with auto-repair and partial recovery support
  const parsedJson = parseGeminiCutScenesJson(result.text);
  let rawScenes = Array.isArray(parsedJson.scenes) ? parsedJson.scenes : [];

  // Multi-pass recovery: jika target angka spesifik diminta dan hasilnya masih kurang dari target
  if (isTargetFixed && rawScenes.length < targetCount && rawScenes.length > 0) {
    const remainingNeeded = targetCount - rawScenes.length;
    const lastScene = rawScenes[rawScenes.length - 1];
    const lastSec = lastScene.end_seconds || lastScene.start_seconds || 0;

    console.log(`⚠️ [Multi-Pass Slicer] Pass 1 menghasilkan ${rawScenes.length}/${targetCount} adegan (berakhir di detik ${lastSec} / ${lastScene.end_time || lastScene.start_time}). Mengambil sisa ${remainingNeeded} adegan berikutnya dari paruh kedua film...`);

    const remainingSrt = srtEntries.filter(item => {
      const parts = (item.startTime || '').split(/[:,]/);
      let sec = 0;
      if (parts.length >= 3) {
        sec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2] + '.' + (parts[3] || '0'));
      }
      return sec >= (lastSec - 10);
    });

    if (remainingSrt.length > 10) {
      const condensedRemaining = remainingSrt.slice(0, 3000).map((item, idx) => 
        `[#${rawScenes.length + idx + 1}] ${item.startTime} -> ${item.endTime} (${item.duration}s) | ${item.text}`
      ).join('\n');

      const pass2Prompt = `
Anda adalah Sutradara & Video Editor Profesional YouTube Alur Cerita.
Pada analisis sebelumnya, Anda telah berhasil memilih ${rawScenes.length} adegan pertama hingga timecode ${lastScene.end_time || lastScene.start_time}.
Target total pengguna adalah ${targetCount} adegan. Jadi Anda MASIH HARUS MEMILIH PERSIS ${remainingNeeded} ADEGAN LAGI (dimulai dari nomor ${rawScenes.length + 1} hingga ${targetCount}) dari sisa alur film berikut.

SUBTITLE SISA FILM (${movieTitle}):
${condensedRemaining}

KRITERIA:
1. Durasi setiap adegan berkisar ${minLimit}s s/d ${upperLimit}s.
2. Hasilkan PERSIS ${remainingNeeded} objek adegan bernomor ${rawScenes.length + 1} sampai ${targetCount}.
3. Tulis dialogue dan reason secara ringkas (1 kalimat pendek).

FORMAT OUTPUT (HANYA JSON MURNI):
{
  "scenes": [
    {
      "clip_number": ${rawScenes.length + 1},
      "title": "Judul Adegan",
      "start_time": "01:20:15.000",
      "end_time": "01:20:19.500",
      "start_seconds": 4815.0,
      "end_seconds": 4819.5,
      "dialogue": "Dialog kunci",
      "reason": "Alasan singkat"
    }
  ]
}
`;

      try {
        const pass2Result = await callGeminiSmartStage(pass2Prompt, `AI Cut Scene Detector Pass 2 (${movieTitle})`, preferredModel, { maxOutputTokens: 8192, temperature: 0.2 });
        if (pass2Result && pass2Result.text) {
          const pass2Parsed = parseGeminiCutScenesJson(pass2Result.text);
          if (Array.isArray(pass2Parsed.scenes) && pass2Parsed.scenes.length > 0) {
            console.log(`✅ [Multi-Pass Slicer] Pass 2 berhasil menambahkan ${pass2Parsed.scenes.length} adegan!`);
            rawScenes = rawScenes.concat(pass2Parsed.scenes);
          }
        }
      } catch (pass2Err) {
        console.warn(`[Multi-Pass Slicer] Pass 2 dilewati (${pass2Err.message}), memakai ${rawScenes.length} adegan yang ada.`);
      }
    }
  }

  // Enforce durasi klip sesuai target batas upperLimit di level data
  const sanitizedScenes = rawScenes.map((sc, idx) => {
    let startSec = Math.max(0, parseFloat(sc.start_seconds) || 0);
    let endSec = parseFloat(sc.end_seconds) || (startSec + upperLimit);
    let diff = endSec - startSec;

    // Strict enforcement batas durasi scene
    if (diff > upperLimit || diff < 0.5) {
      endSec = Math.round((startSec + Math.min(upperLimit, Math.max(minLimit, diff))) * 100) / 100;
      if (endSec - startSec > upperLimit) {
        endSec = Math.round((startSec + upperLimit) * 100) / 100;
      }
    }

    const finalDur = Math.round((endSec - startSec) * 100) / 100;
    return {
      ...sc,
      clip_number: idx + 1,
      start_seconds: startSec,
      end_seconds: endSec,
      start_time: formatSecondsToTimecode(startSec),
      end_time: formatSecondsToTimecode(endSec),
      duration: finalDur
    };
  });

  return {
    summary: parsedJson.summary || `Koleksi ${sanitizedScenes.length} cut scene kunci berhasil dianalisis oleh Gemini.`,
    scenes: sanitizedScenes,
    active_model: result.modelName,
    used_key: result.keyInfo
  };
}

module.exports = {
  GEMINI_MODELS,
  runGeminiGeneration,
  runGeminiTranscreation,
  analyzeSrtForCutScenes,
  testGeminiApiKey,
  countWords,
  getModelSequence
};
