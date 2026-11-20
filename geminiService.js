/**
 * AlurCerita Studio — Multi-Agent AI Script Generation Service
 * Powered by Google Gemini API (@google/generative-ai)
 * Implements Smart Round-Robin with Health Tracking & Failover:
 * 1. Lead Scriptwriter (Multi-source linear merger + Visual Cues)
 * 2. Film Analyst (Genre, Plot/Moral, Character growth)
 * 3. Synthesizer (Emotional bridge + Seamless single script)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiKeyRepo } = require('./db');

/**
 * Live test an API key against Google Gemini API
 */
async function testGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
    return { success: false, error: 'Format kunci API tidak valid (minimal 15 karakter).' };
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Ping. Balas satu kata: SIAP.' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    const text = result.response.text();
    return { success: true, message: `Berhasil terhubung ke Google Gemini! Respons: "${text.trim()}"` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper to call Gemini with Smart Round-Robin and automatic failover
 */
async function callGeminiSmartStage(prompt, stageName) {
  const triedKeyIds = [];
  let lastError = null;

  while (true) {
    const keyRecord = ApiKeyRepo.getNextSmartKey(triedKeyIds);
    if (!keyRecord) {
      // Check if .env has a fallback key if none configured in SQLite
      if (triedKeyIds.length === 0 && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.includes('YOUR_GEMINI')) {
        try {
          console.log(`🔑 Menggunakan GEMINI_API_KEY dari .env untuk ${stageName}...`);
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          return { text: result.response.text(), keyInfo: 'Environment Key (.env)' };
        } catch (envErr) {
          console.warn('⚠️ Gagal pada GEMINI_API_KEY (.env):', envErr.message);
          lastError = envErr;
        }
      }

      if (triedKeyIds.length > 0) {
        throw new Error(`Semua API Key Gemini (${triedKeyIds.length} key) sedang limit (429) atau error: ${lastError?.message || 'Gagal'}`);
      }
      return null; // No keys available at all -> will trigger local fallback
    }

    triedKeyIds.push(keyRecord.id);
    console.log(`🤖 [Smart Round-Robin] Memakai Key #${keyRecord.id} [${keyRecord.label || 'Gemini'}] (${keyRecord.masked_key}) untuk ${stageName}...`);

    try {
      const genAI = new GoogleGenerativeAI(keyRecord.key_value);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Record successful usage
      ApiKeyRepo.recordUsage(keyRecord.id, true);
      return { text, keyInfo: `${keyRecord.label || 'Key'} (${keyRecord.masked_key})` };
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Key #${keyRecord.id} (${keyRecord.masked_key}) gagal:`, error.message);
      ApiKeyRepo.recordUsage(keyRecord.id, false, error.message);
      // Loop continues, picking the NEXT available smart key
    }
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
    sources = {}
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
1. Gabungkan semua sumber di atas menjadi 1 naskah alur cerita utuh, runut, dan tanpa plot hole (linear storytelling).
2. Gunakan sumber dengan detail paling kaya untuk setiap adegan. Jika ada bagian terputus di satu sumber, sambungkan dengan sumber lain.
3. Jelaskan motivasi karakter (Why), bukan cuma aksinya saja.
4. ${enforceVisualCues ? 'WAJIB menyisipkan tag (Visual: [Deskripsi adegan detail untuk editor]) di setiap perpindahan adegan atau perubahan tensi suasana.' : ''}
5. Bagi cerita ke dalam pembagian babak yang teratur:
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

  console.log('🤖 Menjalankan Stage 1 (Lead Scriptwriter Agent)...');
  const stage1Result = await callGeminiSmartStage(stage1Prompt, 'Stage 1 (Lead Scriptwriter)');
  
  if (!stage1Result) {
    console.log('ℹ️ Belum ada API Key aktif di database, beralih ke engine fallback lokal.');
    return generateLocalFallback(data, sourceTexts);
  }

  const narrativeScript = stage1Result.text;
  const usedKeys = [stage1Result.keyInfo];

  if (!includeAnalysis) {
    return {
      script_markdown: narrativeScript,
      word_count: countWords(narrativeScript),
      mode: 'ai_gemini_direct',
      used_keys: usedKeys
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
  const stage2Result = await callGeminiSmartStage(stage2Prompt, 'Stage 2 (Film Analyst)');
  const analysisOutput = stage2Result.text;
  usedKeys.push(stage2Result.keyInfo);

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
  const stage3Result = await callGeminiSmartStage(stage3Prompt, 'Stage 3 (Synthesizer)');
  const finalScript = stage3Result.text;
  usedKeys.push(stage3Result.keyInfo);

  return {
    script_markdown: finalScript,
    word_count: countWords(finalScript),
    mode: 'ai_gemini_multi_agent',
    used_keys: [...new Set(usedKeys)]
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
    movieDirector = 'Harald Zwart (2010)',
    movieDescription = '',
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
    mode: 'local_synthesizer'
  };
}

module.exports = {
  runGeminiGeneration,
  testGeminiApiKey,
  countWords
};
