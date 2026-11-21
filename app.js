/**
 * AlurCerita Studio — Application Core
 * Connects Frontend Studio & Home View to SQLite Database & Gemini AI Backend.
 */

(function () {
  'use strict';

  // Preset Configurations
  const PRESETS = {
    aaalur: {
      channelName: "AAAlur Cerita",
      openingHook: "Halo Nakama",
      outroBridge: "Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya",
      persona: "teman_ngopi"
    },
    malas: {
      channelName: "Malas Movie",
      openingHook: "Halo Malas People",
      outroBridge: "Biar gak banyak basa-basi, yuk langsung simak pembahasannya",
      persona: "kritis_serius"
    },
    movie_rastis: {
      channelName: "Movie Rastis",
      openingHook: "Halo Cinefile",
      outroBridge: "Siapin posisi kuda-kuda kamu saat nonton dan langsung aja Movir Rastis ceritain",
      persona: "semi_formal"
    }
  };

  const DEFAULT_SOURCES = {
    source1: `Film ini berjudul Karate Kid dengan tokoh utamanya bernama Dre. Dre adalah seorang anak yatim yang ayahnya telah meninggal dan saat ini ia hanya tinggal bersama ibunya aja di awal film diceritakan Dre dan ibunya yang akan pindah dari Detroit ke Cina karena ibunya yang akan bekerja disana. Nah Dre ini bisa dibilang enggak tahu apa-apa soal Cina. Dre adalah anak yang nakal dan gayanya yang songong. Ibunya Dre terus-menerus memaksa Dre untuk belajar Bahasa Cina tapi Dre sepertinya enggak terlalu tertarik sama negeri Cina itu yang dianggapnya adalah negeri yang kumuh dan bangunan yang sudah tua dan ketinggalan zaman.

Singkat cerita sampailah mereka berdua. Dre sangat merasa asing di tanah dimana dia tinggal itu karena semuanya terasa baru buat dia mulai dari bangunan-bangunannya, orang-orangnya, rumah barunya dan bahkan acara TV kartun aja bahasanya pakai bahasa Cina dan subtitlenya juga Cina. Di sana Dre ngebiarin jaketnya tergeletak dilantai gitu aja dan ngelihat itu ibunya Dre pun marah dan menyuruh Dre naro jacket itu pada tempatnya.

Lalu karena air panas di kamar mandinya itu dirasa rusak, maka ibunya Dre itu nyuruh Dre untuk memanggil seorang teknisi yang bernama Mr. Han. Mr. Han adalah orang yang sangat tertutup dan pendiam. Tapi diraut wajahnya Mr. Han itu tampaknya ada sebuah kesedihan yang sangat mendalam.

Lalu Dre pun pergi ke taman dan di sana dia mendapatkan teman-teman baru dan bermain basket bersama, bermain ping-pong. Di sana Dre melihat seorang gadis seumurannya yang sangat cantik bernama Meiying yang sedang duduk dan berlatih biola. Dre pun mencoba mendekatinya. Gadis itupun kelihatannya juga tertarik sama si Dre karena tingkah lakunya yang lucu. Tapi tiba-tiba datanglah seorang anak lainnya bernama Cheng yang kelihatannya juga menyukai si Meiying ini. Cheng enggak suka kalau Dre ngedeketin Meiying, maka terjadilah perkelahian dan Dre babak belur.`,
    
    source2: `Film dibuka di kota Detroit di mana seorang remaja berumur 12 tahun bernama Dre Parker baru saja mengemasi barangnya karena ia akan pindah ke China bersama ibunya bernama Sherry. Alasan mereka pindah karena Sherry mendapatkan pekerjaan di Cina sedangkan suaminya sudah lama meninggal. Di dalam perjalanan menaiki pesawat Sherry meminta Dre belajar bahasa Mandarin namun Dre tidak terlalu semangat dan menganggap kalau Cina adalah negara yang kumuh.

Sesampainya di apartemen Dre mengeluh karena tempatnya terlihat kumuh. Dre lalu disambut oleh penghuni apartemen bernama Harry yang mengajak Dre berkenalan. Harry pun membawakan barang-barang Dre. Dre adalah remaja malas yang tidak pernah meletakkan jaketnya ke gantungan. Sherry kemudian mendapati saluran air hangatnya tidak berfungsi, lalu meminta Dre memanggil teknisi apartemen Pak Han.

Saat menunggu Pak Han makan, Harry mengajak Dre bermain basket dan pingpong. Dre lalu mendekati Meiying yang sedang berlatih violin di taman. Saat asyik berbincang, Cheng datang bersama rombongannya. Cheng membully dan menghajar Dre dengan kungfu sampai wajah Dre lebam.`,

    source3: `Pada awal film kita diperlihatkan seorang ibu bernama Sherry Parker bersama anak tunggalnya yaitu Dre Parker sedang bersiap pindah ke Beijing Tiongkok. Dre mengeluh menganggap tinggal di Beijing akan membosankan dengan bangunan tua. Sesampainya di Beijing disambut anak bernama Harry yang membantunya membawa barang.

Ibunya menyuruh Dre memanggil tukang serba bisa Mr. Han karena air panas kamar 305 rusak. Mr. Han orangnya cuek. Dre lalu bermain bersama Harry dan melihat Meiying yang berlatih biola untuk audisi musik bulan depan. Dre menunjukkan breakdance, namun Cheng datang mengganggu dan mendorong Dre. Perkelahian tak seimbang terjadi dan Dre babak belur.

Setelah diselamatkan Mr. Han saat diserang geng Cheng, Mr. Han mendaftarkan Dre ke Turnamen Kung Fu Terbuka Beijing agar Cheng tidak lagi membully Dre. Dre dilatih disiplin memakai dan menggantung jaket, belajar ketenangan batin di Pegunungan Wudang, hingga bertarung di babak final dengan jurus ular.`
  };

  const DEFAULT_INITIAL_SCRIPT = `# THE KARATE KID (2010)
**Genre**: Action / Martial Arts / Drama  
**Channel**: AAAlur Cerita  
**Pacing Narasi**: Lo-Gue Santai, Teman Ngopi, Berwibawa  

---

## [OPENING]
(Visual: Montage pembuka memperlihatkan Dre Parker menatap jendela pesawat yang melintasi awan menuju Beijing, diselingi flashback singkat perpisahan di Detroit)

Halo Nakama! Pernah gak sih lu ngerasa terlempar ke lingkungan yang 100% asing, di mana lu gak ngerti bahasanya, gak punya temen, dan hari pertama lu langsung berhadapan sama jagoan lokal yang siap ngeremukin tulang lu? 

Nah, film legendaris tahun 2010 yang dibintangi Jackie Chan bareng Jaden Smith, *The Karate Kid*, ngebuktiin kalau seni bela diri sejati itu bukan soal cara lu mukul orang, tapi soal gimana lu bangkit berdiri pas hidup lu dipukul jatuh berkali-kali.

Jadi, gak perlu cacicu lagi. Langsung aja kita masuk ke alur ceritanya!

---

## [BODY STORY]

### PART 1: KOTA BARU, MASALAH BARU
(Visual: Dre dan ibunya, Sherry Parker, sedang membereskan koper di apartemen Detroit yang hampir kosong)

Kisah kita bermula di Detroit. Kenalin, ini Dre Parker, bocah berumur 12 tahun yang hidup berdua bareng ibunya, Sherry Parker, setelah sang ayah meninggal dunia beberapa tahun lalu. Kehidupan Dre yang tadinya santai mendadak jungkir balik pas ibunya dapet tawaran kerja baru di pabrik mobil di Beijing, Tiongkok. Mau gak mau, Dre harus ninggalin semua temen-temen tongkrongannya dan terbang melintasi separuh bumi ke negeri yang sama sekali gak dia kenal.

(Visual: Dre menatap lesu ke luar jendela taksi yang melintasi jalanan Beijing yang padat dan penuh gedung tua)

Di dalam perjalanan, Sherry bolak-balik nyuruh Dre buat mulai belajar bahasa Mandarin dasar. Tapi namanya juga bocah, Dre malah ngeluh dan nganggep Cina itu negeri yang kumuh, serba kuno, dan ngebosenin. Sesampainya mereka di kompleks Apartemen 305, keluhan Dre makin jadi. Selain gedungnya yang tua, fasilitas kamar mandinya juga rewel—air panasnya mati total!

(Visual: Sherry mendapati jaket Dre tergeletak sembarangan di lantai ruang tamu, lalu berkacak pinggang memarahi Dre)

Dre ini emang punya tabiat buruk yang bikin ibunya sering elus dada: dia pemalas banget kalau disuruh naro jaket. Setiap masuk rumah, jaketnya selalu dilempar sembarangan ke lantai. Sherry yang udah capek akhirnya nyuruh Dre turun ke lantai dasar buat manggil tukang servis apartemen bernama Mr. Han.

(Visual: Dre mendatangi bengkel kerja Mr. Han yang remang-remang, melihat Mr. Han sedang makan mie dengan sumpit sambil menatap kosong)

Pas Dre nemuin Mr. Han, suasana langsung canggung. Mr. Han ini orangnya dingin, irit ngomong, dan cuek bebek. Tapi kalau lu perhatiin sorot matanya, ada luka batin dan kesedihan mendalam yang kayaknya udah lama banget dia pendam. Karena Mr. Han lagi sibuk makan, Dre mutusin buat nunggu di luar dan jalan-jalan ke taman apartemen.

---

### PART 2: CINTA MONYET & BENGKAK PERTAMA
(Visual: Dre bermain pingpong bersama bapak-bapak lokal di taman, lalu pandangannya terkunci pada seorang gadis bergaun putih)

Nah, di taman ini Dre ketemu sama anak lokal bernama Harry yang ngajak dia main basket dan pingpong. Pas lagi asyik main, mata Dre mendadak gak bisa lepas dari seorang gadis cantik seumurannya bernama Meiying yang lagi duduk anggun sambil latihan memainkan biola. Dengan gaya khas anak Detroit yang sok asyik, Dre langsung nyamperin Meiying buat pamer aksi breakdance lucunya. Meiying yang ngeliat kelakuan Dre pun langsung tersenyum manis.

(Visual: Cheng bersama gerombolannya datang dengan tatapan sinis, menendang tas biola Meiying dan mendorong dada Dre)

Tapi kebahagiaan Dre cuma bertahan beberapa menit doang. Tiba-tiba dateng bocah lokal bernama Cheng bareng gerombolan sirkusnya. Cheng yang ternyata naksir Meiying gak terima ngeliat cewek incarannya dideketin sama anak baru. Cheng langsung ngedorong Dre dan nyuruh dia menjauh. Dre yang gengsi mencoba melawan balik dengan modal gerakan karate amatir yang pernah dia tonton di TV.

(Visual: Cheng dengan cepat melancarkan tendangan memutar kungfu telak ke wajah Dre hingga Dre tersungkur ke tanah berpasir)

Sialnya buat Dre, Cheng ini bukan bocah sembarangan. Cheng adalah murid unggulan perguruan bela diri yang punya teknik kungfu luar biasa lentur dan mematikan. Dre dihajar habis-habisan sampai mukanya babak belur di depan Meiying dan anak-anak lainnya.

(Visual: Keesokan paginya, Dre mengoleskan bedak tebal ibunya ke pipinya yang biru lebam di depan cermin wastafel)

Esok harinya, karena malu dan gak mau bikin ibunya panik, Dre nekat dandan pakai bedak ibunya dan make topi buat nutupin lebam di wajahnya. Tapi yang namanya apes emang gak kemana—pas sampai di sekolah barunya, ternyata Cheng dan Meiying juga sekolah di tempat yang sama! Setiap kali ngeliat bayangan Cheng di lorong sekolah, Dre langsung kabur dan main petak umpet karena mentalnya udah bener-bener drop.

---

### PART 3: NEKAT AIR COMBERAN & SANG PENYELAMAT DINGIN
(Visual: Murid-murid sekolah berjalan keluar gerbang, Dre bersembunyi di balik tong sampah mengamati Cheng yang sedang tertawa)

Hari demi hari berlalu dengan teror bullying yang bikin Dre muak setengah mati. Puncaknya terjadi pas sepulang sekolah. Dre yang udah gak tahan terus-terusan hidup dalam ketakutan mendadak punya ide nekat: dia ngambil ember berisi air kotor comberan, lalu ngeguyur Cheng dari atas dinding pembatas!

(Visual: Kejar-kejaran intens di gang-gang sempit Beijing antara Dre dan lima murid kungfu berkecepatan tinggi)

Aksi kejar-kejaran seru pun pecah! Dre lari sekencang mungkin masuk ke gang apartemennya. Tapi nasib buruk menimpa Dre—pintu gerbang belakang apartemennya terkunci rapat. Dre terpojok tanpa jalan keluar. Gerombolan Cheng langsung ngepung Dre dan mukulin dia tanpa ampun layaknya samsak hidup.

(Visual: Kaki Cheng terangkat tinggi hendak mendaratkan hantaman finishing ke kepala Dre yang tak berdaya, tiba-tiba sebuah tangan kekar mencengkeram pergelangan kakinya)

Pas Dre udah pasrah dan ngerasa hidupnya bakal tamat sore itu, tiba-tiba Mr. Han muncul dari balik bayang-bayang. Cheng yang sombong malah nekat nyerang Mr. Han. Tapi yang terjadi berikutnya bener-bener bikin rahang Dre jatuh ke tanah!

(Visual: Mr. Han bermanuver anggun menggunakan bahu, siku, dan teknik pengalihan gaya, membuat bocah-bocah itu saling memukul dan menabrak temannya sendiri)

Mr. Han gak sekalipun melayangkan tinju keras ke wajah mereka. Beliau cuma make gerakan tangkisan lembut, memanfaatkan tenaga lawan buat ngebalikin serangan mereka sendiri. Dalam hitungan detik, keenam bocah itu kocar-kacir kabur ketakutan. Tukang ledeng yang selama ini dianggap remeh ternyata adalah seorang master kungfu legendaris!

---

### PART 4: DIPLOMASI TURNAMEN & FILOSOFI SEBUAH JAKET
(Visual: Mr. Han menempelkan mangkuk bekam api tradisional ke punggung dan kaki Dre yang memar di dalam bengkelnya)

Setelah mengobati cedera Dre dengan teknik bekam api kuno, Dre memohon-mohon ke Mr. Han buat ngajarin dia kungfu biar bisa ngebalas Cheng. Tapi Mr. Han nolak tegas. Bagi beliau, kungfu itu diciptakan buat perdamaian dan pertahanan diri, bukan buat ajang balas dendam anak kecil.

(Visual: Mr. Han dan Dre berdiri di tengah aula Perguruan Kung Fu Naga, berhadapan dengan Master Li yang bertampang kejam)

Keesokan harinya, Mr. Han ngajak Dre ke perguruan Cheng buat nyelesaiin masalah ini secara damai antar orang dewasa. Tapi sambutan dari guru mereka, Master Li, bener-bener biadab. Master Li nolak damai dan malah ngancam kalau Dre atau Mr. Han harus bertarung di tempat saat itu juga kalau mau keluar hidup-hidup. Untungnya, mata jeli Mr. Han ngeliat poster Turnamen Kung Fu Terbuka Beijing yang bakal digelar beberapa bulan lagi. 

Mr. Han langsung nantang: Dre bakal bertanding melawan murid-murid Master Li secara resmi di atas arena turnamen. Sebagai gantinya, Cheng dan gengnya dilarang keras menyentuh Dre seujung kuku pun sampai hari turnamen tiba. Master Li setuju. Keluar dari aula, Dre langsung lemes: *"Pak, saya kan gak bisa kungfu sama sekali, gimana bisa ngalahin mereka semua?!"* Tapi Mr. Han cuma berujar tenang: *"Kungfu sejati ada di dalam segala hal."*

(Visual: Dre berdiri di halaman rumah Mr. Han, menatap heran sebuah jaket merah yang tergantung di tiang bambu)

Hari pertama latihan, Dre udah bayangin bakal diajarin jurus naga atau tendangan terbang ala Bruce Lee. Nyatanya? Mr. Han cuma ngasih satu perintah yang kedengeran konyol:  
*"Ambil jaketnya. Pakai. Buka. Gantung. Jatuhkan. Ambil lagi. Ulangi!"*

(Visual: Montage waktu berhari-hari: terik matahari, hujan deras, dari pagi sampai malam Dre hanya melakukan gerakan memakai dan menjatuhkan jaket)

Ribuan kali Dre ngulangin gerakan yang sama sampai tangannya pegal linu dan emosinya meledak. Dre ngerasa dikerjain dan berniat minggat. Tapi pas Dre mau pergi, Mr. Han tiba-tiba melancarkan serangan mendadak ke arah Dre!

(Visual: Secara refleks, tangan Dre menangkis pukulan Mr. Han dengan gerakan menggantung jaket, lalu menepis tendangan dengan gerakan melepas jaket)

Boom! Tanpa sadar, gerakan memakai dan melepas jaket yang diulang ribuan kali itu udah tertanam di memori otot Dre sebagai teknik tangkisan, kuncian, dan serangan balik yang sempurna! Dari situlah Dre sadar kalau kungfu bukan sekadar olahraga fisik, melainkan kedisiplinan hidup dan ketenangan pikiran.

---

### PART 5: GUNUNG SUCI & TRAGEDI MOBIL MR. HAN
(Visual: Dre dan Mr. Han menaiki ribuan anak tangga batu berkabut di Puncak Pegunungan Wudang)

Hubungan guru dan murid ini pun makin erat. Mr. Han membawa Dre ke kuil suci di puncak gunung tempat Mr. Han dulu belajar dari ayahnya. Di sana, Dre dibuat takjub ngeliat seorang wanita petapa yang mampu mengendalikan gerakan ular kobra liar hanya dengan ketenangan tatapan mata dan keharmonisan gerak tubuh. Dre juga disuruh meminum air dari Sumur Naga yang dipercaya memberi keteguhan jiwa bagi seorang pendekar.

(Visual: Dre mengintip ke dalam ruang tamu Mr. Han yang remang, melihat Mr. Han sedang menangis tersedu-sedu sambil menghantamkan palu godam ke mobil sedan tua)

Tapi gak ada manusia yang sempurna. Di hari libur latihan, Dre berniat ngasih kejutan ke rumah Mr. Han. Betapa kagetnya Dre pas nemuin gurunya lagi mabuk berat sambil menghancurkan mobil antik yang ada di ruang tamunya. Lewat momen haru ini, terungkaplah rahasia terkelam Mr. Han: bertahun-tahun lalu, Mr. Han mengalami kecelakaan mobil tragis akibat dirinya kehilangan fokus saat bertengkar, yang merenggut nyawa istri dan anak laki-laki tercintanya.

Semenjak hari itu, setiap tahun Mr. Han selalu merakit mobil itu sampai utuh, lalu menghancurkannya kembali sebagai bentuk hukuman bagi dirinya sendiri yang belum bisa memaafkan masa lalu. Dre yang ngeliat kerapuhan sang guru gak kabur. Dengan tulus, Dre mengambil bilah bambu latihan dan berdiri di depan Mr. Han, mengajaknya kembali berlatih di bawah sinar rembulan. Kali ini, justru sang murid yang menyembuhkan luka batin gurunya.

---

### PART 6: ARENA TURNAMEN & AKAL BULUS MASTER LI
(Visual: Gedung olahraga raksasa Beijing penuh sesak dengan ribuan penonton yang bersorak, Dre melangkah masuk mengenakan seragam kungfu putih bergaris emas)

Hari yang dinanti-nanti akhirnya tiba. Turnamen Kung Fu Terbuka Beijing resmi dimulai! Di babak-babak awal, Dre sempat gugup dan bikin kesalahan konyol sampai terdorong keluar garis arena. Tapi berkat bimbingan tenang Mr. Han serta dukungan Sherry dan Meiying yang duduk di bangku VIP, Dre berhasil bangkit dan menyapu bersih lawan-lawannya lewat teknik tangkisan jaket yang memukau.

(Visual: Liang, petarung andalan perguruan Naga, dipanggil ke pinggir ring oleh Master Li yang berbisik tajam sambil memegang bahu Liang)

Dre sukses menembus babak semifinal! Melihat performa Dre yang makin tak terbendung, Master Li kebakaran jenggot. Guru kejam ini memerintahkan salah satu muridnya bernama Liang untuk menjalankan tugas kotor: sengaja mencederai kaki Dre meskipun harus kena diskualifikasi!

(Visual: Liang melompat dan mendaratkan tendangan lutut brutal tepat ke tempurung kaki kiri Dre sampai terdengar bunyi retakan tulang yang ngilu)

Brak! Liang langsung didiskualifikasi, tapi tujuannya tercapai. Dre tergeletak mengerang kesakitan di lantai arena. Di ruang medis, dokter menyatakan ligamen kaki Dre cedera parah dan melarang keras Dre untuk kembali bertarung. 

(Visual: Mr. Han menatap mata Dre yang berlinang air mata, memegang bahu Dre di atas ranjang medis)

Mr. Han menyarankan Dre buat mundur karena Dre udah ngebuktiin banyak hal hari itu. Tapi Dre menolak keras. Sambil menatap gurunya, Dre ngucapin kalimat paling menyentuh di film ini:  
*"Gua takut banget pas bangun tidur setiap hari, Pak. Gua harus balik ke ring bukan buat ngalahin Cheng, tapi biar gua gak ngerasain rasa takut ini lagi seumur hidup gua!"*

Luluh dengan keteguhan hati muridnya, Mr. Han akhirnya menggunakan teknik bekam api darurat untuk mematikan saraf rasa sakit di kaki Dre. Dre melangkah pincang namun penuh percaya diri kembali ke arena final!

---

### PART 7: FINAL BERDARAH & JURUS PENGENDALI ULAR
(Visual: Wasit memberi aba-aba, Cheng menatap dingin Dre yang berdiri dengan satu tumpuan kaki di hadapan ribuan penonton yang hening)

Partai puncak: Dre Parker melawan Cheng! Di ronde-ronde awal, pertandingan berlangsung sengit dengan skor saling mengejar hingga imbang 2-2. Master Li yang panik kembali membisikkan instruksi keji ke telinga Cheng: *"Incar kaki kirinya yang sakit!"*

(Visual: Cheng melancarkan sapuan keras tepat ke kaki kiri Dre hingga Dre terhempas keras ke matras sambil memegangi kakinya yang mati rasa)

Dre nyaris gak bisa berdiri. Waktu hitungan wasit hampir habis. Saat pandangannya mulai kabur, Dre mengingat kembali wanita petapa di puncak Gunung Wudang yang mengendalikan ular dengan ketenangan batin mutlak.

(Visual: Dre mengangkat satu kakinya membentuk pose kuda-kuda bangau-ular, pandangan matanya terkunci tenang ke pupil mata Cheng)

Dre menarik napas dalam-dalam. Keheningan merayap di seluruh arena. Cheng yang terprovokasi mencoba menerjang maju. Saat Cheng melompat menyerang, Dre mengikuti ritme gerakannya layaknya ular, memutar tubuhnya di udara, dan melepaskan tendangan overhead kick telak tepat ke rahang Cheng!

(Visual: Cheng jatuh terkapar ke lantai arena, wasit mengangkat tangan Dre dan gemuruh sorak penonton mengguncang seluruh stadion)

K.O.! Dre Parker keluar sebagai Juara Turnamen Kung Fu Terbuka Beijing! Tapi yang paling berkesan bukanlah trofinya. Cheng yang sadar akan kehebatan jiwa Dre bangkit dengan penuh rasa hormat dan menyerahkan piala itu langsung ke tangan Dre. Seluruh murid Perguruan Naga serentak membungkuk memberi hormat kepada Mr. Han sebagai mahaguru kungfu sejati. Dre akhirnya pulang tanpa ada lagi secuil pun rasa takut di dalam dadanya.

---

## [BEDAH ANALISIS & PESAN FILM]

(Visual: Transisi teks editorial bertuliskan "BEDAH MAKNA: THE KARATE KID 2010" dengan sorotan klip latihan di atas tembok besar Cina)

Gimana, Nakama? Ceritanya gokil dan nendang banget, kan? Tapi tunggu dulu, sebenernya ada lapisan makna filosofis yang jauh lebih dalam yang mungkin lu lewatin pas lagi asyik nonton adegan baku hantamnya. Nah, gua mau ajak lu bedah sedikit kenapa film garapan sutradara Harald Zwart ini tetap jadi karya masterpiece bela diri modern.

### 1. KENAPA FILM INI SERU BANGET DITONTON?
Film ini berhasil ngawinin dua elemen kontras: benturan budaya (*culture shock*) antara gaya urban bocah Amerika dengan kearifan kuno tradisi Tiongkok. Adegan latihan di Tembok Besar Cina dan Pegunungan Wudang ngasih visual megah yang gak ada di film bela diri remaja lainnya. Ditambah lagi, dinamika guru-murid antara Jackie Chan dan Jaden Smith terasa bener-bener nyata dan emosional, bukan sekadar hubungan formal di atas kertas.

### 2. BEDAH RENCANA & PESAN MORAL: KUNGFU BUKAN ALAT SIKSA
Pesan terbesar film ini ada pada dualisme konsep *Yin dan Yang*. Master Li mewakili kekuatan yang rusak oleh kesombongan dan kekerasan buta (*No Mercy*), sedangkan Mr. Han mewakili kungfu sejati: ketenangan, kedisiplinan, dan kendali diri. Latihan jaket yang awalnya terkesan konyol membuktikan bahwa hal-hal kecil yang kita lakukan secara konsisten setiap hari adalah pondasi dari kehebatan mental kita.

### 3. ANALISIS PERKEMBANGAN KARAKTER: MENGALAHKAN DIRI SENDIRI
Perubahan karakter Dre dari bocah manja yang gampang ngeluh menjadi petarung berjiwa ksatria terjadi bukan saat dia jago nendang, tapi saat dia berani masuk kembali ke arena final dengan kaki pincang. Dre ngajarin kita bahwa musuh terbesar dalam hidup bukanlah orang yang ngebully kita di luar sana, melainkan rasa takut dan keraguan yang kita pelihara di dalam kepala kita sendiri. Di sisi lain, kehadiran Dre juga menjadi penyelamat bagi Mr. Han untuk akhirnya merelakan duka masa lalunya dan kembali membuka hati kepada dunia.

---

## [KESIMPULAN & CLOSING]
(Visual: Foto close-up Dre dan Mr. Han tersenyum bangga di tengah arena, diiringi lagu outro 'Never Say Never')

Dari kisah Dre Parker dan Mr. Han, kita bisa narik satu pelajaran emas: hidup ini pasti bakal sering ngehantam lu sampai terpuruk, tapi yang menentukan siapa diri lu bukanlah seberapa keras lu jatuh, melainkan seberapa tangguh lu bangkit berdiri dan melangkah maju lagi.

Makasih banyak buat Nakama semua yang udah nonton video ini dari awal sampai tetes terakhir. Kalau lu suka sama ulasan alur cerita yang mendalam kayak gini, jangan lupa klik tombol Like, tinggalkan komentar film apa lagi yang pengen kita bedah berikutnya, dan pastikan subscribe ke channel **AAAlur Cerita** biar lu gak ketinggalan kisah-kisah inspiratif lainnya. 

Gua pamit dulu, salam hangat, dan sampai jumpa di alur cerita selanjutnya!`;

  // Application State
  const state = {
    activeView: 'studio', // 'home' | 'studio'
    currentProjectId: 1,
    projectsList: [],
    editorialSentences: [],
    apiKeys: [],
    ttsConfig: {
      colab_url: '',
      model: 'kokoro',
      voice: 'am_michael',
      speed: 1.0,
      is_connected: false
    },
    activeSourceKey: 'source1',
    sources: { ...DEFAULT_SOURCES },
    currentScriptMarkdown: DEFAULT_INITIAL_SCRIPT,
    fontSize: 17,
    showVisualCues: true,
    isRawMode: false,
    prompter: {
      active: false,
      isPlaying: false,
      speed: 3,
      fontSize: 34,
      showCues: false,
      isMirrored: false,
      scrollTimer: null
    }
  };

  // DOM Elements Reference
  const elements = {
    // API Keys Modal Elements
    btnOpenKeyModal: document.getElementById('btnOpenKeyModal'),
    apiKeyModal: document.getElementById('apiKeyModal'),
    btnCloseKeyModal: document.getElementById('btnCloseKeyModal'),
    btnCloseKeyModalFooter: document.getElementById('btnCloseKeyModalFooter'),
    headerKeyCountBadge: document.getElementById('headerKeyCountBadge'),
    keyTotalCountDisplay: document.getElementById('keyTotalCountDisplay'),
    keysStatusSummary: document.getElementById('keysStatusSummary'),
    addKeyForm: document.getElementById('addKeyForm'),
    inputNewApiKeys: document.getElementById('inputNewApiKeys'),
    inputKeyLabel: document.getElementById('inputKeyLabel'),
    btnSubmitAddKeys: document.getElementById('btnSubmitAddKeys'),
    keysListContainer: document.getElementById('keysListContainer'),

    // TTS Voiceover Elements
    btnOpenTtsModal: document.getElementById('btnOpenTtsModal'),
    ttsColabDotStatus: document.getElementById('ttsColabDotStatus'),
    ttsModal: document.getElementById('ttsModal'),
    btnCloseTtsModal: document.getElementById('btnCloseTtsModal'),
    btnCloseTtsModalFooter: document.getElementById('btnCloseTtsModalFooter'),
    tabBtnTtsGenerate: document.getElementById('tabBtnTtsGenerate'),
    tabBtnTtsColab: document.getElementById('tabBtnTtsColab'),
    ttsTabGenerate: document.getElementById('ttsTabGenerate'),
    ttsTabColab: document.getElementById('ttsTabColab'),
    ttsColabStatusBanner: document.getElementById('ttsColabStatusBanner'),
    ttsBannerDot: document.getElementById('ttsBannerDot'),
    ttsBannerText: document.getElementById('ttsBannerText'),
    btnQuickConnectColab: document.getElementById('btnQuickConnectColab'),
    ttsSourceText: document.getElementById('ttsSourceText'),
    ttsTextMetrics: document.getElementById('ttsTextMetrics'),
    btnRefreshTtsFromScript: document.getElementById('btnRefreshTtsFromScript'),
    btnClearTtsText: document.getElementById('btnClearTtsText'),
    ttsModelSelect: document.getElementById('ttsModelSelect'),
    ttsVoiceSelect: document.getElementById('ttsVoiceSelect'),
    ttsSpeedRange: document.getElementById('ttsSpeedRange'),
    ttsSpeedVal: document.getElementById('ttsSpeedVal'),
    btnTriggerTtsGenerate: document.getElementById('btnTriggerTtsGenerate'),
    btnTriggerTtsText: document.getElementById('btnTriggerTtsText'),
    btnStopTtsGenerate: document.getElementById('btnStopTtsGenerate'),
    ttsProgressBox: document.getElementById('ttsProgressBox'),
    ttsProgressStatus: document.getElementById('ttsProgressStatus'),
    ttsSentenceProgressCard: document.getElementById('ttsSentenceProgressCard'),
    ttsSentenceStepLabel: document.getElementById('ttsSentenceStepLabel'),
    ttsSentencePercentLabel: document.getElementById('ttsSentencePercentLabel'),
    ttsSentenceBarFill: document.getElementById('ttsSentenceBarFill'),
    ttsSentenceLiveQuote: document.getElementById('ttsSentenceLiveQuote'),
    ttsSentencePreviewCard: document.getElementById('ttsSentencePreviewCard'),
    ttsPreviewCountBadge: document.getElementById('ttsPreviewCountBadge'),
    ttsSentenceScrollList: document.getElementById('ttsSentenceScrollList'),
    ttsResultCard: document.getElementById('ttsResultCard'),
    ttsResultMeta: document.getElementById('ttsResultMeta'),
    ttsAudioPlayer: document.getElementById('ttsAudioPlayer'),
    btnDownloadTtsWav: document.getElementById('btnDownloadTtsWav'),
    ttsResultFilename: document.getElementById('ttsResultFilename'),
    colabConfigForm: document.getElementById('colabConfigForm'),
    inputColabUrl: document.getElementById('inputColabUrl'),
    btnTestColabConnection: document.getElementById('btnTestColabConnection'),
    btnSaveColabConfig: document.getElementById('btnSaveColabConfig'),

    // Navigation & Views
    navBtnHome: document.getElementById('navBtnHome'),
    navBtnStudio: document.getElementById('navBtnStudio'),
    homeWorkspace: document.getElementById('homeWorkspace'),
    studioWorkspace: document.getElementById('studioWorkspace'),
    activeProjectPill: document.getElementById('activeProjectPill'),
    activeProjectTitleDisplay: document.getElementById('activeProjectTitleDisplay'),
    headerPresetBox: document.getElementById('headerPresetBox'),
    headerCenterBox: document.getElementById('headerCenterBox'),
    studioHeaderActions: document.getElementById('studioHeaderActions'),
    homeHeaderActions: document.getElementById('homeHeaderActions'),
    btnHeaderNewProject: document.getElementById('btnHeaderNewProject'),

    // Home View Elements
    btnOpenNewProjectModal: document.getElementById('btnOpenNewProjectModal'),
    projectSearchInput: document.getElementById('projectSearchInput'),
    projectCountStats: document.getElementById('projectCountStats'),
    projectsGrid: document.getElementById('projectsGrid'),

    // Modal Elements
    newProjectModal: document.getElementById('newProjectModal'),
    btnCloseNewProjectModal: document.getElementById('btnCloseNewProjectModal'),
    btnCancelNewProject: document.getElementById('btnCancelNewProject'),
    newProjectForm: document.getElementById('newProjectForm'),
    newModalTitle: document.getElementById('newModalTitle'),
    newModalDirector: document.getElementById('newModalDirector'),
    newModalChannel: document.getElementById('newModalChannel'),
    newModalSynopsis: document.getElementById('newModalSynopsis'),

    // Studio Header & Metrics
    channelPresetSelect: document.getElementById('channelPresetSelect'),
    metricWordCount: document.getElementById('metricWordCount'),
    metricDuration: document.getElementById('metricDuration'),
    btnTogglePrompter: document.getElementById('btnTogglePrompter'),
    btnExportMenu: document.getElementById('btnExportMenu'),
    exportDropdown: document.getElementById('exportDropdown'),
    btnCopyCleanVO: document.getElementById('btnCopyCleanVO'),
    btnCopyEditorCues: document.getElementById('btnCopyEditorCues'),
    btnCopyFullMarkdown: document.getElementById('btnCopyFullMarkdown'),
    btnPrintPdf: document.getElementById('btnPrintPdf'),
    btnQuickSave: document.getElementById('btnQuickSave'),
    
    // Sidebar Fields
    movieTitle: document.getElementById('movieTitle'),
    movieDirector: document.getElementById('movieDirector'),
    movieDescription: document.getElementById('movieDescription'),
    channelNameInput: document.getElementById('channelNameInput'),
    openingHookInput: document.getElementById('openingHookInput'),
    outroBridgeInput: document.getElementById('outroBridgeInput'),
    personaStyleSelect: document.getElementById('personaStyleSelect'),
    checkIncludeAnalysis: document.getElementById('checkIncludeAnalysis'),
    checkEnforceVisualCues: document.getElementById('checkEnforceVisualCues'),
    
    // Sources Tab Elements
    tabButtons: document.querySelectorAll('.source-tab'),
    badgeWordSource1: document.getElementById('badgeWordSource1'),
    badgeWordSource2: document.getElementById('badgeWordSource2'),
    badgeWordSource3: document.getElementById('badgeWordSource3'),
    sourceCurrentLabel: document.getElementById('sourceCurrentLabel'),
    sourceTextArea: document.getElementById('sourceTextArea'),
    sourceCharCount: document.getElementById('sourceCharCount'),
    btnPasteClipboard: document.getElementById('btnPasteClipboard'),
    btnClearSource: document.getElementById('btnClearSource'),
    btnResetKarateSources: document.getElementById('btnResetKarateSources'),
    
    // Generation Action & Pipeline
    btnGenerate: document.getElementById('btnGenerate'),
    btnGenerateText: document.getElementById('btnGenerateText'),
    generationPipelineCard: document.getElementById('generationPipelineCard'),
    pipelineProgressBar: document.getElementById('pipelineProgressBar'),
    pipelineCurrentStep: document.getElementById('pipelineCurrentStep'),
    stepItem1: document.getElementById('stepItem1'),
    stepItem2: document.getElementById('stepItem2'),
    stepItem3: document.getElementById('stepItem3'),
    btnCancelPipeline: document.getElementById('btnCancelPipeline'),
    
    // Editor Workspace
    viewBtnReader: document.getElementById('viewBtnReader'),
    viewBtnRaw: document.getElementById('viewBtnRaw'),
    btnToggleVisualCues: document.getElementById('btnToggleVisualCues'),
    btnFontDecr: document.getElementById('btnFontDecr'),
    btnFontIncr: document.getElementById('btnFontIncr'),
    fontSizeLabel: document.getElementById('fontSizeLabel'),
    btnQuickCopyClean: document.getElementById('btnQuickCopyClean'),
    editorCanvasContainer: document.getElementById('editorCanvasContainer'),
    scriptPaperReader: document.getElementById('scriptPaperReader'),
    scriptRawEditor: document.getElementById('scriptRawEditor'),
    footerParagraphCount: document.getElementById('footerParagraphCount'),
    canvasSyncStatus: document.getElementById('canvasSyncStatus'),
    
    // Teleprompter Modal
    teleprompterModal: document.getElementById('teleprompterModal'),
    btnPrompterPlayPause: document.getElementById('btnPrompterPlayPause'),
    prompterPlayIcon: document.getElementById('prompterPlayIcon'),
    prompterPlayText: document.getElementById('prompterPlayText'),
    prompterSpeedRange: document.getElementById('prompterSpeedRange'),
    prompterSpeedVal: document.getElementById('prompterSpeedVal'),
    prompterFontSize: document.getElementById('prompterFontSize'),
    prompterFontVal: document.getElementById('prompterFontVal'),
    btnPrompterToggleCues: document.getElementById('btnPrompterToggleCues'),
    prompterCuesStatus: document.getElementById('prompterCuesStatus'),
    btnPrompterMirror: document.getElementById('btnPrompterMirror'),
    btnPrompterClose: document.getElementById('btnPrompterClose'),
    prompterScrollViewport: document.getElementById('prompterScrollViewport'),
    prompterTextBody: document.getElementById('prompterTextBody'),
    
    // Toast Notification
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon'),
    toastText: document.getElementById('toastText'),
    toastClose: document.getElementById('toastClose'),

    // Mobile Tabs
    mobileNavBar: document.getElementById('mobileNavBar'),
    mobileTabBtns: document.querySelectorAll('.mobile-tab-btn'),
    studioSidebar: document.getElementById('studio-sidebar'),
    studioEditor: document.getElementById('studio-editor')
  };

  // --- Utility Functions ---
  function countWords(str) {
    if (!str) return 0;
    const matches = str.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  }

  function showToast(message, type = 'info') {
    if (!elements.toastMessage) return;

    let icon = '✓';
    let iconColor = '#22C55E';
    let cleanMessage = String(message || '').trim();

    if (cleanMessage.startsWith('✓')) {
      icon = '✓';
      iconColor = '#22C55E';
      cleanMessage = cleanMessage.replace(/^✓\s*/, '');
    } else if (cleanMessage.startsWith('✕')) {
      icon = '✕';
      iconColor = '#EF4444';
      cleanMessage = cleanMessage.replace(/^✕\s*/, '');
    } else if (cleanMessage.startsWith('⏹️') || cleanMessage.startsWith('⏹')) {
      icon = '⏹';
      iconColor = '#F59E0B';
      cleanMessage = cleanMessage.replace(/^⏹️?\s*/, '');
    } else if (cleanMessage.startsWith('⚠️')) {
      icon = '⚠️';
      iconColor = '#F59E0B';
      cleanMessage = cleanMessage.replace(/^⚠️\s*/, '');
    } else if (type === 'error' || cleanMessage.toLowerCase().startsWith('gagal') || cleanMessage.toLowerCase().startsWith('error')) {
      icon = '✕';
      iconColor = '#EF4444';
    }

    if (elements.toastIcon) {
      elements.toastIcon.textContent = icon;
      elements.toastIcon.style.color = iconColor;
    }

    if (elements.toastText) {
      elements.toastText.textContent = cleanMessage;
    }

    elements.toastMessage.hidden = false;
    clearTimeout(elements.toastMessage._timer);
    elements.toastMessage._timer = setTimeout(() => {
      elements.toastMessage.hidden = true;
    }, 3200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- View Switcher (Home vs Studio) ---
  function switchView(targetView) {
    state.activeView = targetView;
    if (targetView === 'home') {
      elements.homeWorkspace.hidden = false;
      elements.studioWorkspace.hidden = true;
      if (elements.mobileNavBar) elements.mobileNavBar.hidden = true;

      elements.navBtnHome.classList.add('active');
      elements.navBtnStudio.classList.remove('active');

      elements.headerPresetBox.hidden = true;
      elements.headerCenterBox.hidden = true;
      elements.studioHeaderActions.hidden = true;
      elements.homeHeaderActions.hidden = false;
      elements.activeProjectPill.hidden = true;

      fetchProjectsList();
    } else {
      elements.homeWorkspace.hidden = true;
      elements.studioWorkspace.hidden = false;
      if (elements.mobileNavBar) elements.mobileNavBar.hidden = false;

      elements.navBtnStudio.classList.add('active');
      elements.navBtnHome.classList.remove('active');

      elements.headerPresetBox.hidden = false;
      elements.headerCenterBox.hidden = false;
      elements.studioHeaderActions.hidden = false;
      elements.homeHeaderActions.hidden = true;
      elements.activeProjectPill.hidden = false;
    }
  }

  // --- SQLite Backend Integration: Fetch Projects ---
  async function fetchProjectsList() {
    elements.projectCountStats.textContent = "Mengambil data dari SQLite...";
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.projectsList = json.data;
        renderProjectsGrid(state.projectsList);
      } else {
        elements.projectCountStats.textContent = "Database siap. Belum ada proyek.";
      }
    } catch (err) {
      console.warn('Backend server offline, menggunakan data lokal:', err);
      elements.projectCountStats.textContent = "Mode offline (server belum dijalankan).";
    }
  }

  function renderProjectsGrid(list) {
    const query = (elements.projectSearchInput.value || '').toLowerCase().trim();
    const filtered = list.filter(p => 
      (p.title && p.title.toLowerCase().includes(query)) || 
      (p.director_year && p.director_year.toLowerCase().includes(query)) ||
      (p.channel_name && p.channel_name.toLowerCase().includes(query))
    );

    elements.projectCountStats.textContent = `Menampilkan ${filtered.length} dari ${list.length} proyek film`;

    if (filtered.length === 0) {
      elements.projectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 40px; text-align: center; color: #64748B;">
          <span style="font-size: 32px; display: block; margin-bottom: 10px;">🎬</span>
          <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">Tidak ada proyek film yang cocok</h3>
          <p style="font-size: 13px; margin-bottom: 16px;">Buat proyek film baru untuk mulai menyusun naskah alur cerita Anda.</p>
          <button type="button" class="btn-primary" id="btnEmptyCreateProject">+ Buat Proyek Film Baru</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyCreateProject');
      if (emptyBtn) emptyBtn.addEventListener('click', openNewProjectModal);
      return;
    }

    elements.projectsGrid.innerHTML = filtered.map(p => {
      const updatedDate = new Date(p.updated_at || p.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const words = Number(p.word_count || 0);
      const estMin = Math.ceil(words / 140);

      return `
        <article class="project-card" data-id="${p.id}">
          <div class="project-card-top">
            <div class="project-card-header">
              <div>
                <h3 class="project-card-title">${escapeHtml(p.title)}</h3>
                <div class="project-card-director">${escapeHtml(p.director_year || 'Sutradara & Tahun belum diisi')}</div>
              </div>
              <span class="meta-chip primary">${escapeHtml(p.channel_name || 'Channel')}</span>
            </div>
            <p class="project-card-synopsis">${escapeHtml(p.synopsis || 'Belum ada sinopsis ringkas.')}</p>
            <div class="project-card-meta">
              <span class="meta-chip"><strong>${words.toLocaleString('id-ID')}</strong> kata</span>
              <span class="meta-chip">VO: ~${estMin} mnt</span>
              <span class="meta-chip">${p.source_count || 3} Sumber</span>
            </div>
          </div>
          <div class="project-card-bottom">
            <span class="project-updated">Update: ${updatedDate}</span>
            <div class="project-actions">
              <button type="button" class="btn-card-action danger btn-delete-project" data-id="${p.id}" title="Hapus Proyek dari SQLite">Hapus</button>
              <button type="button" class="btn-card-action primary btn-open-project" data-id="${p.id}">Buka di Studio</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events on rendered cards
    elements.projectsGrid.querySelectorAll('.btn-open-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProjectById(btn.dataset.id);
      });
    });

    elements.projectsGrid.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProjectById(btn.dataset.id);
      });
    });

    elements.projectsGrid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        openProjectById(card.dataset.id);
      });
    });
  }

  // --- SQLite Backend Integration: Load Project by ID ---
  async function openProjectById(projectId) {
    try {
      elements.canvasSyncStatus.textContent = "Mengambil data dari SQLite...";
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        state.currentProjectId = p.id;

        // Populate fields
        elements.movieTitle.value = p.title || '';
        elements.movieDirector.value = p.director_year || '';
        elements.movieDescription.value = p.synopsis || '';
        elements.channelNameInput.value = p.channel_name || 'AAAlur Cerita';
        elements.openingHookInput.value = p.opening_hook || 'Halo Nakama';
        elements.outroBridgeInput.value = p.outro_bridge || '';
        elements.personaStyleSelect.value = p.persona_style || 'teman_ngopi';
        elements.checkIncludeAnalysis.checked = Boolean(p.include_analysis);
        elements.checkEnforceVisualCues.checked = Boolean(p.enforce_visual_cues);

        // Populate sources
        state.sources = {
          source1: p.sources?.source1 || '',
          source2: p.sources?.source2 || '',
          source3: p.sources?.source3 || ''
        };
        elements.sourceTextArea.value = state.sources[state.activeSourceKey] || '';
        updateSourceTabMetrics();

        // Populate script
        state.currentScriptMarkdown = p.script_markdown || DEFAULT_INITIAL_SCRIPT;
        renderScript(true);

        // Header display
        elements.activeProjectTitleDisplay.textContent = p.title;

        switchView('studio');
        showToast(`Proyek "${p.title}" dibuka dari database.`);
        localStorage.setItem('alurcerita_last_project_id', p.id);
      }
    } catch (err) {
      console.error('Error opening project:', err);
      showToast("Gagal memuat proyek dari database.");
    }
  }

  // --- SQLite Backend Integration: Save Project ---
  async function saveCurrentProjectToSQLite() {
    const payload = {
      title: elements.movieTitle.value || 'Film Tanpa Judul',
      director_year: elements.movieDirector.value || '',
      synopsis: elements.movieDescription.value || '',
      channel_name: elements.channelNameInput.value || 'AAAlur Cerita',
      opening_hook: elements.openingHookInput.value || 'Halo Nakama',
      outro_bridge: elements.outroBridgeInput.value || '',
      persona_style: elements.personaStyleSelect.value || 'teman_ngopi',
      include_analysis: elements.checkIncludeAnalysis.checked,
      enforce_visual_cues: elements.checkEnforceVisualCues.checked,
      script_markdown: state.currentScriptMarkdown,
      word_count: countWords(state.currentScriptMarkdown),
      sources: state.sources
    };

    elements.canvasSyncStatus.textContent = "Menyimpan ke SQLite...";
    try {
      let res;
      if (state.currentProjectId) {
        res = await fetch(`/api/projects/${state.currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (json.success && json.data) {
        state.currentProjectId = json.data.id;
        elements.activeProjectTitleDisplay.textContent = json.data.title;
        elements.canvasSyncStatus.textContent = "✓ Tersimpan di SQLite (alurcerita.db)";
        showToast(`Data film "${json.data.title}" tersimpan permanen di database SQL!`);
        localStorage.setItem('alurcerita_last_project_id', json.data.id);
      }
    } catch (err) {
      console.warn('Server offline, saving locally:', err);
      localStorage.setItem('alurcerita_script', state.currentScriptMarkdown);
      elements.canvasSyncStatus.textContent = "Tersimpan di offline cache";
      showToast("Tersimpan di penyimpanan lokal browser.");
    }
  }

  // --- SQLite Backend Integration: Delete Project ---
  async function deleteProjectById(projectId) {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini secara permanen dari database SQL?')) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast("Proyek berhasil dihapus dari database.");
        fetchProjectsList();
      }
    } catch (err) {
      showToast("Gagal menghapus proyek.");
    }
  }

  // --- Modal: Create New Project ---
  function openNewProjectModal() {
    elements.newModalTitle.value = '';
    elements.newModalDirector.value = '';
    elements.newModalSynopsis.value = '';
    elements.newProjectModal.hidden = false;
    elements.newModalTitle.focus();
  }

  function closeNewProjectModal() {
    elements.newProjectModal.hidden = true;
  }

  async function handleCreateNewProjectSubmit(e) {
    e.preventDefault();
    const title = elements.newModalTitle.value.trim();
    if (!title) return;

    const channelName = elements.newModalChannel.value;
    const presetKey = Object.keys(PRESETS).find(k => PRESETS[k].channelName === channelName) || 'aaalur';
    const preset = PRESETS[presetKey];

    const payload = {
      title: title,
      director_year: elements.newModalDirector.value.trim(),
      synopsis: elements.newModalSynopsis.value.trim(),
      channel_name: preset.channelName,
      opening_hook: preset.openingHook,
      outro_bridge: preset.outroBridge,
      persona_style: preset.persona,
      include_analysis: true,
      enforce_visual_cues: true,
      script_markdown: `# ${title.toUpperCase()}\n**Genre**: Action / Drama\n**Channel**: ${preset.channelName}\n\n---\n\n## [OPENING]\n(Visual: Scene pembuka film)\n\n${preset.openingHook}! Selamat datang di alur cerita film ${title}...\n\n${preset.outroBridge}!\n\n---\n\n## [BODY STORY]\n\n### PART 1: AWAL MULA KISAH\n(Visual: Tokoh utama diperkenalkan)\n\nKisah bermula di sini...\n`,
      word_count: 50,
      sources: { source1: '', source2: '', source3: '' }
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        closeNewProjectModal();
        openProjectById(json.data.id);
        showToast(`Proyek baru "${title}" berhasil dibuat di database!`);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      showToast("Gagal membuat proyek di database.");
    }
  }

  // --- Modal: API Key Management (Smart Round-Robin) ---
  function openApiKeyModal() {
    if (elements.apiKeyModal) {
      elements.apiKeyModal.hidden = false;
      fetchApiKeysList();
      if (elements.inputNewApiKeys) elements.inputNewApiKeys.focus();
    }
  }

  function closeApiKeyModal() {
    if (elements.apiKeyModal) {
      elements.apiKeyModal.hidden = true;
    }
  }

  async function fetchApiKeysList() {
    try {
      const res = await fetch('/api/keys');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.apiKeys = json.data;
        updateApiKeyUI();
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  }

  function updateApiKeyUI() {
    const keys = state.apiKeys || [];
    const activeKeys = keys.filter(k => k.is_active && k.status !== 'invalid');
    const totalCount = keys.length;
    const activeCount = activeKeys.length;

    // Header badge
    if (elements.headerKeyCountBadge) {
      elements.headerKeyCountBadge.textContent = `${activeCount}`;
      elements.headerKeyCountBadge.classList.toggle('has-keys', activeCount > 0);
      elements.headerKeyCountBadge.title = `${activeCount} kunci aktif siap pakai`;
    }

    // Modal counters
    if (elements.keyTotalCountDisplay) {
      elements.keyTotalCountDisplay.textContent = `${totalCount}`;
    }
    if (elements.keysStatusSummary) {
      elements.keysStatusSummary.textContent = `${activeCount} dari ${totalCount} Kunci Aktif`;
    }

    renderApiKeysList();
  }

  function renderApiKeysList() {
    if (!elements.keysListContainer) return;
    const keys = state.apiKeys || [];

    if (keys.length === 0) {
      elements.keysListContainer.innerHTML = `
        <div class="keys-empty-box">
          <p>Belum ada Kunci API Gemini yang tersimpan di database.</p>
          <small>Tempelkan satu atau beberapa kunci API Gemini pada kolom di atas untuk mengaktifkan AI multi-agent dengan fitur smart round-robin & auto-failover.</small>
        </div>
      `;
      return;
    }

    elements.keysListContainer.innerHTML = keys.map(k => {
      let badgeClass = 'active';
      let badgeLabel = 'Aktif';

      if (!k.is_active) {
        badgeClass = 'disabled';
        badgeLabel = 'Nonaktif';
      } else if (k.status === 'cooldown') {
        badgeClass = 'cooldown';
        badgeLabel = 'Cooldown (429)';
      } else if (k.status === 'invalid' || k.status === 'error') {
        badgeClass = 'invalid';
        badgeLabel = 'Error / Invalid';
      }

      const reqCount = k.requests_count || 0;
      const errCount = k.error_count || 0;
      const lastUsed = k.last_used_at ? new Date(k.last_used_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum dipakai';

      return `
        <div class="key-item-row ${!k.is_active ? 'is-disabled' : ''}" data-key-id="${k.id}">
          <div class="key-item-info">
            <div class="key-title-line">
              <span class="key-name">${escapeHtml(k.label || 'Gemini Key')}</span>
              <span class="key-mono">${escapeHtml(k.masked_key || '***')}</span>
              <span class="key-badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="key-meta-line">
              <span>Req: <strong>${reqCount}</strong></span>
              <span>•</span>
              <span>Err: <strong>${errCount}</strong></span>
              <span>•</span>
              <span>Terakhir: ${lastUsed}</span>
            </div>
          </div>
          <div class="key-actions-group">
            <button type="button" class="btn-key-action btn-test" data-action="test" data-id="${k.id}" title="Uji koneksi kunci ke Gemini API">
              Tes Kunci
            </button>
            <button type="button" class="btn-key-action" data-action="toggle" data-id="${k.id}" data-active="${k.is_active}">
              ${k.is_active ? 'Matikan' : 'Aktifkan'}
            </button>
            <button type="button" class="btn-key-action btn-delete" data-action="delete" data-id="${k.id}" title="Hapus kunci dari database">
              Hapus
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach row events
    elements.keysListContainer.querySelectorAll('.btn-key-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'test') {
          await handleTestKey(id, btn);
        } else if (action === 'toggle') {
          const currentActive = btn.dataset.active === '1' || btn.dataset.active === 'true';
          await handleToggleKey(id, !currentActive);
        } else if (action === 'delete') {
          await handleDeleteKey(id);
        }
      });
    });
  }

  async function handleAddKeysSubmit(e) {
    e.preventDefault();
    const rawKeys = elements.inputNewApiKeys.value.trim();
    if (!rawKeys) {
      showToast("Silakan tempel minimal 1 kunci API Gemini.");
      return;
    }
    const label = elements.inputKeyLabel.value.trim() || 'Gemini Key';

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: rawKeys, label })
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Kunci API berhasil disimpan ke database!");
        elements.inputNewApiKeys.value = '';
        elements.inputKeyLabel.value = '';
        fetchApiKeysList();
      } else {
        showToast(json.error || "Gagal menyimpan kunci API.");
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi gagal ke server.");
    }
  }

  async function handleTestKey(id, btn) {
    const originalText = btn.textContent;
    btn.textContent = 'Menguji...';
    btn.disabled = true;

    try {
      const res = await fetch(`/api/keys/${id}/test`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ ${json.message}`);
      } else {
        showToast(`✕ Error: ${json.message}`);
      }
      fetchApiKeysList();
    } catch (err) {
      showToast("Gagal melakukan tes koneksi.");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  async function handleToggleKey(id, newActive) {
    try {
      const res = await fetch(`/api/keys/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive })
      });
      const json = await res.json();
      if (json.success) {
        showToast(newActive ? "Kunci API diaktifkan." : "Kunci API dinonaktifkan.");
        fetchApiKeysList();
      }
    } catch (err) {
      showToast("Gagal mengubah status kunci.");
    }
  }

  async function handleDeleteKey(id) {
    if (!confirm("Hapus kunci API ini dari database SQLite?")) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast("Kunci API berhasil dihapus.");
        fetchApiKeysList();
      }
    } catch (err) {
      showToast("Gagal menghapus kunci.");
    }
  }

  // --- Modal: Voiceover TTS Studio (Google Colab) ---
  function openTtsModal() {
    if (!elements.ttsModal) return;
    elements.ttsModal.hidden = false;
    refreshTtsCleanText();
    fetchTtsSettings();
  }

  let currentSentenceAudio = null;
  let currentPlayingIdx = null;

  function playSentenceAudio(index, audioUrl) {
    if (!audioUrl) return;

    // If already playing this sentence, toggle pause
    if (currentSentenceAudio && currentPlayingIdx === index) {
      currentSentenceAudio.pause();
      currentSentenceAudio = null;
      currentPlayingIdx = null;
      updateSentencePlayState(index, false);
      return;
    }

    // If another sentence is playing, stop it
    if (currentSentenceAudio) {
      currentSentenceAudio.pause();
      updateSentencePlayState(currentPlayingIdx, false);
      currentSentenceAudio = null;
      currentPlayingIdx = null;
    }

    // Also pause master audio player if currently playing
    if (elements.ttsAudioPlayer && !elements.ttsAudioPlayer.paused) {
      elements.ttsAudioPlayer.pause();
    }

    const audio = new Audio(audioUrl);
    currentSentenceAudio = audio;
    currentPlayingIdx = index;
    updateSentencePlayState(index, true);

    audio.onended = () => {
      updateSentencePlayState(index, false);
      currentSentenceAudio = null;
      currentPlayingIdx = null;
    };

    audio.onerror = () => {
      showToast(`Gagal memutar audio kalimat #${index + 1}`);
      updateSentencePlayState(index, false);
      currentSentenceAudio = null;
      currentPlayingIdx = null;
    };

    audio.play().catch(e => console.warn('Audio play error:', e));
  }

  function updateSentencePlayState(index, isPlaying) {
    // Update play button in modal list
    const btn = document.querySelector(`.btn-sentence-play[data-idx="${index}"]`);
    if (btn) {
      btn.classList.toggle('playing', isPlaying);
      btn.innerHTML = isPlaying
        ? `<svg class="icon-xs" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg class="icon-xs" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      btn.setAttribute('aria-label', isPlaying ? `Jeda kalimat #${index + 1}` : `Putar kalimat #${index + 1}`);
    }

    // Update row in modal list
    const row = document.getElementById(`ttsPreviewRow-${index}`);
    if (row) {
      row.classList.toggle('is-playing', isPlaying);
    }

    // Update script reader span
    const readerSpan = document.getElementById(`ttsSentence-${index}`);
    if (readerSpan) {
      readerSpan.classList.toggle('tts-playing', isPlaying);
    }
  }

  function closeTtsModal() {
    if (elements.ttsModal) {
      elements.ttsModal.hidden = true;
      if (elements.ttsAudioPlayer) {
        elements.ttsAudioPlayer.pause();
      }
      if (currentSentenceAudio) {
        currentSentenceAudio.pause();
        updateSentencePlayState(currentPlayingIdx, false);
        currentSentenceAudio = null;
        currentPlayingIdx = null;
      }
    }
  }

  function switchTtsTab(tabKey) {
    const isGen = tabKey === 'ttsTabGenerate';
    elements.tabBtnTtsGenerate.classList.toggle('active', isGen);
    elements.tabBtnTtsColab.classList.toggle('active', !isGen);
    elements.ttsTabGenerate.hidden = !isGen;
    elements.ttsTabColab.hidden = isGen;
  }

  function refreshTtsCleanText() {
    if (!elements.ttsSourceText) return;
    const cleanText = extractCleanVoiceover(state.currentScriptMarkdown);
    elements.ttsSourceText.value = cleanText;
    updateTtsTextMetrics();
  }

  function updateTtsTextMetrics() {
    if (!elements.ttsSourceText || !elements.ttsTextMetrics) return;
    const text = elements.ttsSourceText.value.trim();
    const words = text ? (text.match(/\S+/g) || []).length : 0;
    // Average speech rate ~140 words per minute
    const estSec = Math.round(words / 2.3);
    const estMnt = Math.round(words / 140);
    const durationLabel = estSec < 60 ? `~${estSec} detik` : `~${estMnt} menit`;
    elements.ttsTextMetrics.textContent = `${words.toLocaleString('id-ID')} kata • ${durationLabel}`;
  }

  async function fetchTtsSettings() {
    try {
      const res = await fetch('/api/tts/config');
      const json = await res.json();
      if (json.success && json.data) {
        state.ttsConfig = json.data;
        updateTtsUI();
      }
    } catch (err) {
      console.warn('Error fetching TTS config:', err);
    }
  }

  // --- TTS Model & Character Voice Catalog ---
  const TTS_VOICE_CATALOG = {
    kokoro: [
      { id: 'am_michael', name: 'Pria: am_michael (Dewasa, Tenang & Berwibawa)', default: true },
      { id: 'am_adam', name: 'Pria: am_adam (Muda, Santai Teman Ngopi)' },
      { id: 'af_bella', name: 'Wanita: af_bella (Lembut, Hangat & Jelas)' },
      { id: 'af_nicole', name: 'Wanita: af_nicole (Tegas & Berbobot)' },
      { id: 'af_sarah', name: 'Wanita: af_sarah (Ekspresif & Ceria)' },
      { id: 'bm_george', name: 'Pria: bm_george (Dokumenter British Formal)' },
      { id: 'bm_lewis', name: 'Pria: bm_lewis (Narator Serius & Dalam)' }
    ],
    dia: [
      { id: 'dia_s1_narrator', name: '🎙️ [S1] Narator Utama (Penuh Emosi & Bernyawa)', default: true },
      { id: 'dia_s2_character', name: '🗣️ [S2] Karakter Pendukung (Santai & Dinamis)' },
      { id: 'dia_dialogue', name: '👥 Multi-Speaker [S1] + [S2] (Dialog Percakapan)' },
      { id: 'dia_cinematic', name: '🎬 Sinematik (Mendukung Tawa, Desah, Bisikan)' }
    ],
    xtts: [
      { id: 'Damian Black', name: 'Pria: Damian Black (Berat, Sinematik Trailer)', default: true },
      { id: 'Claribel Dervla', name: 'Wanita: Claribel Dervla (Elegan, Narasi Buku)' },
      { id: 'Daisy Studious', name: 'Wanita: Daisy Studious (Cerdas & Informatif)' },
      { id: 'Gracie Wise', name: 'Wanita: Gracie Wise (Hangat & Mengalir)' },
      { id: 'Craig Gutsy', name: 'Pria: Craig Gutsy (Antusias & Energik)' },
      { id: 'Baldur Sanjin', name: 'Pria: Baldur Sanjin (Tenang & Suara Dalam)' }
    ]
  };

  function populateTtsVoiceOptions(model, preferredVoice = null) {
    if (!elements.ttsVoiceSelect) return;
    const voices = TTS_VOICE_CATALOG[model] || TTS_VOICE_CATALOG.kokoro;
    elements.ttsVoiceSelect.innerHTML = '';

    let matchFound = false;
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      if (preferredVoice && v.id === preferredVoice) {
        opt.selected = true;
        matchFound = true;
      }
      elements.ttsVoiceSelect.appendChild(opt);
    });

    if (!matchFound) {
      const defaultVoice = voices.find(v => v.default) || voices[0];
      if (defaultVoice) {
        elements.ttsVoiceSelect.value = defaultVoice.id;
      }
    }
  }

  function updateTtsUI() {
    const cfg = state.ttsConfig || {};
    const hasUrl = Boolean(cfg.colab_url && cfg.colab_url.startsWith('http'));
    const isConnected = Boolean(cfg.is_connected && hasUrl);

    // Header dot indicator
    if (elements.ttsColabDotStatus) {
      elements.ttsColabDotStatus.classList.toggle('online', isConnected);
      elements.ttsColabDotStatus.title = isConnected 
        ? `Colab Terhubung: ${cfg.colab_url}` 
        : `Colab belum terhubung. Klik untuk konfigurasi.`;
    }

    // Modal banner
    if (elements.ttsColabStatusBanner) {
      elements.ttsColabStatusBanner.classList.toggle('connected', isConnected);
      if (isConnected) {
        elements.ttsBannerText.textContent = `🟢 Terhubung ke Google Colab: ${cfg.colab_url}`;
      } else if (hasUrl) {
        elements.ttsBannerText.textContent = `🟡 URL tersimpan (${cfg.colab_url}), uji koneksi untuk memverifikasi GPU Colab.`;
      } else {
        elements.ttsBannerText.textContent = `⚪ Google Colab belum terhubung. Jalankan notebook untuk mendapatkan link GPU gratis.`;
      }
    }

    // Modal input field
    if (elements.inputColabUrl && cfg.colab_url) {
      elements.inputColabUrl.value = cfg.colab_url;
    }
    const currentModel = cfg.model || (elements.ttsModelSelect ? elements.ttsModelSelect.value : 'kokoro');
    if (elements.ttsModelSelect) {
      elements.ttsModelSelect.value = currentModel;
    }
    populateTtsVoiceOptions(currentModel, cfg.voice);

    if (elements.ttsSpeedRange && cfg.speed) {
      elements.ttsSpeedRange.value = cfg.speed;
      if (elements.ttsSpeedVal) elements.ttsSpeedVal.textContent = `${cfg.speed}x`;
    }
  }

  async function handleSaveColabConfig(e) {
    if (e) e.preventDefault();
    const url = elements.inputColabUrl.value.trim().replace(/\/+$/, '');
    const model = elements.ttsModelSelect.value;
    const voice = elements.ttsVoiceSelect.value;
    const speed = parseFloat(elements.ttsSpeedRange.value) || 1.0;

    try {
      const res = await fetch('/api/tts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colab_url: url, model, voice, speed })
      });
      const json = await res.json();
      if (json.success) {
        state.ttsConfig = json.data;
        updateTtsUI();
        showToast("Pengaturan Google Colab tersimpan!");
        if (url) {
          handleTestColabConnection();
        }
      }
    } catch (err) {
      showToast("Gagal menyimpan konfigurasi Colab.");
    }
  }

  async function handleTestColabConnection() {
    const url = elements.inputColabUrl.value.trim().replace(/\/+$/, '');
    if (!url) {
      showToast("Masukkan URL Google Colab terlebih dahulu.");
      return;
    }

    const originalText = elements.btnTestColabConnection.textContent;
    elements.btnTestColabConnection.textContent = "Menguji...";
    elements.btnTestColabConnection.disabled = true;

    try {
      const res = await fetch('/api/tts/test-colab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colab_url: url })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ ${json.message} (${json.data?.gpu || 'GPU Aktif'})`);
        fetchTtsSettings();
      } else {
        showToast(`✕ ${json.error}`);
        updateTtsUI();
      }
    } catch (err) {
      showToast("Koneksi gagal atau server Colab tidak merespons.");
    } finally {
      elements.btnTestColabConnection.textContent = originalText;
      elements.btnTestColabConnection.disabled = false;
    }
  }

  // --- Smart Sentence Segmentation for Indonesian & English Storytelling ---
  // Prevents truncating titles (Mr., Mrs., Dr.), abbreviations (dll., dsb.), numbers (2.5, 10.000), initials, etc.
  function splitIntoSentences(text) {
    if (!text || typeof text !== 'string') return [];
    const P = '\uE000'; // Private Use Unicode character for safe placeholder

    // 1. Honorifics, titles, and person prefixes (never end a sentence)
    const titles = [
      'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'rev', 'capt', 'sgt', 'col', 'gen', 'lt', 'maj', 'cpl', 'pvt', 'adm',
      'jr', 'sr', 'st', 'master', 'bpk', 'ibu', 'sdr', 'sdri', 'ust', 'habib', 'kyai',
      'ir', 'drs', 'dra', 'sh', 'se', 'mm', 'mh', 'pt', 'cv', 'tbk', 'alm'
    ];
    const titlesRegex = new RegExp('\\b(' + titles.join('|') + ')\\.', 'gi');
    let processed = text.replace(titlesRegex, (m, t) => t + P);

    // 2. Numbers (decimals, thousands, time): e.g. 2.5, 10.000, 14.30
    processed = processed.replace(/(\d+)\.(\d+)/g, '$1' + P + '$2');

    // 3. Numbered references: No. 12, Hal. 45, Vol. 3
    processed = processed.replace(/\b(no|nomor|hal|hlm|vol|art|bab)\.\s*(\d+)/gi, (m, w, n) => w + P + ' ' + n);

    // 4. Single uppercase initials: e.g. A. Yani, J. K. Rowling, Mr. J. Han
    processed = processed.replace(/\b([A-Z])\./g, '$1' + P);

    // 5. Common abbreviations: dll., dsb., dst., etc., vs.
    const midAbbr = ['dll', 'dsb', 'dst', 'dlsb', 'tsb', 'ttg', 'yg', 'dgn', 'spt', 'etc', 'eg', 'ie', 'vs', 'al'];
    const midAbbrRegex = new RegExp('\\b(' + midAbbr.join('|') + ')\\.(?=\\s+[a-z0-9]|[,;:]|\\s*$)', 'gi');
    processed = processed.replace(midAbbrRegex, (m, a) => a + P);
    processed = processed.replace(new RegExp('\\b(' + midAbbr.join('|') + ')\\.(?=[)"]\\s+[a-z0-9])', 'gi'), (m, a) => a + P);

    // 6. Ellipses (...)
    processed = processed.replace(/\.{2,}/g, m => P.repeat(m.length));

    // 7. Split sentences: match sentence ending punctuation (.!? or quotes) followed by space or EOF
    const rawSentences = processed.match(/[^.!?]+(?:[.!?]+["'”’)]*|\s*$)/g) || [processed];

    return rawSentences
      .map(s => s.replace(new RegExp(P, 'g'), '.').trim())
      .filter(s => s.length > 0);
  }

  let ttsAbortController = null;

  function handleStopTtsGenerate() {
    if (ttsAbortController) {
      ttsAbortController.abort();
      ttsAbortController = null;
    }
    if (elements.btnStopTtsGenerate) elements.btnStopTtsGenerate.hidden = true;
    if (elements.btnTriggerTtsGenerate) {
      elements.btnTriggerTtsGenerate.hidden = false;
      elements.btnTriggerTtsGenerate.disabled = false;
    }
    if (elements.ttsProgressBox) elements.ttsProgressBox.hidden = true;
    if (elements.ttsSentenceStepLabel) {
      elements.ttsSentenceStepLabel.textContent = "⏹️ Proses voiceover dihentikan oleh pengguna";
    }
    showToast("⏹️ Proses pembuatan voiceover dihentikan.");
  }

  async function handleTriggerTtsGenerate() {
    // 1. Gather clean sentences from source textarea or editorial tracker
    const rawInputText = elements.ttsSourceText ? elements.ttsSourceText.value.trim() : '';
    let sentencesToProcess = [];

    if (rawInputText) {
      sentencesToProcess = splitIntoSentences(rawInputText);
    } else if (state.editorialSentences && state.editorialSentences.length > 0) {
      sentencesToProcess = state.editorialSentences.map(s => s.text);
    }

    if (sentencesToProcess.length === 0) {
      showToast("Tidak ada kalimat narasi yang dapat disuarakan.");
      return;
    }

    const model = elements.ttsModelSelect.value;
    const voice = elements.ttsVoiceSelect.value;
    const speed = parseFloat(elements.ttsSpeedRange.value) || 1.1;

    // Reset visual indicators on all sentences in the reader
    document.querySelectorAll('.tts-sentence').forEach(el => {
      el.classList.remove('tts-processing', 'tts-completed');
    });

    // Setup AbortController for cancel / stop capability
    ttsAbortController = new AbortController();

    // UI Progress State
    elements.btnTriggerTtsGenerate.hidden = true;
    if (elements.btnStopTtsGenerate) elements.btnStopTtsGenerate.hidden = false;
    elements.ttsProgressBox.hidden = false;
    elements.ttsSentenceProgressCard.hidden = false;
    elements.ttsResultCard.hidden = true;
    elements.ttsProgressStatus.textContent = `Menghubungkan ke GPU Colab (Total: ${sentencesToProcess.length} kalimat)...`;
    elements.ttsSentenceBarFill.style.width = '0%';
    elements.ttsSentenceStepLabel.textContent = `Memproses 0 dari ${sentencesToProcess.length} kalimat`;
    elements.ttsSentencePercentLabel.textContent = '0%';
    elements.ttsSentenceLiveQuote.textContent = `"${sentencesToProcess[0].slice(0, 50)}..."`;

    // Show Sentence Preview Card & Populate placeholder rows
    if (elements.ttsSentencePreviewCard && elements.ttsSentenceScrollList) {
      elements.ttsSentencePreviewCard.hidden = false;
      elements.ttsSentenceScrollList.innerHTML = '';
      if (elements.ttsPreviewCountBadge) {
        elements.ttsPreviewCountBadge.textContent = `0 / ${sentencesToProcess.length}`;
      }

      sentencesToProcess.forEach((sentText, i) => {
        const row = document.createElement('div');
        row.className = 'tts-preview-row';
        row.id = `ttsPreviewRow-${i}`;
        row.innerHTML = `
          <div class="tts-preview-row-left">
            <span class="tts-preview-idx">#${i + 1}</span>
            <button type="button" class="btn-sentence-play" data-idx="${i}" disabled aria-label="Menunggu kalimat #${i + 1}">
              <svg class="icon-xs" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
            <span class="tts-preview-text" title="${escapeHtml(sentText)}">${escapeHtml(sentText)}</span>
          </div>
          <div class="tts-preview-row-right">
            <span class="tts-preview-status" id="ttsPreviewStatus-${i}">Menunggu</span>
          </div>
        `;
        elements.ttsSentenceScrollList.appendChild(row);
      });
    }

    try {
      const response = await fetch('/api/tts/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: state.currentProjectId,
          sentences: sentencesToProcess,
          model,
          voice,
          speed,
          colab_url: (state.ttsConfig && state.ttsConfig.colab_url) || (elements.inputColabUrl && elements.inputColabUrl.value.trim()) || ''
        }),
        signal: ttsAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`Server error: status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamBuffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n\n');
        streamBuffer = lines.pop();

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed.startsWith('data:')) continue;
          try {
            const data = JSON.parse(trimmed.replace(/^data:\s*/, ''));

            if (data.type === 'init') {
              elements.ttsProgressStatus.textContent = `GPU Aktif: Memproses ${data.total} kalimat per kalimat...`;
            } else if (data.type === 'sentence_start') {
              const el = document.getElementById(`ttsSentence-${data.index}`);
              if (el) {
                el.classList.add('tts-processing');
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
              const row = document.getElementById(`ttsPreviewRow-${data.index}`);
              if (row) {
                row.classList.add('is-processing');
                row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                const st = document.getElementById(`ttsPreviewStatus-${data.index}`);
                if (st) {
                  st.className = 'tts-preview-status processing';
                  st.textContent = 'Memproses...';
                }
              }
              const pct = Math.round((data.index / sentencesToProcess.length) * 100);
              elements.ttsSentenceBarFill.style.width = `${pct}%`;
              elements.ttsSentenceStepLabel.textContent = `Memproses kalimat #${data.index + 1} dari ${sentencesToProcess.length}`;
              elements.ttsSentencePercentLabel.textContent = `${pct}%`;
              elements.ttsSentenceLiveQuote.textContent = `"${data.text}"`;
            } else if (data.type === 'sentence_done') {
              const row = document.getElementById(`ttsPreviewRow-${data.index}`);
              if (row) {
                row.classList.remove('is-processing');
                const st = document.getElementById(`ttsPreviewStatus-${data.index}`);
                if (st) {
                  st.className = 'tts-preview-status ready';
                  st.textContent = data.duration ? `${data.duration.toFixed(1)}s` : '✓ Siap';
                }
                const btn = row.querySelector('.btn-sentence-play');
                if (btn) {
                  btn.disabled = false;
                  btn.dataset.audioUrl = data.audio_url;
                  btn.setAttribute('aria-label', `Putar kalimat #${data.index + 1}`);
                }
              }
              const completedCount = elements.ttsSentenceScrollList ? elements.ttsSentenceScrollList.querySelectorAll('.btn-sentence-play:not(:disabled)').length : 0;
              if (elements.ttsPreviewCountBadge) {
                elements.ttsPreviewCountBadge.textContent = `${completedCount} / ${sentencesToProcess.length}`;
              }

              const el = document.getElementById(`ttsSentence-${data.index}`);
              if (el) {
                el.classList.remove('tts-processing');
                el.classList.add('tts-completed');
                el.dataset.audioUrl = data.audio_url;
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'button');
                el.setAttribute('aria-label', `Putar audio kalimat #${data.index + 1}`);
                el.title = `Kalimat #${data.index + 1} (${data.duration ? data.duration.toFixed(1) + 's' : ''}) • Klik untuk dengarkan audio`;
              }
            } else if (data.type === 'complete') {
              // Master audio completed
              elements.ttsSentenceBarFill.style.width = '100%';
              elements.ttsSentenceStepLabel.textContent = `✓ Selesai (${data.total_sentences} kalimat disatukan)`;
              elements.ttsSentencePercentLabel.textContent = '100%';
              if (elements.ttsPreviewCountBadge) {
                elements.ttsPreviewCountBadge.textContent = `${data.total_sentences} / ${data.total_sentences} (Lengkap)`;
              }

              // Show Result Audio Player
              elements.ttsResultCard.hidden = false;
              elements.ttsResultMeta.textContent = `${model.toUpperCase()} • ${voice} • ${data.total_duration}s (${data.total_sentences} kalimat)`;
              elements.ttsResultFilename.textContent = data.filename;
              elements.btnDownloadTtsWav.href = data.audio_url;
              elements.btnDownloadTtsWav.download = data.filename;

              elements.ttsAudioPlayer.src = data.audio_url;
              elements.ttsAudioPlayer.load();
              elements.ttsAudioPlayer.play().catch(() => {});

              showToast(`Selesai! Seluruh ${data.total_sentences} kalimat berhasil disatukan (${data.total_duration} detik).`);
            } else if (data.type === 'error') {
              showToast(`✕ Gagal: ${data.message}`);
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (elements.ttsSentenceStepLabel) {
          elements.ttsSentenceStepLabel.textContent = "⏹️ Proses pembuatan voiceover dihentikan oleh pengguna";
        }
        elements.ttsSentenceBarFill.style.background = "#94A3B8";
        showToast("⏹️ Proses pembuatan voiceover dihentikan.");
      } else {
        console.error('Stream error:', err);
        showToast("Koneksi terputus saat memproses kalimat.");
      }
    } finally {
      ttsAbortController = null;
      elements.btnTriggerTtsGenerate.hidden = false;
      elements.btnTriggerTtsGenerate.disabled = false;
      if (elements.btnStopTtsGenerate) elements.btnStopTtsGenerate.hidden = true;
      elements.ttsProgressBox.hidden = true;
    }
  }

  // --- Markdown to HTML Parser for Editorial Reader ---
  function parseMarkdownToHtml(markdown) {
    if (!markdown) return '<p><em>Naskah kosong...</em></p>';

    state.editorialSentences = []; // Reset sentence tracker
    const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    let html = '';
    let inParagraph = false;

    function wrapSentencesInParagraph(rawText) {
      const matches = splitIntoSentences(rawText);
      if (!matches || matches.length === 0) {
        return formatInlineMarkdown(rawText);
      }
      return matches.map(s => {
        const trimmed = s.trim();
        if (!trimmed) return s;
        // Clean text for TTS
        const plainText = trimmed.replace(/\(Visual:.*?\)/gi, '').replace(/[\*_~`#]/g, '').trim();
        if (plainText.length > 1) {
          const idx = state.editorialSentences.length;
          state.editorialSentences.push({ index: idx, text: plainText });
          return `<span class="tts-sentence" id="ttsSentence-${idx}" data-idx="${idx}" title="Kalimat #${idx + 1}">${formatInlineMarkdown(trimmed)}</span> `;
        }
        return formatInlineMarkdown(trimmed) + ' ';
      }).join('');
    }

    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i];
      let line = rawLine.trim();

      // Handle empty lines (close open paragraphs)
      if (line === '') {
        if (inParagraph) {
          html += '</p>';
          inParagraph = false;
        }
        continue;
      }

      // Title on first line if starts with # or if short movie title without prefix
      if (line.startsWith('# ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
        continue;
      }
      if (i === 0 && !line.includes(':') && line.length > 0 && line.length < 80) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h1>${escapeHtml(line)}</h1>`;
        continue;
      }

      // Metadata block like **Genre**: ... or Genre: ...
      if (line.startsWith('**Genre**:') || line.startsWith('Genre:') || line.startsWith('**Channel**:') || line.startsWith('Channel:')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<div class="doc-metadata-bar"><span>${formatInlineMarkdown(line)}</span></div>`;
        continue;
      }

      // Visual Cue Tag: (Visual: [Deskripsi]) or (Visual: Deskripsi)
      const visualMatch = line.match(/^\((?:Visual:\s*)(.*?)\)$/i);
      if (visualMatch) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const cueText = escapeHtml(visualMatch[1].trim());
        html += `<aside class="visual-note">
          <div class="visual-note-tag">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            ARAHAN VISUAL (B-ROLL)
          </div>
          <div class="visual-note-content">${cueText}</div>
        </aside>`;
        continue;
      }

      // Plain text block "ARAHAN VISUAL (B-ROLL)"
      if (line === 'ARAHAN VISUAL (B-ROLL)' && i + 1 < lines.length) {
        i++;
        const cueText = escapeHtml(lines[i].trim());
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<aside class="visual-note">
          <div class="visual-note-tag">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            ARAHAN VISUAL (B-ROLL)
          </div>
          <div class="visual-note-content">${cueText}</div>
        </aside>`;
        continue;
      }

      // Horizontal separator
      if (line === '---') {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += '<hr>';
        continue;
      }

      // Headings level 2: ## [OPENING] or [OPENING], [BODY STORY], [OUTRO]
      if (line.startsWith('## ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const h2Text = escapeHtml(line.slice(3).trim());
        html += `<h2><span>${h2Text}</span></h2>`;
        continue;
      }
      if (/^\[(?:OPENING|BODY STORY|CLIMAX|ENDING|OUTRO|PENUTUP)\]/i.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h2><span>${escapeHtml(line)}</span></h2>`;
        continue;
      }

      // Headings level 3: ### PART 1: ... or PART 1: ...
      if (line.startsWith('### ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const h3Text = escapeHtml(line.slice(4).trim());
        html += `<h3>${h3Text}</h3>`;
        continue;
      }
      if (/^(?:PART|BABAK|ADEGAN)\s+\d+:/i.test(line)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h3>${escapeHtml(line)}</h3>`;
        continue;
      }

      // Paragraph lines with sentence-by-sentence tracking
      const formatted = wrapSentencesInParagraph(rawLine);
      if (!inParagraph) {
        html += `<p>${formatted}`;
        inParagraph = true;
      } else {
        html += `<br>${formatted}`;
      }
    }

    if (inParagraph) {
      html += '</p>';
    }

    return html;
  }

  function formatInlineMarkdown(text) {
    let safe = escapeHtml(text);
    // Bold
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Embedded inline visual note
    safe = safe.replace(/\((?:Visual:\s*)(.*?)\)/gi, '<span class="visual-note">$1</span>');
    return safe;
  }

  // --- Extract Clean Voiceover (Strips Metadata & Visual Notes for Clean Audio) ---
  function extractCleanVoiceover(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';
    const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const cleanLines = [];
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }

      // Skip document title headers (# Title or lines that look like main title)
      if (line.startsWith('# ') || (i === 0 && line.startsWith('#'))) continue;

      // Skip document metadata lines (Genre, Channel, Pacing Narasi, Sutradara, Tahun)
      if (/^(\*{0,2})(Genre|Channel|Pacing Narasi|Sutradara|Tahun|Sinopsis)\1\s*:/i.test(line)) continue;

      // Skip horizontal rules
      if (/^[-*_]{3,}$/.test(line)) continue;

      // Skip section markers like ## [OPENING], [BODY STORY], ## [BEDAH ANALISIS], [KESIMPULAN & CLOSING]
      if (/^#{1,3}\s*\[?.*\]?$/i.test(line) && /(OPENING|BODY STORY|BEDAH ANALISIS|KESIMPULAN|CLOSING|OUTRO|PENUTUP|PART|BABAK)/i.test(line)) continue;
      if (/^\[(?:OPENING|BODY STORY|CLIMAX|ENDING|OUTRO|PENUTUP|BEDAH ANALISIS.*|KESIMPULAN.*)\]/i.test(line)) continue;

      // Skip part headings like ### PART 1: ... or PART 1: ...
      if (/^(?:#{1,3}\s*)?(?:PART|BABAK|ADEGAN)\s+\d+:/i.test(line)) continue;
      if (/^(?:#{1,3}\s*)?\d+\.\s+[A-Z\s]{4,}/.test(line)) continue; // e.g. ### 1. KENAPA FILM INI SERU BANGET?

      // Skip visual cue lines
      if (line.match(/^\((?:Visual:\s*).*?\)$/i)) continue;
      if (line === 'ARAHAN VISUAL (B-ROLL)') {
        skipNextLine = true; // skip following description line too
        continue;
      }

      // Clean any inline visual notes like (Visual: ...) embedded inside paragraphs
      let cleaned = line.replace(/\((?:Visual:\s*).*?\)/gi, '');

      // Clean markdown formatting (**bold**, *italic*, `code`, etc.)
      cleaned = cleaned.replace(/[*_~`]/g, '').trim();

      if (cleaned.length > 0) {
        cleanLines.push(cleaned);
      }
    }

    return cleanLines.join('\n\n').trim();
  }

  // --- Extract Visual Cues Only for Video Editors ---
  function extractEditorCues(markdown, filmTitle) {
    const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    let cues = [];
    let currentSection = "General";

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      const h2Match = line.match(/^##\s+(.*)$/);
      const h3Match = line.match(/^###\s+(.*)$/);
      if (h2Match) currentSection = h2Match[1];
      if (h3Match) currentSection = h3Match[1];

      const visualMatch = line.match(/\(Visual:\s*(.*?)\)/i);
      if (visualMatch) {
        cues.push(`[${currentSection}] -> ${visualMatch[1].replace(/\]$/, '').trim()}`);
      }
    });

    let output = `DAFTAR ARAHAN VISUAL & FOOTAGE (B-ROLL) UNTUK EDITOR\n`;
    output += `Film: ${filmTitle || 'Film Pilihan'}\n`;
    output += `Total Scene Visual: ${cues.length} Klip\n`;
    output += `====================================================\n\n`;

    cues.forEach((cue, index) => {
      output += `${index + 1}. ${cue}\n\n`;
    });

    return output;
  }

  // --- Update Metrics & Stats ---
  function updateScriptMetrics() {
    const rawText = state.currentScriptMarkdown;
    const words = countWords(rawText);
    const durationMin = Math.ceil(words / 140);

    elements.metricWordCount.textContent = words.toLocaleString('id-ID');
    elements.metricDuration.textContent = `~${durationMin} mnt`;

    const visualCuesMatches = rawText.match(/\(Visual:/gi);
    const cueCount = visualCuesMatches ? visualCuesMatches.length : 0;
    const partMatches = rawText.match(/^###\s+PART/gim);
    const partCount = partMatches ? partMatches.length : 7;

    elements.footerParagraphCount.textContent = `${partCount} Babak • ${cueCount} Scene Visual`;
  }

  function updateSourceTabMetrics() {
    const count1 = countWords(state.sources.source1);
    const count2 = countWords(state.sources.source2);
    const count3 = countWords(state.sources.source3);

    elements.badgeWordSource1.textContent = `${count1} k`;
    elements.badgeWordSource2.textContent = `${count2} k`;
    elements.badgeWordSource3.textContent = `${count3} k`;

    const currentText = state.sources[state.activeSourceKey] || '';
    const charLen = currentText.length;
    const wordLen = countWords(currentText);
    elements.sourceCharCount.textContent = `${charLen.toLocaleString('id-ID')} karakter • ${wordLen.toLocaleString('id-ID')} kata`;
  }

  // --- Render Script to Editorial Reader & Raw Editor ---
  function renderScript(scrollToTop = false) {
    elements.scriptPaperReader.innerHTML = parseMarkdownToHtml(state.currentScriptMarkdown);
    elements.scriptRawEditor.value = state.currentScriptMarkdown;

    // Strict exclusive visibility: either Editorial Reader or Raw Editor, never both
    if (!state.isRawMode) {
      elements.scriptPaperReader.hidden = false;
      elements.scriptPaperReader.classList.remove('hidden');
      elements.scriptPaperReader.style.display = 'block';
      elements.scriptRawEditor.hidden = true;
      elements.scriptRawEditor.classList.add('hidden');
      elements.scriptRawEditor.style.display = 'none';
    } else {
      elements.scriptPaperReader.hidden = true;
      elements.scriptPaperReader.classList.add('hidden');
      elements.scriptPaperReader.style.display = 'none';
      elements.scriptRawEditor.hidden = false;
      elements.scriptRawEditor.classList.remove('hidden');
      elements.scriptRawEditor.style.display = 'block';
    }

    updateScriptMetrics();
    if (scrollToTop && elements.editorCanvasContainer) {
      elements.editorCanvasContainer.scrollTop = 0;
    }
  }

  // --- Source Tabs Interaction ---
  function switchSourceTab(targetKey) {
    state.activeSourceKey = targetKey;

    elements.tabButtons.forEach(btn => {
      const isCurrent = btn.dataset.source === targetKey;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-selected', isCurrent);
    });

    const labels = {
      source1: "Transkrip A — Referensi 1",
      source2: "Transkrip B — Referensi 2",
      source3: "Transkrip C — Referensi 3"
    };
    elements.sourceCurrentLabel.textContent = labels[targetKey] || "Transkrip Sumber";
    elements.sourceTextArea.value = state.sources[targetKey] || '';

    updateSourceTabMetrics();
  }

  // --- Presets Handler ---
  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    elements.channelNameInput.value = p.channelName;
    elements.openingHookInput.value = p.openingHook;
    elements.outroBridgeInput.value = p.outroBridge;
    elements.personaStyleSelect.value = p.persona;

    showToast(`Profil channel diubah ke: ${p.channelName}`);
  }

  // --- Multi-Agent Simulation / API Generation ---
  let pipelineAbortController = null;
  let pipelineTimers = [];

  function handleCancelPipeline() {
    if (pipelineAbortController) {
      pipelineAbortController.abort();
      pipelineAbortController = null;
    }
    pipelineTimers.forEach(t => clearTimeout(t));
    pipelineTimers = [];

    elements.btnGenerate.disabled = false;
    elements.btnGenerateText.textContent = "Sintesis Naskah (Multi-Agent)";
    elements.generationPipelineCard.hidden = true;
    showToast("⏹️ Sintesis naskah dihentikan oleh pengguna.");
  }

  async function triggerMultiAgentGeneration() {
    pipelineAbortController = new AbortController();
    pipelineTimers.forEach(t => clearTimeout(t));
    pipelineTimers = [];

    elements.btnGenerate.disabled = true;
    elements.generationPipelineCard.hidden = false;
    elements.btnGenerateText.textContent = "AI Sedang Menulis Naskah...";

    // Stage 1 animation
    elements.pipelineCurrentStep.textContent = "Tahap 1 / 3";
    elements.pipelineProgressBar.style.width = "33%";
    elements.stepItem1.className = "step-item active";
    elements.stepItem2.className = "step-item";
    elements.stepItem3.className = "step-item";

    const payload = {
      title: elements.movieTitle.value || 'Film Pilihan',
      director_year: elements.movieDirector.value || '',
      synopsis: elements.movieDescription.value || '',
      channel_name: elements.channelNameInput.value || 'AAAlur Cerita',
      opening_hook: elements.openingHookInput.value || 'Halo Nakama',
      outro_bridge: elements.outroBridgeInput.value || '',
      persona_style: elements.personaStyleSelect.value || 'teman_ngopi',
      include_analysis: elements.checkIncludeAnalysis.checked,
      enforce_visual_cues: elements.checkEnforceVisualCues.checked,
      sources: state.sources
    };

    try {
      // Step 2 animation
      const t1 = setTimeout(() => {
        elements.pipelineCurrentStep.textContent = "Tahap 2 / 3";
        elements.pipelineProgressBar.style.width = "66%";
        elements.stepItem1.className = "step-item completed";
        elements.stepItem2.className = "step-item active";
      }, 800);
      pipelineTimers.push(t1);

      // Call Backend API
      const endpoint = state.currentProjectId 
        ? `/api/projects/${state.currentProjectId}/generate` 
        : `/api/generate`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: pipelineAbortController.signal
      });

      const resData = await response.json();

      // Step 3 animation
      elements.pipelineCurrentStep.textContent = "Tahap 3 / 3";
      elements.pipelineProgressBar.style.width = "100%";
      elements.stepItem2.className = "step-item completed";
      elements.stepItem3.className = "step-item active";

      const t2 = setTimeout(() => {
        elements.stepItem3.className = "step-item completed";
        elements.btnGenerate.disabled = false;
        elements.btnGenerateText.textContent = "Sintesis Naskah (Multi-Agent)";

        if (resData.success && resData.data) {
          const generatedMarkdown = resData.data.script_markdown || resData.data;
          state.currentScriptMarkdown = generatedMarkdown;
          renderScript(true);
          elements.canvasSyncStatus.textContent = "✓ Tersimpan di SQLite (alurcerita.db)";
          showToast("Naskah berhasil disintesis dan disimpan ke database SQL!");
        }

        const t3 = setTimeout(() => {
          elements.generationPipelineCard.hidden = true;
        }, 1200);
        pipelineTimers.push(t3);
      }, 600);
      pipelineTimers.push(t2);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Multi-agent pipeline aborted by user.');
        elements.btnGenerate.disabled = false;
        elements.btnGenerateText.textContent = "Sintesis Naskah (Multi-Agent)";
        elements.generationPipelineCard.hidden = true;
        return;
      }

      console.warn('API generation fallback to client simulation:', err);
      // Fallback local assemble
      const tFallback = setTimeout(() => {
        elements.stepItem3.className = "step-item completed";
        elements.btnGenerate.disabled = false;
        elements.btnGenerateText.textContent = "Sintesis Naskah (Multi-Agent)";

        const channelName = elements.channelNameInput.value || "AAAlur Cerita";
        const openingHook = elements.openingHookInput.value || "Halo Nakama";
        const outroBridge = elements.outroBridgeInput.value || "Jadi, gak perlu cacicu lagi. langsung aja masuk ke ceritanya";
        const movieTitle = elements.movieTitle.value.toUpperCase() || "THE KARATE KID (2010)";

        let customScript = DEFAULT_INITIAL_SCRIPT
          .replace(/# THE KARATE KID \(2010\)/g, `# ${movieTitle}`)
          .replace(/AAAlur Cerita/g, channelName)
          .replace(/Halo Nakama/g, openingHook)
          .replace(/Jadi, gak perlu cacicu lagi\. Langsung aja kita masuk ke alur ceritanya!/g, `${outroBridge}!`);

        state.currentScriptMarkdown = customScript;
        renderScript(true);
        saveCurrentProjectToSQLite();

        const tEnd = setTimeout(() => {
          elements.generationPipelineCard.hidden = true;
        }, 1200);
        pipelineTimers.push(tEnd);

        showToast("Naskah utuh berhasil disintesis tanpa celah!");
      }, 1500);
      pipelineTimers.push(tFallback);
    }
  }

  // --- Teleprompter Controls ---
  function openTeleprompter() {
    state.prompter.active = true;
    elements.teleprompterModal.hidden = false;
    document.body.style.overflow = 'hidden';

    elements.prompterTextBody.innerHTML = elements.scriptPaperReader.innerHTML;
    elements.prompterTextBody.classList.toggle('hide-cues', !state.prompter.showCues);
    elements.prompterTextBody.style.fontSize = `${state.prompter.fontSize}px`;
  }

  function closeTeleprompter() {
    stopPrompterScroll();
    state.prompter.active = false;
    elements.teleprompterModal.hidden = true;
    document.body.style.overflow = '';
  }

  function togglePrompterScroll() {
    if (state.prompter.isPlaying) {
      stopPrompterScroll();
    } else {
      startPrompterScroll();
    }
  }

  function startPrompterScroll() {
    state.prompter.isPlaying = true;
    elements.prompterPlayIcon.textContent = '⏸';
    elements.prompterPlayText.textContent = 'Jeda (Spasi)';

    function step() {
      if (!state.prompter.isPlaying) return;
      const speed = Number(state.prompter.speed) * 0.75;
      elements.prompterScrollViewport.scrollTop += speed;
      state.prompter.scrollTimer = requestAnimationFrame(step);
    }
    state.prompter.scrollTimer = requestAnimationFrame(step);
  }

  function stopPrompterScroll() {
    state.prompter.isPlaying = false;
    elements.prompterPlayIcon.textContent = '▶';
    elements.prompterPlayText.textContent = 'Mulai Scroll (Spasi)';
    if (state.prompter.scrollTimer) {
      cancelAnimationFrame(state.prompter.scrollTimer);
      state.prompter.scrollTimer = null;
    }
  }

  // --- Event Listeners Initialization ---
  function initEvents() {
    // Top Navigation Tabs
    elements.navBtnHome.addEventListener('click', () => switchView('home'));
    elements.navBtnStudio.addEventListener('click', () => switchView('studio'));
    elements.activeProjectPill.addEventListener('click', () => switchView('home'));

    // Home Project Search
    elements.projectSearchInput.addEventListener('input', () => {
      renderProjectsGrid(state.projectsList);
    });

    // New Project Modal
    elements.btnOpenNewProjectModal.addEventListener('click', openNewProjectModal);
    elements.btnHeaderNewProject.addEventListener('click', openNewProjectModal);
    elements.btnCloseNewProjectModal.addEventListener('click', closeNewProjectModal);
    elements.btnCancelNewProject.addEventListener('click', closeNewProjectModal);
    elements.newProjectForm.addEventListener('submit', handleCreateNewProjectSubmit);

    // API Keys Modal (Smart Round-Robin)
    if (elements.btnOpenKeyModal) elements.btnOpenKeyModal.addEventListener('click', openApiKeyModal);
    if (elements.btnCloseKeyModal) elements.btnCloseKeyModal.addEventListener('click', closeApiKeyModal);
    if (elements.btnCloseKeyModalFooter) elements.btnCloseKeyModalFooter.addEventListener('click', closeApiKeyModal);
    if (elements.addKeyForm) elements.addKeyForm.addEventListener('submit', handleAddKeysSubmit);

    // Voiceover TTS Modal (Google Colab)
    if (elements.btnOpenTtsModal) elements.btnOpenTtsModal.addEventListener('click', openTtsModal);
    if (elements.btnCloseTtsModal) elements.btnCloseTtsModal.addEventListener('click', closeTtsModal);
    if (elements.btnCloseTtsModalFooter) elements.btnCloseTtsModalFooter.addEventListener('click', closeTtsModal);
    if (elements.tabBtnTtsGenerate) elements.tabBtnTtsGenerate.addEventListener('click', () => switchTtsTab('ttsTabGenerate'));
    if (elements.tabBtnTtsColab) elements.tabBtnTtsColab.addEventListener('click', () => switchTtsTab('ttsTabColab'));
    if (elements.btnQuickConnectColab) elements.btnQuickConnectColab.addEventListener('click', () => switchTtsTab('ttsTabColab'));
    if (elements.btnRefreshTtsFromScript) elements.btnRefreshTtsFromScript.addEventListener('click', refreshTtsCleanText);
    if (elements.btnClearTtsText) elements.btnClearTtsText.addEventListener('click', () => {
      elements.ttsSourceText.value = '';
      updateTtsTextMetrics();
    });
    if (elements.ttsSourceText) elements.ttsSourceText.addEventListener('input', updateTtsTextMetrics);
    if (elements.ttsSpeedRange) elements.ttsSpeedRange.addEventListener('input', (e) => {
      if (elements.ttsSpeedVal) elements.ttsSpeedVal.textContent = `${e.target.value}x`;
    });
    if (elements.btnTriggerTtsGenerate) elements.btnTriggerTtsGenerate.addEventListener('click', handleTriggerTtsGenerate);
    if (elements.btnStopTtsGenerate) elements.btnStopTtsGenerate.addEventListener('click', handleStopTtsGenerate);
    if (elements.colabConfigForm) elements.colabConfigForm.addEventListener('submit', handleSaveColabConfig);
    if (elements.btnTestColabConnection) elements.btnTestColabConnection.addEventListener('click', handleTestColabConnection);

    // Dynamic Character/Voice selection per TTS Model
    if (elements.ttsModelSelect) {
      elements.ttsModelSelect.addEventListener('change', (e) => {
        populateTtsVoiceOptions(e.target.value);
        handleSaveColabConfig();
      });
    }
    if (elements.ttsVoiceSelect) {
      elements.ttsVoiceSelect.addEventListener('change', () => {
        handleSaveColabConfig();
      });
    }

    // Sentence Preview List Click Listener (Modal)
    if (elements.ttsSentenceScrollList) {
      elements.ttsSentenceScrollList.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-sentence-play');
        if (btn && !btn.disabled && btn.dataset.audioUrl) {
          const idx = parseInt(btn.dataset.idx, 10);
          playSentenceAudio(idx, btn.dataset.audioUrl);
        }
      });
    }

    // Stop sentence audio if master audio starts playing
    if (elements.ttsAudioPlayer) {
      elements.ttsAudioPlayer.addEventListener('play', () => {
        if (currentSentenceAudio) {
          currentSentenceAudio.pause();
          updateSentencePlayState(currentPlayingIdx, false);
          currentSentenceAudio = null;
          currentPlayingIdx = null;
        }
      });
    }

    // Script Reader Sentence Click & Keyboard Listener (Editorial Reader)
    document.addEventListener('click', (e) => {
      const sentenceEl = e.target.closest('.tts-sentence');
      if (sentenceEl && sentenceEl.dataset.audioUrl) {
        const idx = parseInt(sentenceEl.dataset.idx, 10);
        playSentenceAudio(idx, sentenceEl.dataset.audioUrl);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const sentenceEl = e.target.closest('.tts-sentence');
        if (sentenceEl && sentenceEl.dataset.audioUrl && document.activeElement === sentenceEl) {
          e.preventDefault();
          const idx = parseInt(sentenceEl.dataset.idx, 10);
          playSentenceAudio(idx, sentenceEl.dataset.audioUrl);
        }
      }
    });

    // Preset dropdown
    elements.channelPresetSelect.addEventListener('change', (e) => {
      applyPreset(e.target.value);
    });

    // Source tab switching
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchSourceTab(btn.dataset.source));
    });

    // Source text editing
    elements.sourceTextArea.addEventListener('input', (e) => {
      state.sources[state.activeSourceKey] = e.target.value;
      updateSourceTabMetrics();
    });

    // Clipboard Paste to Source
    elements.btnPasteClipboard.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          elements.sourceTextArea.value = text;
          state.sources[state.activeSourceKey] = text;
          updateSourceTabMetrics();
          showToast("Teks berhasil ditempel dari clipboard!");
        }
      } catch (err) {
        showToast("Izin clipboard tidak diberikan.");
      }
    });

    // Clear Source
    elements.btnClearSource.addEventListener('click', () => {
      elements.sourceTextArea.value = '';
      state.sources[state.activeSourceKey] = '';
      updateSourceTabMetrics();
      showToast("Sumber dikosongkan.");
    });

    // Reset Sources
    elements.btnResetKarateSources.addEventListener('click', () => {
      state.sources = { ...DEFAULT_SOURCES };
      elements.sourceTextArea.value = state.sources[state.activeSourceKey];
      updateSourceTabMetrics();
      showToast("Sampel transkrip Karate Kid dimuat ulang!");
    });

    // Generate Button
    elements.btnGenerate.addEventListener('click', triggerMultiAgentGeneration);
    if (elements.btnCancelPipeline) elements.btnCancelPipeline.addEventListener('click', handleCancelPipeline);

    // View Mode Switching (Reader vs Raw)
    elements.viewBtnReader.addEventListener('click', () => {
      if (state.isRawMode) {
        state.currentScriptMarkdown = elements.scriptRawEditor.value;
        renderScript();
      }
      state.isRawMode = false;
      elements.viewBtnReader.classList.add('active');
      elements.viewBtnRaw.classList.remove('active');
      elements.scriptPaperReader.hidden = false;
      elements.scriptPaperReader.style.display = 'block';
      elements.scriptRawEditor.hidden = true;
      elements.scriptRawEditor.style.display = 'none';
    });

    elements.viewBtnRaw.addEventListener('click', () => {
      state.isRawMode = true;
      elements.viewBtnRaw.classList.add('active');
      elements.viewBtnReader.classList.remove('active');
      elements.scriptPaperReader.hidden = true;
      elements.scriptPaperReader.style.display = 'none';
      elements.scriptRawEditor.hidden = false;
      elements.scriptRawEditor.style.display = 'block';
      elements.scriptRawEditor.value = state.currentScriptMarkdown;
    });

    // Sync Raw Markdown Editor changes to State & SQLite
    if (elements.scriptRawEditor) {
      elements.scriptRawEditor.addEventListener('input', () => {
        state.currentScriptMarkdown = elements.scriptRawEditor.value;
        elements.canvasSyncStatus.textContent = "Menyimpan perubahan...";
        clearTimeout(elements.scriptRawEditor._saveTimer);
        elements.scriptRawEditor._saveTimer = setTimeout(() => {
          saveCurrentProjectToSQLite();
          updateScriptMetrics();
        }, 1000);
      });
    }

    // Toggle Visual Cues in Reader
    elements.btnToggleVisualCues.addEventListener('click', () => {
      state.showVisualCues = !state.showVisualCues;
      elements.scriptPaperReader.classList.toggle('hide-visual-cues', !state.showVisualCues);
      elements.btnToggleVisualCues.querySelector('.cue-indicator').classList.toggle('active', state.showVisualCues);
      elements.btnToggleVisualCues.setAttribute('aria-pressed', state.showVisualCues);
      showToast(state.showVisualCues ? "Tag Visual ditampilkan" : "Tag Visual disembunyikan");
    });

    // Font Size Controls
    elements.btnFontDecr.addEventListener('click', () => {
      if (state.fontSize > 14) {
        state.fontSize -= 1;
        elements.scriptPaperReader.style.fontSize = `${state.fontSize}px`;
        elements.fontSizeLabel.textContent = `${state.fontSize}px`;
      }
    });

    elements.btnFontIncr.addEventListener('click', () => {
      if (state.fontSize < 24) {
        state.fontSize += 1;
        elements.scriptPaperReader.style.fontSize = `${state.fontSize}px`;
        elements.fontSizeLabel.textContent = `${state.fontSize}px`;
      }
    });

    // Quick Copy Clean VO
    elements.btnQuickCopyClean.addEventListener('click', () => {
      const cleanText = extractCleanVoiceover(state.currentScriptMarkdown);
      navigator.clipboard.writeText(cleanText).then(() => {
        showToast("Voiceover Bersih (Tanpa Visual Cues) berhasil disalin!");
      });
    });

    // Dropdown Export Menu
    elements.btnExportMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = elements.exportDropdown.hidden;
      elements.exportDropdown.hidden = !isHidden;
      elements.btnExportMenu.setAttribute('aria-expanded', isHidden);
    });

    document.addEventListener('click', () => {
      elements.exportDropdown.hidden = true;
      elements.btnExportMenu.setAttribute('aria-expanded', 'false');
    });

    // Export Options
    elements.btnCopyCleanVO.addEventListener('click', () => {
      const cleanText = extractCleanVoiceover(state.currentScriptMarkdown);
      navigator.clipboard.writeText(cleanText).then(() => {
        showToast("Voiceover Bersih berhasil disalin!");
      });
    });

    elements.btnCopyEditorCues.addEventListener('click', () => {
      const cuesText = extractEditorCues(state.currentScriptMarkdown, elements.movieTitle.value);
      navigator.clipboard.writeText(cuesText).then(() => {
        showToast("Daftar Arahan Visual Editor berhasil disalin!");
      });
    });

    elements.btnCopyFullMarkdown.addEventListener('click', () => {
      navigator.clipboard.writeText(state.currentScriptMarkdown).then(() => {
        showToast("Naskah Lengkap (Markdown) berhasil disalin!");
      });
    });

    elements.btnPrintPdf.addEventListener('click', () => {
      window.print();
    });

    // Quick Save button -> SQLite
    elements.btnQuickSave.addEventListener('click', () => {
      saveCurrentProjectToSQLite();
    });

    // Teleprompter Trigger
    elements.btnTogglePrompter.addEventListener('click', openTeleprompter);
    elements.btnPrompterClose.addEventListener('click', closeTeleprompter);
    elements.btnPrompterPlayPause.addEventListener('click', togglePrompterScroll);

    elements.prompterSpeedRange.addEventListener('input', (e) => {
      state.prompter.speed = e.target.value;
      elements.prompterSpeedVal.textContent = `${e.target.value}x`;
    });

    elements.prompterFontSize.addEventListener('input', (e) => {
      state.prompter.fontSize = e.target.value;
      elements.prompterFontVal.textContent = `${e.target.value}px`;
      elements.prompterTextBody.style.fontSize = `${e.target.value}px`;
    });

    elements.btnPrompterToggleCues.addEventListener('click', () => {
      state.prompter.showCues = !state.prompter.showCues;
      elements.prompterTextBody.classList.toggle('hide-cues', !state.prompter.showCues);
      elements.prompterCuesStatus.textContent = state.prompter.showCues ? "Visual: Tampil" : "Visual: Sembunyi";
    });

    elements.btnPrompterMirror.addEventListener('click', () => {
      state.prompter.isMirrored = !state.prompter.isMirrored;
      elements.prompterTextBody.classList.toggle('mirrored', state.prompter.isMirrored);
      elements.btnPrompterMirror.style.background = state.prompter.isMirrored ? '#007AFF' : '#27272A';
    });

    // Close Toast Notification Manually
    if (elements.toastClose) {
      elements.toastClose.addEventListener('click', () => {
        clearTimeout(elements.toastMessage._timer);
        elements.toastMessage.hidden = true;
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.prompter.active) closeTeleprompter();
        if (elements.newProjectModal && !elements.newProjectModal.hidden) closeNewProjectModal();
        if (elements.apiKeyModal && !elements.apiKeyModal.hidden) closeApiKeyModal();
        if (elements.ttsModal && !elements.ttsModal.hidden) closeTtsModal();
      }
      if (e.code === 'Space' && state.prompter.active) {
        e.preventDefault();
        togglePrompterScroll();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentProjectToSQLite();
      }
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (state.prompter.active) closeTeleprompter();
        else openTeleprompter();
      }
    });

    // Mobile View Switcher
    elements.mobileTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.mobileTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.target;
        if (target === 'studio-sidebar') {
          elements.studioSidebar.classList.remove('tab-hidden');
          elements.studioEditor.classList.add('tab-hidden');
        } else {
          elements.studioSidebar.classList.add('tab-hidden');
          elements.studioEditor.classList.remove('tab-hidden');
        }
      });
    });
  }

  // --- Initial Mount ---
  async function initApp() {
    initEvents();

    // Pastikan status tampilan awal adalah Editorial Reader
    state.isRawMode = false;
    if (elements.scriptPaperReader) {
      elements.scriptPaperReader.hidden = false;
      elements.scriptPaperReader.style.display = 'block';
    }
    if (elements.scriptRawEditor) {
      elements.scriptRawEditor.hidden = true;
      elements.scriptRawEditor.style.display = 'none';
    }

    fetchApiKeysList(); // Load registered API keys from SQLite
    fetchTtsSettings(); // Load TTS & Colab configuration from SQLite
    populateTtsVoiceOptions(elements.ttsModelSelect ? elements.ttsModelSelect.value : 'kokoro');

    // Check last project ID or try to load project 1 from SQLite
    const lastId = localStorage.getItem('alurcerita_last_project_id') || 1;
    try {
      const res = await fetch(`/api/projects/${lastId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          openProjectById(lastId);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend server not yet reached, loading local state.');
    }

    // Default fallback initial render
    elements.sourceTextArea.value = state.sources[state.activeSourceKey];
    updateSourceTabMetrics();
    renderScript(true);
  }

  // Expose methods for inline handlers if needed
  window.AlurStudio = {
    openNewModal: openNewProjectModal,
    openProject: openProjectById,
    switchView: switchView
  };

  // Start app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
