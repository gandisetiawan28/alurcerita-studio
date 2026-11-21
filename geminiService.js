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
const { ApiKeyRepo } = require('./db');

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
async function callGeminiSmartStage(prompt, stageName, preferredModel = 'auto') {
  const triedKeyIds = [];
  let lastError = null;
  const modelChain = getModelSequence(preferredModel);

  while (true) {
    const keyRecord = ApiKeyRepo.getNextSmartKey(triedKeyIds);
    if (!keyRecord) {
      // Coba fallback ke process.env.GEMINI_API_KEY jika tidak ada key di database
      if (triedKeyIds.length === 0 && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.includes('YOUR_GEMINI')) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        for (const modelDef of modelChain) {
          try {
            console.log(`🔑 Menggunakan GEMINI_API_KEY (.env) dengan model ${modelDef.name} untuk ${stageName}...`);
            const model = genAI.getGenerativeModel({ model: modelDef.id });
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
        const model = genAI.getGenerativeModel({ model: modelDef.id });
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

  // -------------------------------------------------------------------------
  // STAGE 1: Lead Scriptwriter Agent (Chronological Merger + Visual Cues)
  // -------------------------------------------------------------------------
  const stage1Prompt = `
Anda adalah Lead Scriptwriter profesional untuk channel YouTube alur cerita film "${channelName}".
Persona Anda: Tenang, santai, berwibawa tapi asik, menggunakan bahasa "Lo-Gue" layaknya teman ngopi yang jago cerita.
Hindari: Sarkasme berlebihan, celetukan konyol yang memutus suasana, bahasa baku/kaku, slang kasar berlebihan.

Informasi Film:
- Judul: ${movieTitle}
- Sutradara & Tahun: ${movieDirector}
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
2. Gabungkan semua sumber di atas menjadi 1 naskah alur cerita utuh, runut, dan tanpa plot hole (linear storytelling).
3. Gunakan sumber dengan detail paling kaya untuk setiap adegan. Jika ada bagian terputus di satu sumber, sambungkan dengan sumber lain.
4. Jelaskan motivasi karakter (Why), bukan cuma aksinya saja.
5. ${enforceVisualCues ? 'WAJIB menyisipkan tag (Visual: [Deskripsi adegan detail untuk editor]) di setiap perpindahan adegan atau perubahan tensi suasana.' : ''}
6. Bagi cerita ke dalam pembagian babak yang teratur:
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

  console.log(`🤖 Menjalankan Stage 1 (Lead Scriptwriter Agent) [Target Model: ${preferredModel}]...`);
  const stage1Result = await callGeminiSmartStage(stage1Prompt, 'Stage 1 (Lead Scriptwriter)', preferredModel);

  if (!stage1Result) {
    console.log('ℹ️ Belum ada API Key aktif di database, beralih ke engine fallback lokal.');
    return generateLocalFallback(data, sourceTexts);
  }

  const narrativeScript = stage1Result.text;
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
  const stage2Prompt = `
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

  console.log('🧠 Menjalankan Stage 2 (Film Analyst Agent)...');
  const stage2Result = await callGeminiSmartStage(stage2Prompt, 'Stage 2 (Film Analyst)', preferredModel);
  const analysisOutput = stage2Result.text;
  usedKeys.push(stage2Result.keyInfo);
  usedModels.push(stage2Result.modelName);

  // -------------------------------------------------------------------------
  // STAGE 3: Synthesizer Agent (Seamless Merge with Emotional Bridge)
  // -------------------------------------------------------------------------
  const stage3Prompt = `
Tugas Anda: Satukan Narasi Cerita dan Analisis Film di bawah ini menjadi satu naskah alur cerita utuh yang mengalir sempurna tanpa celah.

Aturan Penempatan:
Sisipkan teks ANALISIS tepat sebelum bagian "## [KESIMPULAN & CLOSING]" dari NARASI CERITA.

Instruksi Jembatan Emosi:
Sebelum masuk ke segmen analisis, buat 1 paragraf singkat yang "menjemput" emosi penonton setelah selesai menonton alur filmnya.
Contoh: "Gimana, ${openingHook.replace(/^Halo\s+/i, '')}? Ceritanya gokil dan nendang banget kan? Tapi tunggu dulu, sebenernya ada hal yang lebih dalam yang mungkin lu lewatin pas lagi asyik nonton..."

Gaya Bahasa:
Tetap gunakan kata "Gua", panggil penonton dengan "${openingHook.replace(/^Halo\s+/i, '')}", santai dan natural.

INPUT 1 (NARASI CERITA):
${narrativeScript}

INPUT 2 (ANALISIS FILM):
${analysisOutput}

Hasilkan naskah final utuh dalam format Markdown yang rapi:
`;

  console.log('✨ Menjalankan Stage 3 (Synthesizer Agent)...');
  const stage3Result = await callGeminiSmartStage(stage3Prompt, 'Stage 3 (Synthesizer)', preferredModel);
  const finalScript = stage3Result.text;
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

module.exports = {
  GEMINI_MODELS,
  runGeminiGeneration,
  runGeminiTranscreation,
  testGeminiApiKey,
  countWords,
  getModelSequence
};
