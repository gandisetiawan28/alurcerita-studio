# 🎬 AlurCerita Studio — Editorial Script & Voiceover Engine

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/gandisetiawan28/alurcerita-studio/blob/main/AlurCerita_TTS_Colab.ipynb)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node: >=20](https://img.shields.io/badge/Node->=20.0.0-green.svg)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)

Platform terintegrasi untuk penulisan naskah alur cerita film YouTube berbasis Multi-Agent AI (Google Gemini) yang terhubung langsung dengan mesin Text-to-Speech (TTS) berkecepatan tinggi di Google Colab GPU (Kokoro-82M, Nari Dia-1.6B & Coqui XTTS v2).

---

## 🚀 1-Click Jalankan di Google Colab

Cukup klik tombol badge di bawah ini untuk membuka notebook GPU secara otomatis tanpa perlu unduh/unggah manual:

<p align="center">
  <a href="https://colab.research.google.com/github/gandisetiawan28/alurcerita-studio/blob/main/AlurCerita_TTS_Colab.ipynb">
    <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab" width="220" />
  </a>
</p>

1. Klik tombol **Open In Colab** di atas.
2. Pastikan runtime GPU aktif (**Runtime** -> **Change runtime type** -> pilih **T4 GPU**).
3. Jalankan semua sel (**Runtime** -> **Run all** atau `Ctrl + F9`).
4. Salin URL **Cloudflare Anycast Tunnel** yang muncul di sel terakhir, lalu tempelkan ke menu **Voiceover TTS** di AlurCerita Studio.

---

## ✨ Fitur Utama

### 1. Multi-Source Editorial Scriptwriter
* Menggabungkan 3 hingga 5 sumber transkrip/referensi secara linear, mengambil detail terkaya tanpa kehilangan kronologi.
* Menyisipkan tag arahan kamera visual `(Visual: [Deskripsi adegan])` secara otomatis untuk mempermudah editor video.
* Mengunci persona bahasa channel (*"Lo-Gue santai ala teman ngopi"*, *"Halo Nakama"*, dsb).

### 2. Smart Round-Robin Gemini API Key Management
* Mendukung rotasi dinamis multi-API Key Gemini.
* Pengaturan langsung di dalam aplikasi (bukan file `.env`), tersimpan aman di database SQLite lokal (`alurcerita.db`).
* Otomatis melakukan *failover* jika salah satu kunci terkena batas kuota (*Rate Limit 429*).

### 3. Sentence-by-Sentence TTS Tracking & Auto-Concatenate
* Membagi naskah menjadi kalimat-kalimat terpisah untuk disuarakan satu per satu di GPU Colab.
* **Penandaan Visual Realtime**: Kalimat yang sedang disintesis berkedip kuning (*processing*), dan berubah menjadi hijau lembut (*completed*) begitu selesai.
* **Auto-Merge**: Semua potongan suara kalimat otomatis digabungkan menjadi 1 file master MP3 (192 kbps) utuh dengan jeda nafas alami (250 ms).

### 4. Studio Reader & Export
* Tampilan bergaya Apple Stationery dengan font Inter dan JetBrains Mono.
* Penghitung kata dan estimasi durasi pembacaan vokal instan.
* Mode **Teleprompter Layar Penuh** dengan pengaturan kecepatan scroll otomatis.
* Ekspor voiceover bersih (tag visual otomatis dibersihkan), salin arahan editor, atau cetak PDF format A4.

---

## 🛠️ Instalasi & Menjalankan Lokal

### Prasyarat
* [Node.js](https://nodejs.org/) versi 20 atau lebih baru (mendukung `node:sqlite` bawaan).
* Browser modern (Chrome, Edge, Firefox, Brave).

### Langkah Menjalankan:
```bash
# 1. Clone repositori
git clone https://github.com/gandisetiawan28/alurcerita-studio.git
cd alurcerita-studio

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm start
```

Buka browser Anda dan akses:
👉 **`http://localhost:3000`**

---

## 📁 Struktur Proyek

```text
├── AlurCerita_TTS_Colab.ipynb   # Notebook Google Colab GPU (Kokoro, Nari Dia & XTTS v2)
├── index.html                   # Antarmuka studio naskah & reader
├── styles.css                   # Sistem token desain & responsivitas
├── app.js                       # Logika frontend, SSE stream, & audio player
├── server.js                    # Backend REST API Express & Colab bridge
├── db.js                        # Repositori database SQLite lokal
├── geminiService.js             # Pipeline multi-agent Gemini AI
├── scripts/
│   └── colab_sentence_tts.py    # Engine sintesis kalimat per kalimat Colab CLI
└── public/
    └── audio/                   # Direktori penyimpanan file audio MP3/WAV lokal
```

---

## 📄 Lisensi

Proyek ini berlisensi [MIT](LICENSE).
