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
    activeView: 'studio', // 'home' | 'studio' | 'media'
    currentProjectId: 1,
    projectsList: [],
    channelsList: [],
    personas: [],
    ttsVoices: [],
    promptTemplates: [],
    appSettings: { default_wpm: 140, max_hook_seconds: 30, default_gemini_model: 'auto', default_language: 'id' },
    editorialSentences: [],
    apiKeys: [],
    // Media Studio & File Manager State
    mediaItems: [],
    mediaStats: null,
    selectedSlicerMedia: null,
    selectedSlicerFile: null,
    slicedResultMedia: null,
    // AI Cut Scene State
    aiCutSrtFile: null,
    aiCutSelectedMedia: null,
    aiCuratedScenes: [],
    aiSelectedClipIndices: new Set(),
    fmFilter: 'all',
    fmSearch: '',
    fmViewMode: 'grid', // 'grid' | 'table'
    slicerSourceMode: 'manager', // 'manager' | 'upload'
    previewModeSource: 'sliced', // 'sliced' | 'raw'
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
    audioSuite: {
      activeTab: 'audioSourceTabMic',
      activeFormat: 'wav', // 'wav' | 'mp3'
      activePresetKey: 'youtube_recap',
      customPresets: [],
      bgmList: [],
      projectTtsList: [],
      projectSoundsList: [],
      uploadTargetMode: 'vocal', // 'vocal' | 'append' | 'bgm'
      lastUploadedFile: null,
      loadedTrackName: '',
      isBypassed: false
    },
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

    // Audio Mixing & Mastering Suite Elements
    btnOpenAudioSuiteModal: document.getElementById('btnOpenAudioSuiteModal'),
    audioSuiteActiveDot: document.getElementById('audioSuiteActiveDot'),
    audioSuiteModal: document.getElementById('audioSuiteModal'),
    audioDockResizer: document.getElementById('audioDockResizer'),
    btnToggleAudioDock: document.getElementById('btnToggleAudioDock'),
    audioDockDot: document.getElementById('audioDockDot'),
    audioDockTogglePill: document.getElementById('audioDockTogglePill'),
    btnCloseAudioSuiteModal: document.getElementById('btnCloseAudioSuiteModal'),
    btnCloseAudioSuiteFooter: document.getElementById('btnCloseAudioSuiteFooter'),
    btnOpenTtsInAudioSuite: document.getElementById('btnOpenTtsInAudioSuite'),

    tabBtnAudioMic: document.getElementById('tabBtnAudioMic'),
    tabBtnAudioUpload: document.getElementById('tabBtnAudioUpload'),
    tabBtnAudioTts: document.getElementById('tabBtnAudioTts'),
    badgeAudioTtsCount: document.getElementById('badgeAudioTtsCount'),
    audioSourceTabMic: document.getElementById('audioSourceTabMic'),
    audioSourceTabUpload: document.getElementById('audioSourceTabUpload'),
    audioSourceTabTts: document.getElementById('audioSourceTabTts'),

    recLiveBadge: document.getElementById('recLiveBadge'),
    recTimerDisplay: document.getElementById('recTimerDisplay'),
    recStatusLabel: document.getElementById('recStatusLabel'),
    recAppendHint: document.getElementById('recAppendHint'),
    btnStartRecord: document.getElementById('btnStartRecord'),
    btnStartRecordText: document.getElementById('btnStartRecordText'),
    btnRestartRecord: document.getElementById('btnRestartRecord'),
    btnUndoAppendRecord: document.getElementById('btnUndoAppendRecord'),
    btnPauseResumeRecord: document.getElementById('btnPauseResumeRecord'),
    btnPauseResumeIcon: document.getElementById('btnPauseResumeIcon'),
    btnPauseResumeText: document.getElementById('btnPauseResumeText'),
    btnStopRecord: document.getElementById('btnStopRecord'),
    recOscilloscopeCanvas: document.getElementById('recOscilloscopeCanvas'),

    audioUploadDropzone: document.getElementById('audioUploadDropzone'),
    audioFileInput: document.getElementById('audioFileInput'),
    btnBrowseAudioFile: document.getElementById('btnBrowseAudioFile'),
    dropzoneTitle: document.getElementById('dropzoneTitle'),
    dropzoneDesc: document.getElementById('dropzoneDesc'),
    btnUploadModeVocal: document.getElementById('btnUploadModeVocal'),
    btnUploadModeAppend: document.getElementById('btnUploadModeAppend'),
    btnUploadModeBgm: document.getElementById('btnUploadModeBgm'),
    uploadedSoundInfoCard: document.getElementById('uploadedSoundInfoCard'),
    uploadedSoundName: document.getElementById('uploadedSoundName'),
    uploadedSoundDuration: document.getElementById('uploadedSoundDuration'),
    uploadedSoundSize: document.getElementById('uploadedSoundSize'),
    uploadedSoundFormat: document.getElementById('uploadedSoundFormat'),
    uploadedSoundTargetBadge: document.getElementById('uploadedSoundTargetBadge'),
    btnSaveUploadedToLibrary: document.getElementById('btnSaveUploadedToLibrary'),
    projectSoundLibrary: document.getElementById('projectSoundLibrary'),
    soundLibraryCountBadge: document.getElementById('soundLibraryCountBadge'),
    btnRefreshSoundLibrary: document.getElementById('btnRefreshSoundLibrary'),
    soundLibraryList: document.getElementById('soundLibraryList'),
    soundLibraryEmpty: document.getElementById('soundLibraryEmpty'),

    projectTtsSelect: document.getElementById('projectTtsSelect'),
    btnLoadSelectedTts: document.getElementById('btnLoadSelectedTts'),

    audioTrackStatusDot: document.getElementById('audioTrackStatusDot'),
    audioActiveTrackLabel: document.getElementById('audioActiveTrackLabel'),
    audioActiveFormatBadge: document.getElementById('audioActiveFormatBadge'),
    btnDeckAppendRecord: document.getElementById('btnDeckAppendRecord'),
    btnDeckUploadAudio: document.getElementById('btnDeckUploadAudio'),
    btnAuditionRaw: document.getElementById('btnAuditionRaw'),
    btnAuditionMaster: document.getElementById('btnAuditionMaster'),

    waveformContainer: document.getElementById('waveformContainer'),
    audioWaveformCanvas: document.getElementById('audioWaveformCanvas'),
    waveformEmptyState: document.getElementById('waveformEmptyState'),

    btnAudioPlayPause: document.getElementById('btnAudioPlayPause'),
    transportPlayIcon: document.getElementById('transportPlayIcon'),
    btnAudioStop: document.getElementById('btnAudioStop'),
    audioTimeCurrent: document.getElementById('audioTimeCurrent'),
    audioTimeTotal: document.getElementById('audioTimeTotal'),
    faderVoiceVol: document.getElementById('faderVoiceVol'),
    valVoiceVol: document.getElementById('valVoiceVol'),
    vuMasterMeter: document.getElementById('vuMasterMeter'),
    vuReadingDb: document.getElementById('vuReadingDb'),

    customPresetSelect: document.getElementById('customPresetSelect'),
    btnSaveCurrentAsPreset: document.getElementById('btnSaveCurrentAsPreset'),
    presetPillsGrid: document.getElementById('presetPillsGrid'),

    tabModeManualRack: document.getElementById('tabModeManualRack'),
    tabModeQuickPresets: document.getElementById('tabModeQuickPresets'),
    paneManualRack: document.getElementById('paneManualRack'),
    paneQuickPresets: document.getElementById('paneQuickPresets'),
    activePresetIndicator: document.getElementById('activePresetIndicator'),
    activePresetBadgeText: document.getElementById('activePresetBadgeText'),
    btnResetToDefaultDsp: document.getElementById('btnResetToDefaultDsp'),

    chkEnableClean: document.getElementById('chkEnableClean'),
    slHighPassFreq: document.getElementById('slHighPassFreq'),
    valHighPassFreq: document.getElementById('valHighPassFreq'),
    slNoiseGate: document.getElementById('slNoiseGate'),
    valNoiseGate: document.getElementById('valNoiseGate'),

    chkEnableDeEsser: document.getElementById('chkEnableDeEsser'),
    slDeEsserAmount: document.getElementById('slDeEsserAmount'),
    valDeEsserAmount: document.getElementById('valDeEsserAmount'),
    slDeEsserFreq: document.getElementById('slDeEsserFreq'),
    valDeEsserFreq: document.getElementById('valDeEsserFreq'),

    chkEnableEq: document.getElementById('chkEnableEq'),
    slEqLow: document.getElementById('slEqLow'),
    valEqLow: document.getElementById('valEqLow'),
    slEqMid: document.getElementById('slEqMid'),
    valEqMid: document.getElementById('valEqMid'),
    slEqPresence: document.getElementById('slEqPresence'),
    valEqPresence: document.getElementById('valEqPresence'),
    slEqHigh: document.getElementById('slEqHigh'),
    valEqHigh: document.getElementById('valEqHigh'),

    chkEnableComp: document.getElementById('chkEnableComp'),
    slCompThreshold: document.getElementById('slCompThreshold'),
    valCompThreshold: document.getElementById('valCompThreshold'),
    slCompRatio: document.getElementById('slCompRatio'),
    valCompRatio: document.getElementById('valCompRatio'),
    slCompMakeup: document.getElementById('slCompMakeup'),
    valCompMakeup: document.getElementById('valCompMakeup'),

    chkEnableWarmth: document.getElementById('chkEnableWarmth'),
    slTubeWarmth: document.getElementById('slTubeWarmth'),
    valTubeWarmth: document.getElementById('valTubeWarmth'),
    slStudioAmbience: document.getElementById('slStudioAmbience'),
    valStudioAmbience: document.getElementById('valStudioAmbience'),

    chkEnableLimiter: document.getElementById('chkEnableLimiter'),
    slLimiterCeiling: document.getElementById('slLimiterCeiling'),
    valLimiterCeiling: document.getElementById('valLimiterCeiling'),

    chkEnableDucking: document.getElementById('chkEnableDucking'),
    bgmTrackSelect: document.getElementById('bgmTrackSelect'),
    btnUploadCustomBgm: document.getElementById('btnUploadCustomBgm'),
    bgmFileInput: document.getElementById('bgmFileInput'),
    slBgmVolume: document.getElementById('slBgmVolume'),
    valBgmVolume: document.getElementById('valBgmVolume'),
    slDuckDepth: document.getElementById('slDuckDepth'),
    valDuckDepth: document.getElementById('valDuckDepth'),

    btnFormatWav: document.getElementById('btnFormatWav'),
    btnFormatMp3: document.getElementById('btnFormatMp3'),
    btnAttachAudioToProject: document.getElementById('btnAttachAudioToProject'),
    btnDownloadMasteredAudio: document.getElementById('btnDownloadMasteredAudio'),
    btnDownloadMasterText: document.getElementById('btnDownloadMasterText'),

    // DB Master Audio Presets Elements
    tabBtnDbAudioPresets: document.getElementById('tabBtnDbAudioPresets'),
    masterTabAudioPresets: document.getElementById('masterTabAudioPresets'),
    badgeDbAudioPresetCount: document.getElementById('badgeDbAudioPresetCount'),
    btnResetDefaultAudioPresets: document.getElementById('btnResetDefaultAudioPresets'),
    audioPresetForm: document.getElementById('audioPresetForm'),
    editPresetId: document.getElementById('editPresetId'),
    presetFormName: document.getElementById('presetFormName'),
    presetFormKey: document.getElementById('presetFormKey'),
    presetFormDesc: document.getElementById('presetFormDesc'),
    presetFormJson: document.getElementById('presetFormJson'),
    btnSavePresetForm: document.getElementById('btnSavePresetForm'),
    btnCancelPresetEdit: document.getElementById('btnCancelPresetEdit'),
    tableAudioPresets: document.getElementById('tableAudioPresets'),
    tbodyAudioPresets: document.getElementById('tbodyAudioPresets'),

    // Transcreation & Translation Elements
    btnOpenTranslateModal: document.getElementById('btnOpenTranslateModal'),
    btnSubbarTranslate: document.getElementById('btnSubbarTranslate'),
    translateModal: document.getElementById('translateModal'),
    btnCloseTranslateModal: document.getElementById('btnCloseTranslateModal'),
    btnCloseTranslateModalFooter: document.getElementById('btnCloseTranslateModalFooter'),
    transTargetLangSelect: document.getElementById('transTargetLangSelect'),
    transCustomLangGroup: document.getElementById('transCustomLangGroup'),
    transCustomLangInput: document.getElementById('transCustomLangInput'),
    transUniquenessSelect: document.getElementById('transUniquenessSelect'),
    transChannelNameInput: document.getElementById('transChannelNameInput'),
    transOpeningHookInput: document.getElementById('transOpeningHookInput'),
    transPersonaStyleSelect: document.getElementById('transPersonaStyleSelect'),
    transSaveModeSelect: document.getElementById('transSaveModeSelect'),
    transGeminiModelSelect: document.getElementById('transGeminiModelSelect'),
    transModelBadge: document.getElementById('transModelBadge'),
    btnTriggerTranscreate: document.getElementById('btnTriggerTranscreate'),
    btnTriggerTranscreateText: document.getElementById('btnTriggerTranscreateText'),
    transProgressBox: document.getElementById('transProgressBox'),
    transProgressTitle: document.getElementById('transProgressTitle'),
    transStepBadge: document.getElementById('transStepBadge'),
    transProgressBar: document.getElementById('transProgressBar'),
    transResultCard: document.getElementById('transResultCard'),
    transResultPreview: document.getElementById('transResultPreview'),
    btnCopyTransResult: document.getElementById('btnCopyTransResult'),
    btnOpenTransProject: document.getElementById('btnOpenTransProject'),
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
    ttsAdvancedAccordion: document.getElementById('ttsAdvancedAccordion'),
    btnToggleAdvancedTts: document.getElementById('btnToggleAdvancedTts'),
    ttsAdvancedBody: document.getElementById('ttsAdvancedBody'),
    ttsTempRange: document.getElementById('ttsTempRange'),
    ttsTempVal: document.getElementById('ttsTempVal'),
    ttsCfgRange: document.getElementById('ttsCfgRange'),
    ttsCfgVal: document.getElementById('ttsCfgVal'),
    ttsDialogueModeSelect: document.getElementById('ttsDialogueModeSelect'),
    ttsToneStyleSelect: document.getElementById('ttsToneStyleSelect'),
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
    navBtnMediaStudio: document.getElementById('navBtnMediaStudio'),
    homeWorkspace: document.getElementById('homeWorkspace'),
    studioWorkspace: document.getElementById('studioWorkspace'),
    mediaWorkspace: document.getElementById('mediaWorkspace'),
    activeProjectPill: document.getElementById('activeProjectPill'),
    activeProjectTitleDisplay: document.getElementById('activeProjectTitleDisplay'),
    headerPresetBox: document.getElementById('headerPresetBox'),
    headerCenterBox: document.getElementById('headerCenterBox'),
    studioHeaderActions: document.getElementById('studioHeaderActions'),
    homeHeaderActions: document.getElementById('homeHeaderActions'),
    btnHeaderNewProject: document.getElementById('btnHeaderNewProject'),

    // Media Workspace & Sub-Nav Elements
    tabMediaSlicer: document.getElementById('tabMediaSlicer'),
    tabMediaAiCut: document.getElementById('tabMediaAiCut'),
    tabMediaFiles: document.getElementById('tabMediaFiles'),
    mediaSlicerSection: document.getElementById('mediaSlicerSection'),
    mediaAiCutSection: document.getElementById('mediaAiCutSection'),
    mediaFilesSection: document.getElementById('mediaFilesSection'),
    mediaHeaderStats: document.getElementById('mediaHeaderStats'),
    mediaStatsSummaryText: document.getElementById('mediaStatsSummaryText'),
    btnRefreshMedia: document.getElementById('btnRefreshMedia'),
    btnOpenUploadModal: document.getElementById('btnOpenUploadModal'),

    // AI Smart Cut Scene (SRT) Elements
    aiCutSelectVideo: document.getElementById('aiCutSelectVideo'),
    aiCutSelectedVideoPill: document.getElementById('aiCutSelectedVideoPill'),
    aiCutSelectedVideoTitle: document.getElementById('aiCutSelectedVideoTitle'),
    aiCutSelectedVideoMeta: document.getElementById('aiCutSelectedVideoMeta'),
    aiCutSrtDropzone: document.getElementById('aiCutSrtDropzone'),
    aiCutSrtFileInput: document.getElementById('aiCutSrtFileInput'),
    aiCutSrtMainText: document.getElementById('aiCutSrtMainText'),
    aiCutSrtSubText: document.getElementById('aiCutSrtSubText'),
    btnExtractEmbeddedSubs: document.getElementById('btnExtractEmbeddedSubs'),
    btnTogglePasteSrt: document.getElementById('btnTogglePasteSrt'),
    boxPasteSrtArea: document.getElementById('boxPasteSrtArea'),
    aiCutSrtTextArea: document.getElementById('aiCutSrtTextArea'),
    aiCutFocusHint: document.getElementById('aiCutFocusHint'),
    aiCutMaxClips: document.getElementById('aiCutMaxClips'),
    btnRunAiSrtAnalysis: document.getElementById('btnRunAiSrtAnalysis'),
    btnRunAiSrtAnalysisText: document.getElementById('btnRunAiSrtAnalysisText'),
    aiCutAnalysisProgress: document.getElementById('aiCutAnalysisProgress'),
    aiCutAnalysisStatusText: document.getElementById('aiCutAnalysisStatusText'),
    boxAiBatchCutControls: document.getElementById('boxAiBatchCutControls'),
    checkAiKeepDialogAudio: document.getElementById('checkAiKeepDialogAudio'),
    checkAiMirrorCut: document.getElementById('checkAiMirrorCut'),
    btnExecuteAiBatchCut: document.getElementById('btnExecuteAiBatchCut'),
    btnExecuteAiBatchCutText: document.getElementById('btnExecuteAiBatchCutText'),
    aiSelectedCountDisplay: document.getElementById('aiSelectedCountDisplay'),
    aiCutBatchProgress: document.getElementById('aiCutBatchProgress'),
    aiBatchCutProgressBar: document.getElementById('aiBatchCutProgressBar'),
    aiBatchCutStatusText: document.getElementById('aiBatchCutStatusText'),
    badgeAiPlayerTimecode: document.getElementById('badgeAiPlayerTimecode'),
    btnAiPlayerMuteToggle: document.getElementById('btnAiPlayerMuteToggle'),
    aiCutPreviewVideo: document.getElementById('aiCutPreviewVideo'),
    aiCutPlayerPlaceholder: document.getElementById('aiCutPlayerPlaceholder'),
    badgeAiClipsCount: document.getElementById('badgeAiClipsCount'),
    btnSelectAllAiClips: document.getElementById('btnSelectAllAiClips'),
    aiGeminiSummaryBox: document.getElementById('aiGeminiSummaryBox'),
    aiGeminiSummaryText: document.getElementById('aiGeminiSummaryText'),
    aiScenesContainer: document.getElementById('aiScenesContainer'),
    aiCutResultsBox: document.getElementById('aiCutResultsBox'),
    aiCutClipsGrid: document.getElementById('aiCutClipsGrid'),
    btnModalSendToAiCut: document.getElementById('btnModalSendToAiCut'),

    // Video Slicer Controls
    btnSourceFromManager: document.getElementById('btnSourceFromManager'),
    btnSourceFromUpload: document.getElementById('btnSourceFromUpload'),
    boxSourceFromManager: document.getElementById('boxSourceFromManager'),
    boxSourceFromUpload: document.getElementById('boxSourceFromUpload'),
    slicerSelectVideo: document.getElementById('slicerSelectVideo'),
    slicerDropzone: document.getElementById('slicerDropzone'),
    slicerFileInput: document.getElementById('slicerFileInput'),
    slicerSelectedPill: document.getElementById('slicerSelectedPill'),
    slicerSelectedTitle: document.getElementById('slicerSelectedTitle'),
    slicerSelectedMeta: document.getElementById('slicerSelectedMeta'),
    btnClearSelectedVideo: document.getElementById('btnClearSelectedVideo'),
    sliderKeepSeconds: document.getElementById('sliderKeepSeconds'),
    inputKeepSeconds: document.getElementById('inputKeepSeconds'),
    chipKeepVal: document.getElementById('chipKeepVal'),
    sliderSkipSeconds: document.getElementById('sliderSkipSeconds'),
    inputSkipSeconds: document.getElementById('inputSkipSeconds'),
    chipSkipVal: document.getElementById('chipSkipVal'),
    formulaSummaryTitle: document.getElementById('formulaSummaryTitle'),
    formulaSummaryDesc: document.getElementById('formulaSummaryDesc'),
    checkMuteAudio: document.getElementById('checkMuteAudio'),
    checkMirrorVideo: document.getElementById('checkMirrorVideo'),
    selectVideoSpeed: document.getElementById('selectVideoSpeed'),
    inputCustomOutputName: document.getElementById('inputCustomOutputName'),
    btnStartSlicing: document.getElementById('btnStartSlicing'),
    btnStartSlicingText: document.getElementById('btnStartSlicingText'),
    slicerProgressContainer: document.getElementById('slicerProgressContainer'),
    slicerProgressBar: document.getElementById('slicerProgressBar'),
    slicerProgressStatus: document.getElementById('slicerProgressStatus'),

    // Slicer Player & Result
    slicerPreviewVideo: document.getElementById('slicerPreviewVideo'),
    playerEmptyPlaceholder: document.getElementById('playerEmptyPlaceholder'),
    badgePreviewMode: document.getElementById('badgePreviewMode'),
    btnTogglePreviewSource: document.getElementById('btnTogglePreviewSource'),
    slicingResultStats: document.getElementById('slicingResultStats'),
    statSourceDuration: document.getElementById('statSourceDuration'),
    statSlicedDuration: document.getElementById('statSlicedDuration'),
    statSavedPercent: document.getElementById('statSavedPercent'),
    statResolutionSize: document.getElementById('statResolutionSize'),
    previewFooterActions: document.getElementById('previewFooterActions'),
    btnDownloadSlicedVideo: document.getElementById('btnDownloadSlicedVideo'),
    btnOpenInFileManager: document.getElementById('btnOpenInFileManager'),
    btnCopyVideoUrl: document.getElementById('btnCopyVideoUrl'),

    // File Manager Elements
    fmFilterBtns: document.querySelectorAll('.fm-filter-btn'),
    fmSearchInput: document.getElementById('fmSearchInput'),
    btnFmClearSearch: document.getElementById('btnFmClearSearch'),
    btnViewGrid: document.getElementById('btnViewGrid'),
    btnViewTable: document.getElementById('btnViewTable'),
    fmMediaGrid: document.getElementById('fmMediaGrid'),
    fmMediaTableContainer: document.getElementById('fmMediaTableContainer'),
    fmMediaTableBody: document.getElementById('fmMediaTableBody'),
    fmEmptyState: document.getElementById('fmEmptyState'),
    btnEmptyUpload: document.getElementById('btnEmptyUpload'),
    fmTotalFiles: document.getElementById('fmTotalFiles'),
    fmVideoRawCount: document.getElementById('fmVideoRawCount'),
    fmVideoSlicedCount: document.getElementById('fmVideoSlicedCount'),
    fmAudioCount: document.getElementById('fmAudioCount'),
    fmTotalStorageSize: document.getElementById('fmTotalStorageSize'),

    // Media Modals
    mediaUploadModal: document.getElementById('mediaUploadModal'),
    btnCloseUploadModal: document.getElementById('btnCloseUploadModal'),
    btnCancelUploadModal: document.getElementById('btnCancelUploadModal'),
    formUploadMedia: document.getElementById('formUploadMedia'),
    modalMediaFileInput: document.getElementById('modalMediaFileInput'),
    modalMediaDropzone: document.getElementById('modalMediaDropzone'),
    modalDropzoneMainText: document.getElementById('modalDropzoneMainText'),
    uploadCategorySelect: document.getElementById('uploadCategorySelect'),
    uploadTagsInput: document.getElementById('uploadTagsInput'),
    uploadNotesInput: document.getElementById('uploadNotesInput'),
    btnSubmitUploadMedia: document.getElementById('btnSubmitUploadMedia'),

    mediaEditModal: document.getElementById('mediaEditModal'),
    btnCloseEditMediaModal: document.getElementById('btnCloseEditMediaModal'),
    btnCancelEditMedia: document.getElementById('btnCancelEditMedia'),
    formEditMedia: document.getElementById('formEditMedia'),
    editMediaId: document.getElementById('editMediaId'),
    editOriginalName: document.getElementById('editOriginalName'),
    editCategorySelect: document.getElementById('editCategorySelect'),
    editTagsInput: document.getElementById('editTagsInput'),
    editNotesInput: document.getElementById('editNotesInput'),
    btnSaveEditMedia: document.getElementById('btnSaveEditMedia'),

    mediaPreviewModal: document.getElementById('mediaPreviewModal'),
    btnClosePreviewModal: document.getElementById('btnClosePreviewModal'),
    btnClosePreviewBottom: document.getElementById('btnClosePreviewBottom'),
    modalPreviewMediaTitle: document.getElementById('modalPreviewMediaTitle'),
    previewModalTypeIcon: document.getElementById('previewModalTypeIcon'),
    modalPlayerBox: document.getElementById('modalPlayerBox'),
    modalPlayerMeta: document.getElementById('modalPlayerMeta'),
    btnModalSendToSlicer: document.getElementById('btnModalSendToSlicer'),
    btnModalDownload: document.getElementById('btnModalDownload'),

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
    newModalYear: document.getElementById('newModalYear'),
    newModalDirector: document.getElementById('newModalDirector'),
    newModalChannel: document.getElementById('newModalChannel'),
    newModalSynopsis: document.getElementById('newModalSynopsis'),

    // Channel Management Modal Elements (SQLite Database)
    btnOpenChannelModal: document.getElementById('btnOpenChannelModal'),
    channelModal: document.getElementById('channelModal'),
    btnCloseChannelModal: document.getElementById('btnCloseChannelModal'),
    btnCloseChannelModalFooter: document.getElementById('btnCloseChannelModalFooter'),
    channelForm: document.getElementById('channelForm'),
    channelEditId: document.getElementById('channelEditId'),
    channelFormHeading: document.getElementById('channelFormHeading'),
    inputChannelName: document.getElementById('inputChannelName'),
    inputChannelGreeting: document.getElementById('inputChannelGreeting'),
    inputChannelOutro: document.getElementById('inputChannelOutro'),
    inputChannelPersona: document.getElementById('inputChannelPersona'),
    inputChannelLang: document.getElementById('inputChannelLang'),
    checkChannelDefault: document.getElementById('checkChannelDefault'),
    btnCancelEditChannel: document.getElementById('btnCancelEditChannel'),
    btnSubmitChannel: document.getElementById('btnSubmitChannel'),
    btnSubmitChannelText: document.getElementById('btnSubmitChannelText'),
    channelCountDisplay: document.getElementById('channelCountDisplay'),
    channelStatusSummary: document.getElementById('channelStatusSummary'),
    channelListContainer: document.getElementById('channelListContainer'),

    // Database Master Center Modal Elements
    btnOpenDbMasterModal: document.getElementById('btnOpenDbMasterModal'),
    btnOpenDbMasterModalHome: document.getElementById('btnOpenDbMasterModalHome'),
    btnQuickManagePersona: document.getElementById('btnQuickManagePersona'),
    dbMasterModal: document.getElementById('dbMasterModal'),
    btnCloseDbMasterModal: document.getElementById('btnCloseDbMasterModal'),
    btnCloseDbMasterModalFooter: document.getElementById('btnCloseDbMasterModalFooter'),
    tabBtnDbPersonas: document.getElementById('tabBtnDbPersonas'),
    tabBtnDbVoices: document.getElementById('tabBtnDbVoices'),
    tabBtnDbPrompts: document.getElementById('tabBtnDbPrompts'),
    tabBtnDbSettings: document.getElementById('tabBtnDbSettings'),
    masterTabPersonas: document.getElementById('masterTabPersonas'),
    masterTabVoices: document.getElementById('masterTabVoices'),
    masterTabPrompts: document.getElementById('masterTabPrompts'),
    masterTabSettings: document.getElementById('masterTabSettings'),
    badgeDbPersonaCount: document.getElementById('badgeDbPersonaCount'),
    badgeDbVoiceCount: document.getElementById('badgeDbVoiceCount'),
    personaListCount: document.getElementById('personaListCount'),
    voiceCountBadge: document.getElementById('voiceCountBadge'),

    // Persona Form
    personaForm: document.getElementById('personaForm'),
    personaEditId: document.getElementById('personaEditId'),
    personaFormHeading: document.getElementById('personaFormHeading'),
    inputPersonaName: document.getElementById('inputPersonaName'),
    inputPersonaKey: document.getElementById('inputPersonaKey'),
    inputPersonaDesc: document.getElementById('inputPersonaDesc'),
    inputPersonaTone: document.getElementById('inputPersonaTone'),
    checkPersonaDefault: document.getElementById('checkPersonaDefault'),
    btnCancelEditPersona: document.getElementById('btnCancelEditPersona'),
    btnSubmitPersona: document.getElementById('btnSubmitPersona'),
    btnSubmitPersonaText: document.getElementById('btnSubmitPersonaText'),
    personaListContainer: document.getElementById('personaListContainer'),

    // Voice Form
    selectVoiceFilterModel: document.getElementById('selectVoiceFilterModel'),
    voiceForm: document.getElementById('voiceForm'),
    voiceEditId: document.getElementById('voiceEditId'),
    voiceFormHeading: document.getElementById('voiceFormHeading'),
    inputVoiceModel: document.getElementById('inputVoiceModel'),
    inputVoiceCode: document.getElementById('inputVoiceCode'),
    inputVoiceDisplayName: document.getElementById('inputVoiceDisplayName'),
    inputVoiceGender: document.getElementById('inputVoiceGender'),
    inputVoiceDesc: document.getElementById('inputVoiceDesc'),
    checkVoiceDefault: document.getElementById('checkVoiceDefault'),
    btnCancelEditVoice: document.getElementById('btnCancelEditVoice'),
    btnSubmitVoice: document.getElementById('btnSubmitVoice'),
    btnSubmitVoiceText: document.getElementById('btnSubmitVoiceText'),
    voiceListContainer: document.getElementById('voiceListContainer'),

    // Prompts Form
    selectPromptStageKey: document.getElementById('selectPromptStageKey'),
    btnResetPromptsToDefault: document.getElementById('btnResetPromptsToDefault'),
    promptTemplateForm: document.getElementById('promptTemplateForm'),
    inputPromptName: document.getElementById('inputPromptName'),
    inputPromptDesc: document.getElementById('inputPromptDesc'),
    inputPromptContent: document.getElementById('inputPromptContent'),
    btnSavePromptTemplate: document.getElementById('btnSavePromptTemplate'),

    // App Settings Form
    appSettingsForm: document.getElementById('appSettingsForm'),
    settingWpm: document.getElementById('settingWpm'),
    settingHookMaxSeconds: document.getElementById('settingHookMaxSeconds'),
    settingGeminiModel: document.getElementById('settingGeminiModel'),
    settingDefaultLang: document.getElementById('settingDefaultLang'),
    btnSaveAppSettings: document.getElementById('btnSaveAppSettings'),

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
    movieYear: document.getElementById('movieYear'),
    movieDirector: document.getElementById('movieDirector'),
    movieDescription: document.getElementById('movieDescription'),
    channelNameInput: document.getElementById('channelNameInput'),
    openingHookInput: document.getElementById('openingHookInput'),
    outroBridgeInput: document.getElementById('outroBridgeInput'),
    personaStyleSelect: document.getElementById('personaStyleSelect'),
    checkIncludeAnalysis: document.getElementById('checkIncludeAnalysis'),
    checkEnforceVisualCues: document.getElementById('checkEnforceVisualCues'),
    geminiModelSelect: document.getElementById('geminiModelSelect'),
    geminiModelBadge: document.getElementById('geminiModelBadge'),
    
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
    btnCleanAiPreamble: document.getElementById('btnCleanAiPreamble'),
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
    studioEditor: document.getElementById('studio-editor'),
    btnToggleSidebar: document.getElementById('btnToggleSidebar'),
    btnToggleSidebarText: document.getElementById('btnToggleSidebarText')
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

  // --- View Switcher (Home vs Studio vs Media) ---
  function switchView(targetView) {
    state.activeView = targetView;
    if (targetView === 'home') {
      elements.homeWorkspace.hidden = false;
      elements.studioWorkspace.hidden = true;
      if (elements.mediaWorkspace) elements.mediaWorkspace.hidden = true;
      if (elements.mobileNavBar) elements.mobileNavBar.hidden = true;

      elements.navBtnHome.classList.add('active');
      elements.navBtnStudio.classList.remove('active');
      if (elements.navBtnMediaStudio) elements.navBtnMediaStudio.classList.remove('active');

      elements.headerPresetBox.hidden = true;
      elements.headerCenterBox.hidden = true;
      elements.studioHeaderActions.hidden = true;
      elements.homeHeaderActions.hidden = false;
      elements.activeProjectPill.hidden = true;

      fetchProjectsList();
    } else if (targetView === 'media') {
      elements.homeWorkspace.hidden = true;
      elements.studioWorkspace.hidden = true;
      if (elements.mediaWorkspace) elements.mediaWorkspace.hidden = false;
      if (elements.mobileNavBar) elements.mobileNavBar.hidden = true;

      if (elements.navBtnMediaStudio) elements.navBtnMediaStudio.classList.add('active');
      elements.navBtnHome.classList.remove('active');
      elements.navBtnStudio.classList.remove('active');

      elements.headerPresetBox.hidden = true;
      elements.headerCenterBox.hidden = true;
      elements.studioHeaderActions.hidden = true;
      elements.homeHeaderActions.hidden = true;
      elements.activeProjectPill.hidden = false;

      fetchMediaList();
      fetchMediaStats();
      updateSlicerFormulaText();
    } else {
      elements.homeWorkspace.hidden = true;
      elements.studioWorkspace.hidden = false;
      if (elements.mediaWorkspace) elements.mediaWorkspace.hidden = true;
      if (elements.mobileNavBar) elements.mobileNavBar.hidden = false;

      elements.navBtnStudio.classList.add('active');
      elements.navBtnHome.classList.remove('active');
      if (elements.navBtnMediaStudio) elements.navBtnMediaStudio.classList.remove('active');

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
      (p.release_year && p.release_year.toLowerCase().includes(query)) ||
      (p.director && p.director.toLowerCase().includes(query)) ||
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
      const displayDirector = p.director || (p.director_year || 'Sutradara belum diisi');
      const yearBadge = p.release_year ? `<span class="project-year-badge">${escapeHtml(p.release_year)}</span>` : '';

      return `
        <article class="project-card" data-id="${p.id}">
          <div class="project-card-top">
            <div class="project-card-header">
              <div>
                <h3 class="project-card-title">${escapeHtml(p.title)}</h3>
                <div class="project-card-director">${escapeHtml(displayDirector)} ${yearBadge}</div>
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
              <button type="button" class="btn-card-action btn-clone-project" data-id="${p.id}" title="Duplikat Proyek Film Ini">📋 Duplikat</button>
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

    elements.projectsGrid.querySelectorAll('.btn-clone-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cloneProjectById(btn.dataset.id);
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
        if (elements.movieYear) elements.movieYear.value = p.release_year || '';
        if (elements.movieDirector) elements.movieDirector.value = p.director || (p.director_year || '').replace(/\s*\(\d{4}\)$/, '');
        elements.movieDescription.value = p.synopsis || '';
        elements.channelNameInput.value = p.channel_name || 'AAAlur Cerita';
        elements.openingHookInput.value = p.opening_hook || 'Halo Nakama';
        elements.outroBridgeInput.value = p.outro_bridge || '';
        elements.personaStyleSelect.value = p.persona_style || 'teman_ngopi';
        elements.checkIncludeAnalysis.checked = Boolean(p.include_analysis);
        elements.checkEnforceVisualCues.checked = Boolean(p.enforce_visual_cues);

        // Sync header channel select
        syncChannelSelectWithCurrent(p.channel_name);

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
        const yearPart = p.release_year ? ` (${p.release_year})` : '';
        elements.activeProjectTitleDisplay.textContent = `${p.title}${yearPart}`;

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
    // Sinkronisasi otomatis dari Canvas Editor aktif ke state naskah sebelum disimpan ke database
    if (!state.isRawMode && elements.scriptPaperReader) {
      const liveMd = domPaperToMarkdown(elements.scriptPaperReader);
      if (liveMd !== undefined && liveMd !== null) {
        state.currentScriptMarkdown = liveMd;
      }
    } else if (state.isRawMode && elements.scriptRawEditor) {
      state.currentScriptMarkdown = elements.scriptRawEditor.value;
    }

    const releaseYear = elements.movieYear ? elements.movieYear.value.trim() : '';
    const director = elements.movieDirector ? elements.movieDirector.value.trim() : '';
    const directorYear = `${director}${releaseYear ? ' (' + releaseYear + ')' : ''}`.trim();

    const payload = {
      title: elements.movieTitle.value || 'Film Tanpa Judul',
      release_year: releaseYear,
      director: director,
      director_year: directorYear,
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
        const yearPart = json.data.release_year ? ` (${json.data.release_year})` : '';
        elements.activeProjectTitleDisplay.textContent = `${json.data.title}${yearPart}`;
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

  // --- SQLite Backend Integration: Clone / Duplicate Project ---
  async function cloneProjectById(projectId) {
    try {
      showToast("Menduplikasi proyek film...");
      const res = await fetch(`/api/projects/${projectId}/clone`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        showToast(`Proyek berhasil diduplikat: "${json.data.title}"`);
        await fetchProjectsList();
      } else {
        showToast(json.error || "Gagal menduplikat proyek.", "error");
      }
    } catch (err) {
      console.error('Error cloning project:', err);
      showToast("Gagal menghubungi server untuk duplikasi proyek.", "error");
    }
  }

  // --- Modal: Create New Project ---
  function openNewProjectModal() {
    elements.newModalTitle.value = '';
    if (elements.newModalYear) elements.newModalYear.value = '';
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

    const releaseYear = elements.newModalYear ? elements.newModalYear.value.trim() : '';
    const director = elements.newModalDirector ? elements.newModalDirector.value.trim() : '';
    const directorYear = `${director}${releaseYear ? ' (' + releaseYear + ')' : ''}`.trim();

    const selectedChannelVal = elements.newModalChannel ? elements.newModalChannel.value : '';
    let channel = state.channelsList.find(c => String(c.id) === String(selectedChannelVal) || c.name === selectedChannelVal);
    if (!channel && state.channelsList.length > 0) {
      channel = state.channelsList.find(c => c.is_default) || state.channelsList[0];
    }
    const channelName = channel ? channel.name : 'AAAlur Cerita';
    const channelGreeting = channel ? channel.greeting : 'Halo Nakama';
    const channelOutro = channel ? channel.outro_bridge : 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya';
    const channelPersona = channel ? channel.persona_style : 'teman_ngopi';

    const payload = {
      title: title,
      release_year: releaseYear,
      director: director,
      director_year: directorYear,
      synopsis: elements.newModalSynopsis.value.trim(),
      channel_name: channelName,
      opening_hook: channelGreeting,
      outro_bridge: channelOutro,
      persona_style: channelPersona,
      include_analysis: true,
      enforce_visual_cues: true,
      script_markdown: `# ${title.toUpperCase()}${releaseYear ? ' (' + releaseYear + ')' : ''}\n**Genre**: Action / Drama\n**Channel**: ${channelName}\n\n---\n\n## [OPENING]\n(Visual: Scene pembuka film)\n\n${channelGreeting}! Selamat datang di alur cerita film ${title}...\n\n${channelOutro}!\n\n---\n\n## [BODY STORY]\n\n### PART 1: AWAL MULA KISAH\n(Visual: Tokoh utama diperkenalkan)\n\nKisah bermula di sini...\n`,
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

  // --- Channel Management Modal & SQLite Integration ---
  function openChannelModal() {
    if (elements.channelModal) {
      elements.channelModal.hidden = false;
      resetChannelForm();
      fetchChannelsList();
      if (elements.inputChannelName) elements.inputChannelName.focus();
    }
  }

  function closeChannelModal() {
    if (elements.channelModal) {
      elements.channelModal.hidden = true;
      resetChannelForm();
    }
  }

  function resetChannelForm() {
    if (elements.channelForm) elements.channelForm.reset();
    if (elements.channelEditId) elements.channelEditId.value = '';
    if (elements.channelFormHeading) elements.channelFormHeading.textContent = '+ Tambah Profil Channel Baru';
    if (elements.btnSubmitChannelText) elements.btnSubmitChannelText.textContent = '+ Simpan Channel';
    if (elements.btnCancelEditChannel) elements.btnCancelEditChannel.hidden = true;
    if (elements.checkChannelDefault) elements.checkChannelDefault.checked = false;
  }

  async function fetchChannelsList() {
    try {
      const res = await fetch('/api/channels');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.channelsList = json.data;

        // Populate Header Channel Select
        if (elements.channelPresetSelect) {
          const currentVal = elements.channelPresetSelect.value;
          elements.channelPresetSelect.innerHTML = state.channelsList.map(c => `
            <option value="${c.id}" ${c.is_default ? 'data-default="true"' : ''}>
              ${escapeHtml(c.name)} (${escapeHtml(c.greeting)})
            </option>
          `).join('');

          // Select current active if matches, else default
          const matching = state.channelsList.find(c => c.name.toLowerCase() === (elements.channelNameInput?.value || '').toLowerCase());
          if (matching) {
            elements.channelPresetSelect.value = matching.id;
          } else if (state.channelsList.find(c => String(c.id) === String(currentVal))) {
            elements.channelPresetSelect.value = currentVal;
          } else {
            const def = state.channelsList.find(c => c.is_default) || state.channelsList[0];
            if (def) elements.channelPresetSelect.value = def.id;
          }
        }

        // Populate New Project Modal Channel Select
        if (elements.newModalChannel) {
          elements.newModalChannel.innerHTML = state.channelsList.map(c => `
            <option value="${c.id}" ${c.is_default ? 'selected' : ''}>
              ${escapeHtml(c.name)} (${escapeHtml(c.greeting)})
            </option>
          `).join('');
        }

        renderChannelsList();
      }
    } catch (err) {
      console.warn('Gagal memuat profil channel dari database:', err);
    }
  }

  function renderChannelsList() {
    if (!elements.channelListContainer) return;
    const channels = state.channelsList || [];

    if (elements.channelCountDisplay) {
      elements.channelCountDisplay.textContent = channels.length;
    }

    if (channels.length === 0) {
      elements.channelListContainer.innerHTML = `
        <div class="keys-empty-box">
          <p>Belum ada profil channel yang tersimpan di database SQLite.</p>
          <small>Gunakan form di atas untuk menambahkan channel YouTube/Sosmed Anda.</small>
        </div>
      `;
      return;
    }

    const getPersonaLabel = (key) => {
      const p = state.personas && state.personas.find(item => item.key === key);
      if (p) return p.name;
      const fallbackLabels = {
        'teman_ngopi': 'Lo-Gue Santai',
        'kritis_serius': 'Kritis & Analitis',
        'semi_formal': 'Semi-Formal Hangat',
        'engaging_storyteller': 'Engaging Storyteller',
        'cinematic_intense': 'Cinematic Intense'
      };
      return fallbackLabels[key] || key;
    };

    const langFlags = {
      'id': '🇮🇩 ID',
      'en-US': '🇺🇸 EN-US',
      'en-GB': '🇬🇧 EN-GB',
      'es': '🇪🇸 ES',
      'pt-BR': '🇧🇷 PT-BR',
      'ja': '🇯🇵 JA'
    };

    elements.channelListContainer.innerHTML = channels.map(c => {
      const isDefault = Boolean(c.is_default);
      const personaName = getPersonaLabel(c.persona_style) || 'Teman Ngopi';
      const langName = langFlags[c.target_language] || c.target_language || '🇮🇩 ID';

      return `
        <div class="channel-item-card ${isDefault ? 'is-default' : ''}" data-id="${c.id}">
          <div class="channel-item-top">
            <div class="channel-name-title">
              <span>📺 ${escapeHtml(c.name)}</span>
              ${isDefault ? '<span class="badge badge-success" style="font-size:10px; background:#DCFCE7; color:#15803D; font-weight:700; padding:2px 7px; border-radius:4px; border:1px solid #86EFAC;">DEFAULT</span>' : ''}
            </div>
            <div class="channel-badges">
              <span class="meta-chip primary" style="font-size:11px;">${langName}</span>
              <span class="meta-chip" style="font-size:11px;">${personaName}</span>
            </div>
          </div>
          <div class="channel-details-grid">
            <div><strong>Sapaan:</strong> "${escapeHtml(c.greeting)}"</div>
            <div><strong>Outro:</strong> "${escapeHtml(c.outro_bridge)}"</div>
          </div>
          <div class="channel-item-actions">
            <button type="button" class="btn-subtle btn-xs btn-apply-channel" data-id="${c.id}" title="Terapkan profil ini ke Studio naskah saat ini">
              ✓ Terapkan ke Studio
            </button>
            ${!isDefault ? `
              <button type="button" class="btn-subtle btn-xs btn-default-channel" data-id="${c.id}" title="Jadikan profil default untuk proyek baru">
                ★ Set Default
              </button>
            ` : ''}
            <button type="button" class="btn-subtle btn-xs btn-edit-channel" data-id="${c.id}" title="Edit channel ini">
              ✏️ Edit
            </button>
            ${channels.length > 1 ? `
              <button type="button" class="btn-subtle btn-xs danger btn-delete-channel" data-id="${c.id}" title="Hapus channel dari database">
                🗑 Hapus
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function applyChannelById(channelId, showFeedback = true) {
    const c = state.channelsList.find(ch => String(ch.id) === String(channelId));
    if (!c) return;

    if (elements.channelNameInput) elements.channelNameInput.value = c.name;
    if (elements.openingHookInput) elements.openingHookInput.value = c.greeting;
    if (elements.outroBridgeInput) elements.outroBridgeInput.value = c.outro_bridge;
    if (elements.personaStyleSelect) elements.personaStyleSelect.value = c.persona_style || 'teman_ngopi';

    if (elements.channelPresetSelect) elements.channelPresetSelect.value = c.id;

    saveCurrentProjectToSQLite();

    if (showFeedback) {
      showToast(`Profil channel diubah ke: ${c.name}`);
    }
  }

  function syncChannelSelectWithCurrent(channelName) {
    if (!elements.channelPresetSelect || !state.channelsList.length) return;
    const match = state.channelsList.find(c => c.name.toLowerCase() === (channelName || '').toLowerCase());
    if (match) {
      elements.channelPresetSelect.value = match.id;
    }
  }

  function startEditChannel(channelId) {
    const c = state.channelsList.find(ch => String(ch.id) === String(channelId));
    if (!c) return;

    if (elements.channelEditId) elements.channelEditId.value = c.id;
    if (elements.inputChannelName) elements.inputChannelName.value = c.name;
    if (elements.inputChannelGreeting) elements.inputChannelGreeting.value = c.greeting;
    if (elements.inputChannelOutro) elements.inputChannelOutro.value = c.outro_bridge;
    if (elements.inputChannelPersona) elements.inputChannelPersona.value = c.persona_style || 'teman_ngopi';
    if (elements.inputChannelLang) elements.inputChannelLang.value = c.target_language || 'id';
    if (elements.checkChannelDefault) elements.checkChannelDefault.checked = Boolean(c.is_default);

    if (elements.channelFormHeading) elements.channelFormHeading.textContent = `✏️ Edit Profil Channel: ${c.name}`;
    if (elements.btnSubmitChannelText) elements.btnSubmitChannelText.textContent = 'Simpan Perubahan';
    if (elements.btnCancelEditChannel) elements.btnCancelEditChannel.hidden = false;

    if (elements.inputChannelName) {
      elements.inputChannelName.focus();
      elements.inputChannelName.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function handleSaveChannelSubmit(e) {
    e.preventDefault();

    const editId = elements.channelEditId ? elements.channelEditId.value : '';
    const name = elements.inputChannelName.value.trim();
    const greeting = elements.inputChannelGreeting.value.trim();
    const outro_bridge = elements.inputChannelOutro.value.trim();
    const persona_style = elements.inputChannelPersona.value;
    const target_language = elements.inputChannelLang.value;
    const is_default = elements.checkChannelDefault.checked ? 1 : 0;

    if (!name || !greeting || !outro_bridge) {
      showToast('Harap lengkapi semua kolom bertanda *', 'error');
      return;
    }

    const payload = {
      name,
      greeting,
      outro_bridge,
      persona_style,
      target_language,
      is_default
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/channels/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(editId ? `Channel "${name}" berhasil diperbarui!` : `Channel baru "${name}" berhasil disimpan ke database!`);
        resetChannelForm();
        await fetchChannelsList();
      } else {
        showToast(json.error || 'Gagal menyimpan profil channel.', 'error');
      }
    } catch (err) {
      console.error('Error saving channel:', err);
      showToast('Terjadi kesalahan jaringan saat menyimpan channel.', 'error');
    }
  }

  async function handleDeleteChannel(channelId) {
    const c = state.channelsList.find(ch => String(ch.id) === String(channelId));
    const name = c ? c.name : 'ini';

    if (state.channelsList.length <= 1) {
      alert('Minimal harus ada 1 profil channel di database SQLite.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus profil channel "${name}" dari database?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Profil channel "${name}" berhasil dihapus.`);
        resetChannelForm();
        await fetchChannelsList();
      } else {
        showToast(json.error || 'Gagal menghapus profil channel.', 'error');
      }
    } catch (err) {
      console.error('Error deleting channel:', err);
      showToast('Gagal menghapus channel.', 'error');
    }
  }

  async function handleSetDefaultChannel(channelId) {
    try {
      const res = await fetch(`/api/channels/${channelId}/default`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        const c = state.channelsList.find(ch => String(ch.id) === String(channelId));
        showToast(`Channel "${c ? c.name : ''}" sekarang menjadi default!`);
        await fetchChannelsList();
      } else {
        showToast(json.error || 'Gagal mengubah default channel.', 'error');
      }
    } catch (err) {
      console.error('Error setting default channel:', err);
      showToast('Gagal mengubah default channel.', 'error');
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
            ${(k.status !== 'valid' || k.error_count > 0) ? `
              <button type="button" class="btn-key-action btn-test" data-action="reset" data-id="${k.id}" title="Reset status error dan cooldown kunci ini">
                Reset
              </button>
            ` : ''}
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
        } else if (action === 'reset') {
          await handleResetKeyStatus(id);
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
    // Speech rate from SQLite appSettings
    const wpm = (state.appSettings && state.appSettings.default_wpm) || 140;
    const wordsPerSec = wpm / 60;
    const estSec = Math.round(words / wordsPerSec);
    const estMnt = Math.round(words / wpm);
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

  // --- Modal: Transcreation & Anti-Duplicate Localization ---
  let newlyCreatedTransProjectId = null;

  function openTranslateModal() {
    if (!elements.translateModal) return;
    elements.translateModal.hidden = false;
    if (elements.transResultCard) elements.transResultCard.hidden = true;
    if (elements.transProgressBox) elements.transProgressBox.hidden = true;
    if (elements.btnOpenTransProject) elements.btnOpenTransProject.hidden = true;
    newlyCreatedTransProjectId = null;
  }

  function closeTranslateModal() {
    if (!elements.translateModal) return;
    elements.translateModal.hidden = true;
  }

  async function handleTranscreateScript() {
    const rawScript = state.currentScriptMarkdown || (elements.scriptRawEditor ? elements.scriptRawEditor.value : '');
    if (!rawScript || rawScript.trim().length === 0) {
      showToast('Naskah masih kosong. Silakan tulis atau sintesis naskah terlebih dahulu.');
      return;
    }

    const targetLang = elements.transTargetLangSelect ? elements.transTargetLangSelect.value : 'en-US';
    const customLang = elements.transCustomLangInput ? elements.transCustomLangInput.value.trim() : '';
    const uniqueness = elements.transUniquenessSelect ? elements.transUniquenessSelect.value : 'ultra';
    const channelName = elements.transChannelNameInput ? elements.transChannelNameInput.value.trim() : 'Movie Recap Hub';
    const openingHook = elements.transOpeningHookInput ? elements.transOpeningHookInput.value.trim() : 'Hey movie fans, welcome back!';
    const personaStyle = elements.transPersonaStyleSelect ? elements.transPersonaStyleSelect.value : 'engaging_storyteller';
    const saveMode = elements.transSaveModeSelect ? elements.transSaveModeSelect.value : 'new_project';
    const preferredModel = elements.transGeminiModelSelect ? elements.transGeminiModelSelect.value : 'auto';

    if (elements.btnTriggerTranscreate) elements.btnTriggerTranscreate.disabled = true;
    if (elements.btnTriggerTranscreateText) elements.btnTriggerTranscreateText.textContent = '⏳ AI Sedang Menulis Ulang Naskah (Transcreation)...';
    if (elements.transProgressBox) elements.transProgressBox.hidden = false;
    if (elements.transResultCard) elements.transResultCard.hidden = true;
    if (elements.transProgressBar) elements.transProgressBar.style.width = '35%';
    if (elements.transStepBadge) elements.transStepBadge.textContent = 'Tahap 1: Ekstraksi Plot';

    const pTimer1 = setTimeout(() => {
      if (elements.transProgressBar) elements.transProgressBar.style.width = '65%';
      if (elements.transStepBadge) elements.transStepBadge.textContent = 'Tahap 2: Re-framing Native Flow';
    }, 1200);

    const pTimer2 = setTimeout(() => {
      if (elements.transProgressBar) elements.transProgressBar.style.width = '88%';
      if (elements.transStepBadge) elements.transStepBadge.textContent = 'Tahap 3: Penyelarasan Tag Visual';
    }, 2800);

    try {
      const projectId = state.currentProjectId || 1;
      const res = await fetch(`/api/projects/${projectId}/transcreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_script: rawScript,
          targetLanguage: targetLang,
          customLanguage: customLang,
          channelName,
          openingHook,
          personaStyle,
          antiDuplicateLevel: uniqueness,
          saveMode,
          preferredModel
        })
      });

      clearTimeout(pTimer1);
      clearTimeout(pTimer2);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses terjemahan AI.');
      }

      if (elements.transProgressBar) elements.transProgressBar.style.width = '100%';
      if (elements.transStepBadge) elements.transStepBadge.textContent = 'Selesai!';

      // Show result
      if (elements.transResultCard && elements.transResultPreview) {
        elements.transResultCard.hidden = false;
        elements.transResultPreview.value = json.transcreatedScript;
      }
      if (elements.transResultModelBadge && json.active_model) {
        elements.transResultModelBadge.textContent = json.active_model;
      }

      if (json.saveMode === 'new_project' && json.newProject) {
        newlyCreatedTransProjectId = json.newProject.id;
        if (elements.btnOpenTransProject) {
          elements.btnOpenTransProject.hidden = false;
          elements.btnOpenTransProject.textContent = `Buka Proyek: ${json.newProject.title} ↗`;
        }
        fetchProjectsList();
        showToast(`✓ Berhasil! Dibuat sebagai proyek baru: "${json.newProject.title}"`);
      } else {
        state.currentScriptMarkdown = json.transcreatedScript;
        renderScript(true);
        if (elements.canvasSyncStatus) {
          elements.canvasSyncStatus.textContent = '✓ Naskah Terjemahan Tersimpan di SQLite';
        }
        showToast('✓ Naskah berhasil diterjemahkan dan diperbarui!');
      }

    } catch (err) {
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      console.error('Transcreation error:', err);
      showToast(`✕ Gagal: ${err.message}`);
    } finally {
      if (elements.btnTriggerTranscreate) elements.btnTriggerTranscreate.disabled = false;
      if (elements.btnTriggerTranscreateText) elements.btnTriggerTranscreateText.textContent = '🚀 Mulai Terjemah Anti-Duplikat (AI Transcreation)';
      if (elements.transProgressBox) elements.transProgressBox.hidden = true;
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
      { id: 'dia_male_lead', name: '🎙️ Pria: Narator Utama (Berwibawa & Dalam)', default: true },
      { id: 'dia_female_lead', name: '👩 Wanita: Narator Hangat & Jelas' },
      { id: 'dia_male_casual', name: '🗣️ Pria: Karakter Santai (Teman Ngopi, Kasual)' },
      { id: 'dia_female_expressive', name: '👧 Wanita: Karakter Dinamis & Ceria' },
      { id: 'dia_dialogue', name: '👥 Mode Multi-Dialog Percakapan ([S1] Pria + [S2] Wanita)' },
      { id: 'dia_cinematic', name: '🎬 Mode Sinematik (Efek Tawa, Helaan Napas, Bisikan)' }
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
    let voices = [];
    if (state.ttsVoices && state.ttsVoices.length > 0) {
      voices = state.ttsVoices.filter(v => v.model === model).map(v => ({
        id: v.voice_code,
        name: v.display_name,
        default: Boolean(v.is_default)
      }));
    }
    if (voices.length === 0) {
      voices = TTS_VOICE_CATALOG[model] || TTS_VOICE_CATALOG.kokoro;
    }
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
          temperature: parseFloat(elements.ttsTempRange ? elements.ttsTempRange.value : 0.75) || 0.75,
          cfg_scale: parseFloat(elements.ttsCfgRange ? elements.ttsCfgRange.value : 2.5) || 2.5,
          dialogue_mode: elements.ttsDialogueModeSelect ? elements.ttsDialogueModeSelect.value : 'auto',
          tone_style: elements.ttsToneStyleSelect ? elements.ttsToneStyleSelect.value : 'natural',
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
        html += `<aside class="visual-note" contenteditable="false">
          <div class="visual-note-tag" contenteditable="false">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            ARAHAN VISUAL (B-ROLL)
          </div>
          <div class="visual-note-content" contenteditable="true">${cueText}</div>
        </aside>`;
        continue;
      }

      // Plain text block "ARAHAN VISUAL (B-ROLL)"
      if (line === 'ARAHAN VISUAL (B-ROLL)' && i + 1 < lines.length) {
        i++;
        const cueText = escapeHtml(lines[i].trim());
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<aside class="visual-note" contenteditable="false">
          <div class="visual-note-tag" contenteditable="false">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            ARAHAN VISUAL (B-ROLL)
          </div>
          <div class="visual-note-content" contenteditable="true">${cueText}</div>
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
    const wpm = (state.appSettings && state.appSettings.default_wpm) || 140;
    const durationMin = Math.ceil(words / wpm);

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

  /**
   * Menghapus kata pengantar, basa-basi, atau chit-chat AI (seperti "Tentu, Nakama! Siap-siap...")
   */
  function stripAiConversationalPreamble(text) {
    if (!text || typeof text !== 'string') return text;
    let cleaned = text.trim();

    // Strip Markdown code fences
    cleaned = cleaned.replace(/^```(?:markdown)?\s*\r?\n/i, '').replace(/\r?\n```\s*$/i, '').trim();

    // Pattern 1: Leading conversational paragraphs (Tentu, Siap-siap, Baik, Berikut, dll)
    const preambleRegex = /^(?:Tentu|Baik|Siap|Tentu saja|Berikut|Ini dia)[^\n]*?(?:satukan|naskah|alur cerita|kepala lu|permintaan|lu minta|versi|buatkan|simak|ngampleh)[^\n]*(\r?\n)+([\s\*\-_]*\r?\n)*/i;
    while (preambleRegex.test(cleaned)) {
      cleaned = cleaned.replace(preambleRegex, '').trim();
    }

    // Pattern 2: Any chatter before script headings, [OPENING], or visual note
    const scriptStartMatch = cleaned.match(/(?:^|\n)(#\s+[^\n]+|##\s*\[[^\n]+|\[OPENING\]|\(Visual:[^\n]+)/i);
    if (scriptStartMatch && scriptStartMatch.index > 0 && scriptStartMatch.index < 500) {
      const priorText = cleaned.substring(0, scriptStartMatch.index).trim();
      if (/tentu|siap|satukan|naskah|ngampleh|minta|gua udah|berikut adalah|versi/i.test(priorText)) {
        cleaned = cleaned.substring(scriptStartMatch.index).trim();
      }
    }

    // Pattern 3: Stray markdown separators
    cleaned = cleaned.replace(/^[\*\-_]{1,5}\s*(\r?\n)+/m, '').trim();
    return cleaned;
  }

  /**
   * Mengonversi struktur DOM kertas naskah (.script-paper) kembali ke teks Markdown murni
   * Memungkinkan pengguna melakukan CRUD (Ketik, Edit, Hapus, Tambah) secara langsung di kanvas.
   */
  function domPaperToMarkdown(paperEl) {
    if (!paperEl) return '';
    const childNodes = Array.from(paperEl.childNodes);
    const chunks = [];

    childNodes.forEach(node => {
      // Text node langsung di canvas paper
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) chunks.push(text);
        return;
      }
      if (node.nodeType !== 1) return;

      const tag = node.tagName.toLowerCase();
      if (tag === 'h1') {
        const t = (node.innerText || node.textContent).trim();
        chunks.push(t.startsWith('# ') ? t : `# ${t}`);
      } else if (tag === 'h2') {
        const span = node.querySelector('span');
        const t = (span ? span.innerText : (node.innerText || node.textContent)).trim();
        chunks.push(t.startsWith('## ') ? t : `## ${t}`);
      } else if (tag === 'h3') {
        const t = (node.innerText || node.textContent).trim();
        chunks.push(t.startsWith('### ') ? t : `### ${t}`);
      } else if (node.classList.contains('visual-note')) {
        const contentEl = node.querySelector('.visual-note-content');
        const text = (contentEl ? contentEl.innerText : node.innerText || node.textContent).trim();
        chunks.push(`(Visual: ${text})`);
      } else if (node.classList.contains('doc-metadata-bar')) {
        chunks.push((node.innerText || node.textContent).trim());
      } else if (tag === 'hr') {
        chunks.push('---');
      } else if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'blockquote') {
        const text = (node.innerText || node.textContent).trim();
        if (text) chunks.push(text);
      }
    });

    return chunks.join('\n\n').trim();
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
  function applyPreset(presetKeyOrId) {
    // If it's a number/string ID from SQLite channels:
    const byId = state.channelsList.find(c => String(c.id) === String(presetKeyOrId));
    if (byId) {
      applyChannelById(byId.id, true);
      return;
    }

    const p = PRESETS[presetKeyOrId];
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

    const releaseYear = elements.movieYear ? elements.movieYear.value.trim() : '';
    const director = elements.movieDirector ? elements.movieDirector.value.trim() : '';
    const directorYear = `${director}${releaseYear ? ' (' + releaseYear + ')' : ''}`.trim();

    const payload = {
      title: elements.movieTitle.value || 'Film Pilihan',
      release_year: releaseYear,
      movieYear: releaseYear,
      director: director,
      movieDirector: director,
      director_year: directorYear,
      synopsis: elements.movieDescription.value || '',
      channel_name: elements.channelNameInput.value || 'AAAlur Cerita',
      opening_hook: elements.openingHookInput.value || 'Halo Nakama',
      outro_bridge: elements.outroBridgeInput.value || '',
      persona_style: elements.personaStyleSelect.value || 'teman_ngopi',
      include_analysis: elements.checkIncludeAnalysis.checked,
      enforce_visual_cues: elements.checkEnforceVisualCues.checked,
      sources: state.sources,
      gemini_model: elements.geminiModelSelect ? elements.geminiModelSelect.value : 'auto'
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
          let generatedMarkdown = resData.data.script_markdown || resData.data;
          generatedMarkdown = stripAiConversationalPreamble(generatedMarkdown);
          state.currentScriptMarkdown = generatedMarkdown;
          renderScript(true);
          elements.canvasSyncStatus.textContent = "✓ Tersimpan di SQLite (alurcerita.db)";

          const activeModelName = resData.active_model || (resData.used_models ? resData.used_models.join(', ') : 'Gemini AI');
          if (elements.geminiModelBadge) {
            elements.geminiModelBadge.textContent = activeModelName;
          }
          showToast(`✓ Naskah berhasil disintesis menggunakan ${activeModelName}!`);
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

  // =========================================================================
  // --- DATABASE MASTER CENTER (Full CRUD: Persona, Suara, Prompts, Settings) ---
  // =========================================================================

  function openDbMasterModal(initialTab = 'masterTabPersonas') {
    if (elements.dbMasterModal) {
      elements.dbMasterModal.hidden = false;
      switchMasterTab(initialTab);
    }
  }

  function closeDbMasterModal() {
    if (elements.dbMasterModal) {
      elements.dbMasterModal.hidden = true;
      resetPersonaForm();
      resetVoiceForm();
    }
  }

  function switchMasterTab(targetTabId) {
    const tabs = [
      { btn: elements.tabBtnDbPersonas, pane: elements.masterTabPersonas, id: 'masterTabPersonas' },
      { btn: elements.tabBtnDbVoices, pane: elements.masterTabVoices, id: 'masterTabVoices' },
      { btn: elements.tabBtnDbPrompts, pane: elements.masterTabPrompts, id: 'masterTabPrompts' },
      { btn: elements.tabBtnDbSettings, pane: elements.masterTabSettings, id: 'masterTabSettings' },
      { btn: elements.tabBtnDbAudioPresets, pane: elements.masterTabAudioPresets, id: 'masterTabAudioPresets' }
    ];

    tabs.forEach(t => {
      if (t.btn && t.pane) {
        const isActive = t.id === targetTabId;
        t.btn.classList.toggle('active', isActive);
        t.pane.hidden = !isActive;
      }
    });

    if (targetTabId === 'masterTabPersonas') {
      fetchPersonasList();
    } else if (targetTabId === 'masterTabVoices') {
      fetchTtsVoicesList();
    } else if (targetTabId === 'masterTabPrompts') {
      fetchPromptTemplatesList();
    } else if (targetTabId === 'masterTabSettings') {
      fetchAppSettings();
    } else if (targetTabId === 'masterTabAudioPresets') {
      fetchAudioPresetsList();
    }
  }

  // --- 1. PERSONAS / GAYA TUTUR CRUD ---
  async function fetchPersonasList() {
    try {
      const res = await fetch('/api/personas');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.personas = json.data;

        // Badge counters
        if (elements.badgeDbPersonaCount) elements.badgeDbPersonaCount.textContent = state.personas.length;
        if (elements.personaListCount) elements.personaListCount.textContent = state.personas.length;

        // Populate Studio persona dropdown
        if (elements.personaStyleSelect) {
          const cur = elements.personaStyleSelect.value;
          elements.personaStyleSelect.innerHTML = state.personas.map(p => `
            <option value="${escapeHtml(p.key)}" ${p.is_default ? 'data-default="true"' : ''}>
              ${escapeHtml(p.name)}
            </option>
          `).join('');

          if (state.personas.some(p => p.key === cur)) {
            elements.personaStyleSelect.value = cur;
          } else {
            const def = state.personas.find(p => p.is_default) || state.personas[0];
            if (def) elements.personaStyleSelect.value = def.key;
          }
        }

        // Populate Channel modal persona dropdown
        if (elements.inputChannelPersona) {
          const curChannelPersona = elements.inputChannelPersona.value;
          elements.inputChannelPersona.innerHTML = state.personas.map(p => `
            <option value="${escapeHtml(p.key)}">
              ${escapeHtml(p.name)}
            </option>
          `).join('');
          if (curChannelPersona && state.personas.some(p => p.key === curChannelPersona)) {
            elements.inputChannelPersona.value = curChannelPersona;
          }
        }

        renderPersonasList();
      }
    } catch (err) {
      console.warn('Gagal memuat persona dari database:', err);
    }
  }

  function renderPersonasList() {
    if (!elements.personaListContainer) return;
    const list = state.personas || [];

    if (list.length === 0) {
      elements.personaListContainer.innerHTML = `
        <div class="keys-empty-box">
          <p>Belum ada persona gaya tutur narasi tersimpan di database.</p>
        </div>
      `;
      return;
    }

    elements.personaListContainer.innerHTML = list.map(p => `
      <div class="key-item-row" style="align-items: flex-start; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #E2E8F0; background: #FFF;">
        <div style="flex: 1; min-width: 0; margin-right: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
            <strong style="color: #0F172A; font-size: 14px;">${escapeHtml(p.name)}</strong>
            <span class="val-badge font-mono" style="font-size: 11px;">${escapeHtml(p.key)}</span>
            ${p.is_default ? '<span class="status-badge success" style="font-size: 11px;">Default</span>' : ''}
          </div>
          ${p.description ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">${escapeHtml(p.description)}</p>` : ''}
          <div style="font-size: 11px; color: #334155; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px; font-family: monospace; white-space: pre-wrap; max-height: 80px; overflow-y: auto;">${escapeHtml(p.tone_prompt)}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
          ${!p.is_default ? `<button type="button" class="btn-subtle btn-xs btn-default-persona" data-id="${p.id}" title="Set sebagai default persona">Set Default</button>` : ''}
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-subtle btn-xs btn-edit-persona" data-id="${p.id}" title="Edit Persona">Edit</button>
            <button type="button" class="btn-subtle btn-xs danger btn-delete-persona" data-id="${p.id}" title="Hapus Persona">Hapus</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function startEditPersona(id) {
    const p = state.personas.find(item => String(item.id) === String(id));
    if (!p) return;

    if (elements.personaEditId) elements.personaEditId.value = p.id;
    if (elements.inputPersonaName) elements.inputPersonaName.value = p.name;
    if (elements.inputPersonaKey) elements.inputPersonaKey.value = p.key;
    if (elements.inputPersonaDesc) elements.inputPersonaDesc.value = p.description || '';
    if (elements.inputPersonaTone) elements.inputPersonaTone.value = p.tone_prompt || '';
    if (elements.checkPersonaDefault) elements.checkPersonaDefault.checked = Boolean(p.is_default);

    if (elements.personaFormHeading) elements.personaFormHeading.textContent = `✏️ Edit Persona: ${p.name}`;
    if (elements.btnSubmitPersonaText) elements.btnSubmitPersonaText.textContent = 'Perbarui Persona';
    if (elements.btnCancelEditPersona) elements.btnCancelEditPersona.hidden = false;

    if (elements.inputPersonaName) elements.inputPersonaName.focus();
  }

  function resetPersonaForm() {
    if (elements.personaForm) elements.personaForm.reset();
    if (elements.personaEditId) elements.personaEditId.value = '';
    if (elements.personaFormHeading) elements.personaFormHeading.textContent = '+ Tambah Persona / Gaya Tutur Baru';
    if (elements.btnSubmitPersonaText) elements.btnSubmitPersonaText.textContent = '+ Simpan Persona';
    if (elements.btnCancelEditPersona) elements.btnCancelEditPersona.hidden = true;
    if (elements.checkPersonaDefault) elements.checkPersonaDefault.checked = false;
  }

  async function handleSavePersonaSubmit(e) {
    e.preventDefault();
    const editId = elements.personaEditId?.value;
    const payload = {
      name: elements.inputPersonaName?.value.trim(),
      key: elements.inputPersonaKey?.value.trim(),
      description: elements.inputPersonaDesc?.value.trim(),
      tone_prompt: elements.inputPersonaTone?.value.trim(),
      is_default: elements.checkPersonaDefault?.checked ? 1 : 0
    };

    if (!payload.name || !payload.key || !payload.tone_prompt) {
      showToast('Nama, kode unik, dan tone prompt wajib diisi!', 'error');
      return;
    }

    try {
      const url = editId ? `/api/personas/${editId}` : '/api/personas';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast(editId ? 'Persona berhasil diperbarui!' : 'Persona baru berhasil disimpan!');
        resetPersonaForm();
        await fetchPersonasList();
      } else {
        showToast(json.error || 'Gagal menyimpan persona.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server.', 'error');
    }
  }

  async function handleDeletePersona(id) {
    const p = state.personas.find(item => String(item.id) === String(id));
    const name = p ? p.name : 'ini';
    if (!confirm(`Hapus persona "${name}" dari database SQLite?`)) return;

    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Persona "${name}" berhasil dihapus.`);
        resetPersonaForm();
        await fetchPersonasList();
      } else {
        showToast(json.error || 'Gagal menghapus persona.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus persona.', 'error');
    }
  }

  async function handleSetDefaultPersona(id) {
    try {
      const res = await fetch(`/api/personas/${id}/default`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Persona default berhasil diubah!');
        await fetchPersonasList();
      } else {
        showToast(json.error || 'Gagal mengubah default persona.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah default persona.', 'error');
    }
  }

  // --- 2. KARAKTER SUARA TTS CRUD ---
  async function fetchTtsVoicesList() {
    try {
      const res = await fetch('/api/tts/voices');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.ttsVoices = json.data;

        if (elements.badgeDbVoiceCount) elements.badgeDbVoiceCount.textContent = state.ttsVoices.length;
        if (elements.voiceCountBadge) elements.voiceCountBadge.textContent = `${state.ttsVoices.length} Suara Terdaftar`;

        renderTtsVoicesList();
        populateTtsVoiceOptions(elements.ttsModelSelect ? elements.ttsModelSelect.value : 'kokoro');
      }
    } catch (err) {
      console.warn('Gagal memuat suara TTS dari database:', err);
    }
  }

  function renderTtsVoicesList() {
    if (!elements.voiceListContainer) return;
    const filter = elements.selectVoiceFilterModel?.value || 'all';
    let list = state.ttsVoices || [];
    if (filter !== 'all') {
      list = list.filter(v => v.model === filter);
    }

    if (list.length === 0) {
      elements.voiceListContainer.innerHTML = `
        <div class="keys-empty-box">
          <p>Belum ada karakter suara untuk model yang dipilih.</p>
        </div>
      `;
      return;
    }

    const modelNames = {
      kokoro: 'Kokoro-82M',
      dia: 'Nari Dia-1.6B',
      xtts: 'Coqui XTTS v2'
    };

    elements.voiceListContainer.innerHTML = list.map(v => `
      <div class="key-item-row" style="align-items: center; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #E2E8F0; background: #FFF;">
        <div style="flex: 1; min-width: 0; margin-right: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
            <span class="status-badge info" style="font-size: 11px;">${modelNames[v.model] || v.model}</span>
            <strong style="color: #0F172A; font-size: 13px;">${escapeHtml(v.display_name)}</strong>
            <span class="val-badge font-mono" style="font-size: 11px;">${escapeHtml(v.voice_code)}</span>
            <span class="val-badge" style="font-size: 10px;">${v.gender === 'female' ? '♀ Wanita' : v.gender === 'male' ? '♂ Pria' : '⚡ Neutral'}</span>
            ${v.is_default ? '<span class="status-badge success" style="font-size: 11px;">Default</span>' : ''}
          </div>
          ${v.description ? `<p style="margin: 0; font-size: 12px; color: #64748B;">${escapeHtml(v.description)}</p>` : ''}
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          ${!v.is_default ? `<button type="button" class="btn-subtle btn-xs btn-default-voice" data-id="${v.id}" title="Set sebagai default suara model ini">Set Default</button>` : ''}
          <button type="button" class="btn-subtle btn-xs btn-edit-voice" data-id="${v.id}" title="Edit Suara">Edit</button>
          <button type="button" class="btn-subtle btn-xs danger btn-delete-voice" data-id="${v.id}" title="Hapus Suara">Hapus</button>
        </div>
      </div>
    `).join('');
  }

  function startEditVoice(id) {
    const v = state.ttsVoices.find(item => String(item.id) === String(id));
    if (!v) return;

    if (elements.voiceEditId) elements.voiceEditId.value = v.id;
    if (elements.inputVoiceModel) elements.inputVoiceModel.value = v.model;
    if (elements.inputVoiceCode) elements.inputVoiceCode.value = v.voice_code;
    if (elements.inputVoiceDisplayName) elements.inputVoiceDisplayName.value = v.display_name;
    if (elements.inputVoiceGender) elements.inputVoiceGender.value = v.gender || 'neutral';
    if (elements.inputVoiceDesc) elements.inputVoiceDesc.value = v.description || '';
    if (elements.checkVoiceDefault) elements.checkVoiceDefault.checked = Boolean(v.is_default);

    if (elements.voiceFormHeading) elements.voiceFormHeading.textContent = `✏️ Edit Karakter Suara: ${v.display_name}`;
    if (elements.btnSubmitVoiceText) elements.btnSubmitVoiceText.textContent = 'Perbarui Suara';
    if (elements.btnCancelEditVoice) elements.btnCancelEditVoice.hidden = false;

    if (elements.inputVoiceDisplayName) elements.inputVoiceDisplayName.focus();
  }

  function resetVoiceForm() {
    if (elements.voiceForm) elements.voiceForm.reset();
    if (elements.voiceEditId) elements.voiceEditId.value = '';
    if (elements.voiceFormHeading) elements.voiceFormHeading.textContent = '+ Tambah Karakter Suara TTS Baru';
    if (elements.btnSubmitVoiceText) elements.btnSubmitVoiceText.textContent = '+ Simpan Karakter Suara';
    if (elements.btnCancelEditVoice) elements.btnCancelEditVoice.hidden = true;
    if (elements.checkVoiceDefault) elements.checkVoiceDefault.checked = false;
  }

  async function handleSaveVoiceSubmit(e) {
    e.preventDefault();
    const editId = elements.voiceEditId?.value;
    const payload = {
      model: elements.inputVoiceModel?.value,
      voice_code: elements.inputVoiceCode?.value.trim(),
      display_name: elements.inputVoiceDisplayName?.value.trim(),
      gender: elements.inputVoiceGender?.value || 'neutral',
      description: elements.inputVoiceDesc?.value.trim(),
      is_default: elements.checkVoiceDefault?.checked ? 1 : 0
    };

    if (!payload.model || !payload.voice_code || !payload.display_name) {
      showToast('Model, kode suara, dan nama tampilan wajib diisi!', 'error');
      return;
    }

    try {
      const url = editId ? `/api/tts/voices/${editId}` : '/api/tts/voices';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast(editId ? 'Karakter suara berhasil diperbarui!' : 'Karakter suara baru berhasil disimpan!');
        resetVoiceForm();
        await fetchTtsVoicesList();
      } else {
        showToast(json.error || 'Gagal menyimpan suara.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server.', 'error');
    }
  }

  async function handleDeleteVoice(id) {
    const v = state.ttsVoices.find(item => String(item.id) === String(id));
    const name = v ? v.display_name : 'ini';
    if (!confirm(`Hapus karakter suara "${name}" dari database SQLite?`)) return;

    try {
      const res = await fetch(`/api/tts/voices/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Karakter suara "${name}" berhasil dihapus.`);
        resetVoiceForm();
        await fetchTtsVoicesList();
      } else {
        showToast(json.error || 'Gagal menghapus suara.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus suara.', 'error');
    }
  }

  async function handleSetDefaultVoice(id) {
    try {
      const res = await fetch(`/api/tts/voices/${id}/default`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Suara default model ini berhasil diubah!');
        await fetchTtsVoicesList();
      } else {
        showToast(json.error || 'Gagal mengubah default suara.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah default suara.', 'error');
    }
  }

  // --- 3. PROMPT TEMPLATES CRUD ---
  async function fetchPromptTemplatesList() {
    try {
      const res = await fetch('/api/prompts');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.promptTemplates = json.data;
        loadSelectedPromptTemplate();
      }
    } catch (err) {
      console.warn('Gagal memuat prompt templates dari database:', err);
    }
  }

  function loadSelectedPromptTemplate() {
    if (!elements.selectPromptStageKey) return;
    const stageKey = elements.selectPromptStageKey.value;
    const tpl = state.promptTemplates?.find(t => t.stage_key === stageKey);
    if (tpl) {
      if (elements.inputPromptName) elements.inputPromptName.value = tpl.name || '';
      if (elements.inputPromptDesc) elements.inputPromptDesc.value = tpl.description || '';
      if (elements.inputPromptContent) elements.inputPromptContent.value = tpl.prompt_content || tpl.content || '';
    } else {
      if (elements.inputPromptName) elements.inputPromptName.value = '';
      if (elements.inputPromptDesc) elements.inputPromptDesc.value = '';
      if (elements.inputPromptContent) elements.inputPromptContent.value = '';
    }
  }

  async function handleSavePromptTemplateSubmit(e) {
    e.preventDefault();
    const stageKey = elements.selectPromptStageKey?.value;
    if (!stageKey) return;

    const payload = {
      name: elements.inputPromptName?.value.trim(),
      description: elements.inputPromptDesc?.value.trim(),
      prompt_content: elements.inputPromptContent?.value.trim(),
      content: elements.inputPromptContent?.value.trim()
    };

    if (!payload.name || !payload.prompt_content) {
      showToast('Nama dan isi prompt template wajib diisi!', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/prompts/${stageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Template "${payload.name}" berhasil disimpan ke SQLite!`);
        await fetchPromptTemplatesList();
      } else {
        showToast(json.error || 'Gagal menyimpan template prompt.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server.', 'error');
    }
  }

  async function handleResetPromptsToDefault() {
    if (!confirm('Apakah Anda yakin ingin me-reset SEMUA template prompt ke versi bawaan sistem? Perubahan kustom Anda akan ditimpa.')) {
      return;
    }
    try {
      const res = await fetch('/api/prompts/reset', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Template prompt berhasil dikembalikan ke bawaan sistem!');
        await fetchPromptTemplatesList();
      } else {
        showToast(json.error || 'Gagal mereset template prompt.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server.', 'error');
    }
  }

  // --- 4. APP SETTINGS GLOBAL CRUD ---
  async function fetchAppSettings() {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        state.appSettings = json.data;

        if (elements.settingWpm) elements.settingWpm.value = state.appSettings.default_wpm || 140;
        if (elements.settingHookMaxSeconds) elements.settingHookMaxSeconds.value = state.appSettings.max_hook_seconds || 30;
        if (elements.settingGeminiModel) elements.settingGeminiModel.value = state.appSettings.default_gemini_model || 'auto';
        if (elements.settingDefaultLang) elements.settingDefaultLang.value = state.appSettings.default_language || 'id';

        updateScriptMetrics();
        updateTtsTextMetrics();
      }
    } catch (err) {
      console.warn('Gagal memuat pengaturan aplikasi dari database:', err);
    }
  }

  async function handleSaveAppSettingsSubmit(e) {
    e.preventDefault();
    const payload = {
      default_wpm: parseInt(elements.settingWpm?.value, 10) || 140,
      max_hook_seconds: parseInt(elements.settingHookMaxSeconds?.value, 10) || 30,
      default_gemini_model: elements.settingGeminiModel?.value || 'auto',
      default_language: elements.settingDefaultLang?.value || 'id'
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        state.appSettings = json.data;
        showToast('Pengaturan global berhasil disimpan ke database SQLite!');
        updateScriptMetrics();
        updateTtsTextMetrics();
      } else {
        showToast(json.error || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server.', 'error');
    }
  }

  // ==========================================================================
  // AUDIO MIXING & MASTERING SUITE CONTROLLER
  // ==========================================================================

  let audioVisualizerAnimFrame = null;

  function formatAudioSeconds(sec) {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
  }

  async function openAudioSuiteModal(options = {}) {
    if (!elements.audioSuiteModal) return;
    elements.audioSuiteModal.hidden = false;
    if (elements.audioDockResizer) elements.audioDockResizer.hidden = false;

    // Update Dock Toggle UI state to ON
    if (elements.btnToggleAudioDock) {
      elements.btnToggleAudioDock.classList.add('active');
      elements.btnToggleAudioDock.setAttribute('aria-pressed', 'true');
    }
    if (elements.audioDockTogglePill) {
      elements.audioDockTogglePill.textContent = 'ON';
    }
    if (elements.audioSuiteActiveDot) {
      elements.audioSuiteActiveDot.classList.add('active');
    }

    // Auto adapt visualizer canvases to dock width
    resizeAudioCanvases();

    // Load available Presets from SQLite
    await fetchAudioPresetsList();

    // Load BGM list from server
    await fetchBgmList();

    // Load project TTS recordings list
    await fetchProjectTtsList();

    // Load project sound library files
    await fetchProjectSoundLibrary();

    // Default to mic tab or specified tab
    switchAudioSourceTab(options.initialTab || state.audioSuite.activeTab || 'audioSourceTabMic');

    // Auto load voice if provided
    if (options.autoLoadTtsUrl) {
      await loadAudioTrackFromUrl(options.autoLoadTtsUrl, options.autoLoadFilename || 'Voiceover Proyek');
      // Auto select TTS Voice Healer preset
      applyPresetToEngine('tts_healer');
    } else if (window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
      updateAudioTrackDisplay(state.audioSuite.loadedTrackName, 'Loaded');
    }

    startAudioVisualizerLoop();
  }

  function closeAudioSuiteModal() {
    if (!elements.audioSuiteModal) return;
    if (window.AlurAudioEngine) {
      window.AlurAudioEngine.stop();
      if (window.AlurAudioEngine.isRecording) {
        window.AlurAudioEngine.stopRecording();
      }
    }
    stopAudioVisualizerLoop();
    elements.audioSuiteModal.hidden = true;
    if (elements.audioDockResizer) elements.audioDockResizer.hidden = true;

    // Update Dock Toggle UI state to OFF
    if (elements.btnToggleAudioDock) {
      elements.btnToggleAudioDock.classList.remove('active');
      elements.btnToggleAudioDock.setAttribute('aria-pressed', 'false');
    }
    if (elements.audioDockTogglePill) {
      elements.audioDockTogglePill.textContent = 'OFF';
    }
    if (elements.audioSuiteActiveDot) {
      elements.audioSuiteActiveDot.classList.remove('active');
    }
  }

  function toggleAudioDock(forceState = null) {
    if (!elements.audioSuiteModal) return;
    const isCurrentlyHidden = elements.audioSuiteModal.hidden;
    const shouldOpen = (forceState !== null) ? Boolean(forceState) : isCurrentlyHidden;

    if (shouldOpen) {
      openAudioSuiteModal();
    } else {
      closeAudioSuiteModal();
    }
  }

  function resizeAudioCanvases() {
    if (elements.audioWaveformCanvas && elements.audioWaveformCanvas.parentElement) {
      const w = elements.audioWaveformCanvas.parentElement.clientWidth;
      if (w > 50) {
        elements.audioWaveformCanvas.width = w;
        if (window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
          window.AlurAudioEngine.drawWaveform(elements.audioWaveformCanvas, window.AlurAudioEngine.getCurrentTime());
        }
      }
    }
    if (elements.recOscilloscopeCanvas && elements.recOscilloscopeCanvas.parentElement) {
      const w = elements.recOscilloscopeCanvas.parentElement.clientWidth;
      if (w > 50) {
        elements.recOscilloscopeCanvas.width = w;
      }
    }
  }


  function toggleLeftSidebar(forceState = null) {
    if (!elements.studioSidebar) return;
    const isCollapsed = elements.studioSidebar.classList.contains('collapsed');
    const shouldCollapse = (forceState !== null) ? Boolean(forceState) : !isCollapsed;

    if (shouldCollapse) {
      elements.studioSidebar.classList.add('collapsed');
      if (elements.btnToggleSidebar) {
        elements.btnToggleSidebar.classList.add('active');
        elements.btnToggleSidebar.setAttribute('aria-pressed', 'true');
      }
      if (elements.btnToggleSidebarText) {
        elements.btnToggleSidebarText.textContent = 'Buka Input';
      }
    } else {
      elements.studioSidebar.classList.remove('collapsed');
      if (elements.btnToggleSidebar) {
        elements.btnToggleSidebar.classList.remove('active');
        elements.btnToggleSidebar.setAttribute('aria-pressed', 'false');
      }
      if (elements.btnToggleSidebarText) {
        elements.btnToggleSidebarText.textContent = 'Panel Input';
      }
    }

    localStorage.setItem('alur_sidebar_collapsed', shouldCollapse ? '1' : '0');
    resizeAudioCanvases();
  }

  function initAudioDockResizer() {
    if (!elements.audioDockResizer || !elements.audioSuiteModal) return;

    // Restore saved width from localStorage if exists
    const savedWidth = localStorage.getItem('alur_audio_dock_width');
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (parsed >= 320 && parsed <= window.innerWidth * 0.75) {
        elements.audioSuiteModal.style.width = parsed + 'px';
      }
    }

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const onMouseDown = (e) => {
      if (elements.audioSuiteModal.hidden) return;
      isDragging = true;
      startX = e.clientX;
      startWidth = elements.audioSuiteModal.getBoundingClientRect().width;
      elements.audioDockResizer.classList.add('is-dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = startX - e.clientX; // Dragging left widens dock
      let newWidth = startWidth + deltaX;
      const minWidth = 320;
      const maxWidth = Math.floor(window.innerWidth * 0.70);
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

      elements.audioSuiteModal.style.width = newWidth + 'px';
      resizeAudioCanvases();
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      elements.audioDockResizer.classList.remove('is-dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const currentWidth = elements.audioSuiteModal.getBoundingClientRect().width;
      localStorage.setItem('alur_audio_dock_width', Math.round(currentWidth));
      resizeAudioCanvases();
    };

    elements.audioDockResizer.addEventListener('mousedown', onMouseDown);
  }

  function switchAudioSourceTab(targetTabId) {
    const tabs = [
      { btn: elements.tabBtnAudioMic, pane: elements.audioSourceTabMic, id: 'audioSourceTabMic' },
      { btn: elements.tabBtnAudioUpload, pane: elements.audioSourceTabUpload, id: 'audioSourceTabUpload' },
      { btn: elements.tabBtnAudioTts, pane: elements.audioSourceTabTts, id: 'audioSourceTabTts' }
    ];

    tabs.forEach(t => {
      if (t.btn && t.pane) {
        const isActive = t.id === targetTabId;
        t.btn.classList.toggle('active', isActive);
        t.pane.hidden = !isActive;
      }
    });

    state.audioSuite.activeTab = targetTabId;
  }

  async function loadAudioTrackFromUrl(url, label) {
    if (!window.AlurAudioEngine) return;
    try {
      showToast('Memuat track audio...', 'info');
      await window.AlurAudioEngine.loadVoiceFromUrl(url);

      state.audioSuite.loadedTrackName = label || 'Audio Track';
      updateAudioTrackDisplay(state.audioSuite.loadedTrackName, 'Loaded');
      showToast(`Audio "${state.audioSuite.loadedTrackName}" berhasil dimuat!`);
    } catch (err) {
      console.error(err);
      showToast(`Gagal memuat audio: ${err.message}`, 'error');
    }
  }

  function updateAudioTrackDisplay(name, format) {
    if (elements.audioActiveTrackLabel) elements.audioActiveTrackLabel.textContent = name || 'Belum ada audio dimuat';
    if (elements.audioActiveFormatBadge) elements.audioActiveFormatBadge.textContent = format || '-';
    if (elements.audioTrackStatusDot) elements.audioTrackStatusDot.classList.add('active');
    if (elements.waveformEmptyState) elements.waveformEmptyState.hidden = true;

    if (window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
      const dur = window.AlurAudioEngine.voiceBuffer.duration;
      if (elements.audioTimeTotal) {
        elements.audioTimeTotal.textContent = formatAudioSeconds(dur);
      }
      window.AlurAudioEngine.drawWaveform(elements.audioWaveformCanvas, 0);

      // Show quick append button on deck if audio is loaded
      if (elements.btnDeckAppendRecord) elements.btnDeckAppendRecord.hidden = false;

      // Update Recording UI to Append State so user knows they can continue recording seamlessly!
      if (elements.btnStartRecordText) elements.btnStartRecordText.textContent = 'Lanjutkan Rekam (Sambung Audio)';
      if (elements.recAppendHint) elements.recAppendHint.hidden = false;
      if (elements.btnRestartRecord) elements.btnRestartRecord.hidden = false;
      if (elements.recTimerDisplay) elements.recTimerDisplay.textContent = formatAudioSeconds(dur);
      if (elements.recStatusLabel) elements.recStatusLabel.textContent = `Track aktif (${formatAudioSeconds(dur)}). Klik "Lanjutkan Rekam" untuk menyambung audio baru ke akhir track tanpa menimpa.`;
    } else {
      if (elements.btnDeckAppendRecord) elements.btnDeckAppendRecord.hidden = true;
      if (elements.btnStartRecordText) elements.btnStartRecordText.textContent = 'Mulai Merekam Mic';
      if (elements.recAppendHint) elements.recAppendHint.hidden = true;
      if (elements.btnRestartRecord) elements.btnRestartRecord.hidden = true;
      if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.hidden = true;
    }
  }

  function startAudioVisualizerLoop() {
    if (audioVisualizerAnimFrame) cancelAnimationFrame(audioVisualizerAnimFrame);

    function tick() {
      if (elements.audioSuiteModal && !elements.audioSuiteModal.hidden) {
        // 1. Draw Waveform Playhead
        if (window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
          const curTime = window.AlurAudioEngine.getCurrentTime();
          const totalDur = window.AlurAudioEngine.getDuration();
          window.AlurAudioEngine.drawWaveform(elements.audioWaveformCanvas, curTime);

          // Update transport timer
          if (elements.audioTimeCurrent) elements.audioTimeCurrent.textContent = formatAudioSeconds(curTime);
          if (elements.audioTimeTotal) elements.audioTimeTotal.textContent = formatAudioSeconds(totalDur);

          // Update play button icon
          if (elements.transportPlayIcon) {
            elements.transportPlayIcon.textContent = window.AlurAudioEngine.isPlaying ? '⏸' : '▶';
          }
        }

        // 2. VU meter
        if (window.AlurAudioEngine && window.AlurAudioEngine.analyserNode && window.AlurAudioEngine.isPlaying) {
          const analyser = window.AlurAudioEngine.analyserNode;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const norm = (data[i] - 128) / 128;
            sum += norm * norm;
          }
          const rms = Math.sqrt(sum / data.length);
          const db = rms > 0.0001 ? 20 * Math.log10(rms) : -60;
          const pct = Math.max(0, Math.min(100, ((db + 48) / 48) * 100));

          if (elements.vuMasterMeter) elements.vuMasterMeter.style.width = `${pct}%`;
          if (elements.vuReadingDb) elements.vuReadingDb.textContent = db > -48 ? `${db.toFixed(1)} dB` : '-inf dB';
        } else {
          if (elements.vuMasterMeter) elements.vuMasterMeter.style.width = '0%';
          if (elements.vuReadingDb) elements.vuReadingDb.textContent = '-inf dB';
        }

        // 3. Recording Oscilloscope
        if (window.AlurAudioEngine && window.AlurAudioEngine.isRecording) {
          window.AlurAudioEngine.drawLiveAnalyser(elements.recOscilloscopeCanvas, true);
        }

        audioVisualizerAnimFrame = requestAnimationFrame(tick);
      }
    }

    audioVisualizerAnimFrame = requestAnimationFrame(tick);
  }

  function stopAudioVisualizerLoop() {
    if (audioVisualizerAnimFrame) {
      cancelAnimationFrame(audioVisualizerAnimFrame);
      audioVisualizerAnimFrame = null;
    }
  }

  // --- RECORDING CONTROLS ---
  async function handleStartRecording(forceAppend = null) {
    if (!window.AlurAudioEngine) return;
    try {
      const hasExistingAudio = Boolean(window.AlurAudioEngine.voiceBuffer);
      const isAppend = (forceAppend !== null) ? Boolean(forceAppend) : hasExistingAudio;

      if (elements.btnStartRecord) elements.btnStartRecord.hidden = true;
      if (elements.btnRestartRecord) elements.btnRestartRecord.hidden = true;
      if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.hidden = true;
      if (elements.btnPauseResumeRecord) {
        elements.btnPauseResumeRecord.hidden = false;
        elements.btnPauseResumeText.textContent = 'Jeda';
        elements.btnPauseResumeIcon.textContent = '⏸';
      }
      if (elements.btnStopRecord) elements.btnStopRecord.hidden = false;
      if (elements.recLiveBadge) elements.recLiveBadge.hidden = false;
      if (elements.recStatusLabel) {
        elements.recStatusLabel.textContent = isAppend
          ? 'Sedang merekam sambungan narasi... Bicaralah dengan artikulasi jelas.'
          : 'Sedang merekam narasi... Bicaralah dengan artikulasi jelas.';
      }

      await window.AlurAudioEngine.startRecording((seconds) => {
        if (elements.recTimerDisplay) {
          elements.recTimerDisplay.textContent = formatAudioSeconds(seconds);
        }
      }, isAppend);
    } catch (err) {
      console.error(err);
      showToast(`Akses mikrofon ditolak: ${err.message}`, 'error');
      resetRecordUi();
    }
  }

  function handlePauseResumeRecording() {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.isRecording) return;
    if (window.AlurAudioEngine.isRecordingPaused) {
      window.AlurAudioEngine.resumeRecording();
      elements.btnPauseResumeText.textContent = 'Jeda';
      elements.btnPauseResumeIcon.textContent = '⏸';
      elements.recStatusLabel.textContent = 'Merekam dilanjutkan...';
      elements.recLiveBadge.hidden = false;
    } else {
      window.AlurAudioEngine.pauseRecording();
      elements.btnPauseResumeText.textContent = 'Lanjutkan';
      elements.btnPauseResumeIcon.textContent = '▶';
      elements.recStatusLabel.textContent = 'Rekaman dijeda sementara.';
      elements.recLiveBadge.hidden = true;
    }
  }

  async function handleStopRecording() {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.isRecording) return;
    try {
      showToast('Memproses audio rekaman...', 'info');
      const res = await window.AlurAudioEngine.stopRecording();
      resetRecordUi();

      if (res && res.buffer) {
        state.audioSuite.loadedTrackName = `🎙️ Rekaman Mic (${formatAudioSeconds(res.duration)})`;
        updateAudioTrackDisplay(state.audioSuite.loadedTrackName, 'WAV 48kHz');

        if (res.isAppended) {
          if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.hidden = false;
          showToast(`Rekaman berhasil disambungkan! Total durasi sekarang: ${formatAudioSeconds(res.duration)}.`);
        } else {
          // Auto apply YouTube Recap Gold
          applyPresetToEngine('youtube_recap');
          showToast('Rekaman mic berhasil dimuat ke DSP Rack!');
        }
      }
    } catch (err) {
      console.error(err);
      showToast(`Gagal memproses rekaman: ${err.message}`, 'error');
      resetRecordUi();
    }
  }

  function handleRestartRecord() {
    if (!window.AlurAudioEngine) return;
    if (!confirm('Apakah Anda yakin ingin menghapus rekaman saat ini dan mulai rekam baru dari awal (00:00)?')) {
      return;
    }
    window.AlurAudioEngine.stop();
    window.AlurAudioEngine.voiceBuffer = null;
    window.AlurAudioEngine.previousVoiceBuffer = null;
    state.audioSuite.loadedTrackName = null;

    if (elements.audioActiveTrackLabel) elements.audioActiveTrackLabel.textContent = 'Belum ada audio dimuat';
    if (elements.audioActiveFormatBadge) elements.audioActiveFormatBadge.textContent = '-';
    if (elements.audioTrackStatusDot) elements.audioTrackStatusDot.classList.remove('active');
    if (elements.waveformEmptyState) elements.waveformEmptyState.hidden = false;
    if (elements.audioTimeTotal) elements.audioTimeTotal.textContent = '00:00';
    if (elements.audioTimeCurrent) elements.audioTimeCurrent.textContent = '00:00';
    if (elements.btnDeckAppendRecord) elements.btnDeckAppendRecord.hidden = true;

    if (elements.audioWaveformCanvas) {
      const ctx = elements.audioWaveformCanvas.getContext('2d');
      ctx.clearRect(0, 0, elements.audioWaveformCanvas.width, elements.audioWaveformCanvas.height);
    }

    resetRecordUi();
    showToast('Rekaman direset. Anda dapat mulai merekam dari awal.', 'info');
  }

  function handleUndoAppendRecord() {
    if (!window.AlurAudioEngine) return;
    const prevBuffer = window.AlurAudioEngine.undoAppendRecording();
    if (prevBuffer) {
      state.audioSuite.loadedTrackName = `🎙️ Rekaman Mic (${formatAudioSeconds(prevBuffer.duration)})`;
      updateAudioTrackDisplay(state.audioSuite.loadedTrackName, 'WAV 48kHz');
      if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.hidden = true;
      resetRecordUi();
      showToast(`Sambungan rekaman terakhir dibatalkan. Durasi kembali ke ${formatAudioSeconds(prevBuffer.duration)}.`);
    } else {
      showToast('Tidak ada rekaman sebelumnya yang dapat di-undo.', 'warning');
    }
  }

  function handleDeckAppendRecord() {
    switchAudioSourceTab('audioSourceTabMic');
    if (elements.audioSourceTabMic) {
      elements.audioSourceTabMic.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (window.AlurAudioEngine && !window.AlurAudioEngine.isRecording) {
      handleStartRecording(true);
    }
  }

  function resetRecordUi() {
    if (elements.btnStartRecord) elements.btnStartRecord.hidden = false;
    if (elements.btnPauseResumeRecord) elements.btnPauseResumeRecord.hidden = true;
    if (elements.btnStopRecord) elements.btnStopRecord.hidden = true;
    if (elements.recLiveBadge) elements.recLiveBadge.hidden = true;

    if (window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
      const dur = window.AlurAudioEngine.voiceBuffer.duration;
      if (elements.btnStartRecordText) elements.btnStartRecordText.textContent = 'Lanjutkan Rekam (Sambung Audio)';
      if (elements.recAppendHint) elements.recAppendHint.hidden = false;
      if (elements.btnRestartRecord) elements.btnRestartRecord.hidden = false;
      if (elements.recTimerDisplay) elements.recTimerDisplay.textContent = formatAudioSeconds(dur);
      if (elements.recStatusLabel) elements.recStatusLabel.textContent = `Rekaman tersimpan (${formatAudioSeconds(dur)}). Klik tombol untuk melanjutkan/menyambung rekaman tanpa menimpa.`;
    } else {
      if (elements.btnStartRecordText) elements.btnStartRecordText.textContent = 'Mulai Merekam Mic';
      if (elements.recAppendHint) elements.recAppendHint.hidden = true;
      if (elements.btnRestartRecord) elements.btnRestartRecord.hidden = true;
      if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.hidden = true;
      if (elements.recTimerDisplay) elements.recTimerDisplay.textContent = '00:00';
      if (elements.recStatusLabel) elements.recStatusLabel.textContent = 'Mikrofon siap. Klik tombol merah untuk merekam narasi utuh.';
    }
  }

  // --- MANUAL SOUND FILE UPLOAD & LIBRARY ---
  function setUploadTargetMode(mode) {
    state.audioSuite.uploadTargetMode = mode;
    const modeButtons = [
      { btn: elements.btnUploadModeVocal, mode: 'vocal' },
      { btn: elements.btnUploadModeAppend, mode: 'append' },
      { btn: elements.btnUploadModeBgm, mode: 'bgm' }
    ];

    modeButtons.forEach(m => {
      if (m.btn) {
        const isActive = m.mode === mode;
        m.btn.classList.toggle('active', isActive);
      }
    });

    if (elements.dropzoneTitle) {
      if (mode === 'append') {
        elements.dropzoneTitle.textContent = 'Pilih file sound untuk disambung ke akhir audio aktif';
      } else if (mode === 'bgm') {
        elements.dropzoneTitle.textContent = 'Pilih file musik latar (BGM) untuk dimuat ke auto-ducking mixer';
      } else {
        elements.dropzoneTitle.textContent = 'Tarik & lepaskan file sound di sini, atau klik tombol';
      }
    }
  }

  async function handleAudioFileSelect(file) {
    if (!file || !window.AlurAudioEngine) return;
    try {
      showToast(`Membaca file "${file.name}"...`, 'info');
      state.audioSuite.lastUploadedFile = file;

      const ext = file.name.split('.').pop().toUpperCase();
      const mode = state.audioSuite.uploadTargetMode || 'vocal';
      let duration = 0;

      if (mode === 'append') {
        const res = await window.AlurAudioEngine.appendVoiceFromFile(file);
        duration = res.duration;
        state.audioSuite.loadedTrackName = `🎙️ Sambungan: ${file.name}`;
        updateAudioTrackDisplay(state.audioSuite.loadedTrackName, ext);
        showToast(`File "${file.name}" berhasil disambungkan! Total durasi: ${formatAudioSeconds(duration)}.`);
      } else if (mode === 'bgm') {
        const bgmBuffer = await window.AlurAudioEngine.loadBgmFromFile(file);
        duration = bgmBuffer.duration;
        showToast(`File "${file.name}" (${formatAudioSeconds(duration)}) berhasil dimuat sebagai Musik Latar (BGM)!`);
      } else {
        // Main vocal track (for mixing & mastering)
        const voiceBuffer = await window.AlurAudioEngine.loadVoiceFromFile(file);
        duration = voiceBuffer.duration;
        state.audioSuite.loadedTrackName = file.name;
        updateAudioTrackDisplay(state.audioSuite.loadedTrackName, ext);
        applyPresetToEngine('youtube_recap');
        showToast(`File sound "${file.name}" berhasil dimuat ke DSP Rack! Siap dipoles.`);
      }

      // Display Uploaded File Info Card
      if (elements.uploadedSoundInfoCard) {
        elements.uploadedSoundInfoCard.hidden = false;
        if (elements.uploadedSoundName) elements.uploadedSoundName.textContent = file.name;
        if (elements.uploadedSoundDuration) elements.uploadedSoundDuration.textContent = formatAudioSeconds(duration);
        if (elements.uploadedSoundSize) elements.uploadedSoundSize.textContent = formatBytes(file.size);
        if (elements.uploadedSoundFormat) elements.uploadedSoundFormat.textContent = ext;
        if (elements.uploadedSoundTargetBadge) {
          const targetLabels = {
            vocal: '🎙️ Track Vokal Utama',
            append: '➕ Sambungan Audio',
            bgm: '🎵 Musik Latar (BGM)'
          };
          elements.uploadedSoundTargetBadge.textContent = targetLabels[mode] || 'Track Vokal';
        }
      }

      // Auto-save uploaded sound to server & project SQLite database
      saveUploadedSoundToServer(file, duration, mode);
    } catch (err) {
      console.error(err);
      showToast(`Gagal membaca file sound: ${err.message}`, 'error');
    }
  }

  async function saveUploadedSoundToServer(file, durationSeconds, targetMode) {
    try {
      const base64Data = await fileToBase64(file);
      const projectId = state.currentProjectId || 1;

      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          base64Data: base64Data,
          filename: file.name,
          sourceType: targetMode || 'upload',
          durationSeconds: durationSeconds,
          model: 'Manual Sound Upload',
          voice: targetMode === 'bgm' ? 'BGM Musik Latar' : 'Uploaded Voice'
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(`File sound "${file.name}" tersimpan di Sound Library proyek!`, 'info');
        await fetchProjectSoundLibrary();
      }
    } catch (e) {
      console.warn('Gagal menyimpan file sound ke database:', e);
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  // --- PROJECT SOUND LIBRARY ---
  async function fetchProjectSoundLibrary() {
    if (!elements.soundLibraryList) return;

    try {
      const projectId = state.currentProjectId || 1;
      const res = await fetch(`/api/projects/${projectId}/audios`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        state.audioSuite.projectSoundsList = json.data;
        if (elements.soundLibraryCountBadge) {
          elements.soundLibraryCountBadge.textContent = `${json.data.length} sound`;
        }
        renderProjectSoundLibrary(json.data);
      }
    } catch (e) {
      console.warn('Gagal memuat sound library proyek:', e);
    }
  }

  function renderProjectSoundLibrary(list) {
    if (!elements.soundLibraryList) return;
    elements.soundLibraryList.innerHTML = '';

    if (!list || list.length === 0) {
      elements.soundLibraryList.innerHTML = `
        <div class="sound-library-empty">
          Belum ada sound tersimpan di proyek ini. Rekam mic atau unggah file sound di atas.
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'sound-library-item';

      const isMastered = item.is_mastered;
      const durText = formatAudioSeconds(item.duration_seconds || 0);
      const typeBadge = item.source_type === 'recording' ? '🎙️ Mic' : (item.source_type === 'tts' ? '🤖 TTS' : (isMastered ? '🎚️ Master' : '📁 Upload'));

      itemEl.innerHTML = `
        <div class="sound-item-meta">
          <span style="font-size: 16px;">${isMastered ? '🎚️' : (item.source_type === 'bgm' ? '🎵' : '🔊')}</span>
          <div style="min-width: 0;">
            <div class="sound-item-title" title="${item.filename}">${item.filename}</div>
            <div class="sound-item-sub">
              <span>${durText}</span>
              <span>•</span>
              <span class="badge-mini" style="font-size: 9.5px;">${typeBadge}</span>
            </div>
          </div>
        </div>
        <div class="sound-item-actions">
          <button type="button" class="btn-primary btn-xs btn-load-sound" data-url="/audio/${item.filename}" data-name="${item.filename}" title="Muat ke Rack DSP untuk mixing dan mastering">
            ⚡ Muat ke DSP
          </button>
          <button type="button" class="btn-subtle btn-xs btn-delete-sound" data-id="${item.id}" title="Hapus file ini">
            🗑️
          </button>
        </div>
      `;

      elements.soundLibraryList.appendChild(itemEl);
    });

    // Wire clicks on library action buttons
    elements.soundLibraryList.querySelectorAll('.btn-load-sound').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-url');
        const name = btn.getAttribute('data-name');
        await loadAudioTrackFromUrl(url, name);
        showToast(`Sound "${name}" berhasil dimuat ke DSP Rack!`);
      });
    });

    elements.soundLibraryList.querySelectorAll('.btn-delete-sound').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Hapus file sound ini dari database proyek?')) return;
        try {
          const res = await fetch(`/api/audio/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            showToast('File sound berhasil dihapus.');
            await fetchProjectSoundLibrary();
            await fetchProjectTtsList();
          }
        } catch (e) {
          showToast(`Gagal menghapus: ${e.message}`, 'error');
        }
      });
    });
  }

  // --- PROJECT TTS LOAD ---
  async function fetchProjectTtsList() {
    if (!elements.projectTtsSelect) return;
    elements.projectTtsSelect.innerHTML = '<option value="">-- Pilih File Suara Proyek --</option>';

    try {
      const projectId = state.currentProjectId || 1;
      const res = await fetch(`/api/projects/${projectId}/audios`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        state.audioSuite.projectTtsList = json.data;
        if (elements.badgeAudioTtsCount) elements.badgeAudioTtsCount.textContent = json.data.length;

        json.data.forEach(item => {
          const opt = document.createElement('option');
          opt.value = `/audio/${item.filename}`;
          const isMaster = item.is_mastered ? ' [MASTER]' : '';
          opt.textContent = `${item.voice || item.model || 'Voice'} (${item.duration_seconds}s) — ${item.filename}${isMaster}`;
          elements.projectTtsSelect.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('Gagal memuat list audio proyek:', e);
    }
  }

  async function handleLoadSelectedTts() {
    const url = elements.projectTtsSelect ? elements.projectTtsSelect.value : '';
    if (!url) {
      showToast('Pilih salah satu file suara TTS di dropdown.', 'error');
      return;
    }
    const selectedText = elements.projectTtsSelect.options[elements.projectTtsSelect.selectedIndex].text;
    await loadAudioTrackFromUrl(url, selectedText);
    applyPresetToEngine('tts_healer');
  }

  // --- TRANSPORT CONTROLS ---
  function handlePlayPauseAudio() {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.voiceBuffer) {
      showToast('Belum ada audio dimuat. Silakan rekam atau unggah audio.', 'error');
      return;
    }
    if (window.AlurAudioEngine.isPlaying) {
      window.AlurAudioEngine.pause();
    } else {
      window.AlurAudioEngine.play(window.AlurAudioEngine.getCurrentTime());
    }
  }

  function handleStopAudio() {
    if (!window.AlurAudioEngine) return;
    window.AlurAudioEngine.stop();
    window.AlurAudioEngine.playbackOffset = 0;
    if (elements.audioTimeCurrent) elements.audioTimeCurrent.textContent = '00:00';
    if (elements.transportPlayIcon) elements.transportPlayIcon.textContent = '▶';
    window.AlurAudioEngine.drawWaveform(elements.audioWaveformCanvas, 0);
  }

  function handleWaveformClick(e) {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.voiceBuffer || !elements.audioWaveformCanvas) return;
    const rect = elements.audioWaveformCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = pct * window.AlurAudioEngine.getDuration();
    window.AlurAudioEngine.seek(targetSeconds);
  }

  // --- AUDITION MODE (RAW VS MASTERED) ---
  function setAuditionMode(isMaster) {
    state.audioSuite.isBypassed = !isMaster;
    if (elements.btnAuditionRaw) elements.btnAuditionRaw.classList.toggle('active', !isMaster);
    if (elements.btnAuditionMaster) elements.btnAuditionMaster.classList.toggle('active', isMaster);
    if (window.AlurAudioEngine) {
      window.AlurAudioEngine.setBypass(!isMaster);
    }
    showToast(isMaster ? 'Mode Mastered DSP Aktif (Seluruh effect vokal hidup)' : 'Mode Mentah (Bypass DSP: dengarkan suara original)');
  }

  // --- PRESET SYSTEM ---
  async function fetchAudioPresetsList() {
    try {
      const res = await fetch('/api/audio/presets');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.audioSuite.customPresets = json.data;
        if (elements.badgeDbAudioPresetCount) {
          elements.badgeDbAudioPresetCount.textContent = json.data.length;
        }
        populateCustomPresetDropdown(json.data);
        renderAudioPresetsTable(json.data);
      }
    } catch (err) {
      console.warn('Gagal memuat preset audio:', err);
    }
  }

  function populateCustomPresetDropdown(presets) {
    if (!elements.customPresetSelect) return;
    elements.customPresetSelect.innerHTML = '<option value="">Pilih Preset Kustom...</option>';
    presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.preset_key;
      opt.textContent = `${p.is_system ? '★ ' : ''}${p.name}`;
      elements.customPresetSelect.appendChild(opt);
    });
  }

  function renderAudioPresetsTable(presets) {
    if (!elements.tbodyAudioPresets) return;
    elements.tbodyAudioPresets.innerHTML = '';

    presets.forEach(p => {
      const tr = document.createElement('tr');
      const isSys = Boolean(p.is_system);
      tr.innerHTML = `
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td><span class="badge-subtle">${escapeHtml(p.category || 'alur_cerita')}</span></td>
        <td style="font-size: 12px; color: var(--text-muted);">${escapeHtml(p.description || '-')}</td>
        <td><span class="${isSys ? 'badge-primary' : 'badge-neutral'}">${isSys ? 'Sistem Bawaan' : 'Kustom User'}</span></td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-subtle btn-xs btn-edit-preset" data-id="${p.id}">✏️ Edit</button>
            ${!isSys ? `<button type="button" class="btn-danger btn-xs btn-delete-preset" data-id="${p.id}">🗑️ Hapus</button>` : ''}
          </div>
        </td>
      `;
      elements.tbodyAudioPresets.appendChild(tr);
    });

    // Wire table edit/delete listeners
    elements.tbodyAudioPresets.querySelectorAll('.btn-edit-preset').forEach(btn => {
      btn.addEventListener('click', () => handleEditPresetClick(btn.dataset.id));
    });
    elements.tbodyAudioPresets.querySelectorAll('.btn-delete-preset').forEach(btn => {
      btn.addEventListener('click', () => handleDeletePresetClick(btn.dataset.id));
    });
  }

  function switchEffectSuiteTab(mode) {
    const isManual = mode === 'manual';
    if (elements.tabModeManualRack) {
      elements.tabModeManualRack.classList.toggle('active', isManual);
      elements.tabModeManualRack.setAttribute('aria-selected', String(isManual));
    }
    if (elements.tabModeQuickPresets) {
      elements.tabModeQuickPresets.classList.toggle('active', !isManual);
      elements.tabModeQuickPresets.setAttribute('aria-selected', String(!isManual));
    }
    if (elements.paneManualRack) elements.paneManualRack.hidden = !isManual;
    if (elements.paneQuickPresets) elements.paneQuickPresets.hidden = isManual;
  }

  function applyPresetToEngine(presetKey) {
    if (!presetKey) return;
    state.audioSuite.activePresetKey = presetKey;

    // Highlight button in grid
    if (elements.presetPillsGrid) {
      elements.presetPillsGrid.querySelectorAll('.preset-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetKey);
      });
    }

    // Find preset object in customPresets
    const p = state.audioSuite.customPresets.find(x => x.preset_key === presetKey);
    let settings = null;
    if (p && p.settings_json) {
      try {
        settings = typeof p.settings_json === 'string' ? JSON.parse(p.settings_json) : p.settings_json;
      } catch (e) {}
    }

    if (!settings && window.AlurAudioEngine) {
      settings = window.AlurAudioEngine.getDefaultSettings();
    }

    if (settings) {
      syncSettingsToUiKnobs(settings);
      if (window.AlurAudioEngine) {
        window.AlurAudioEngine.applySettings(settings);
      }
      if (elements.activePresetBadgeText) {
        elements.activePresetBadgeText.textContent = `Preset: ${p ? p.name : presetKey}`;
      }
      showToast(`Preset "${p ? p.name : presetKey}" diterapkan ke seluruh modul!`);
    }
  }

  function syncSettingsToUiKnobs(s) {
    if (s.highPass) {
      if (elements.chkEnableClean) elements.chkEnableClean.checked = s.highPass.enabled !== false;
      if (elements.slHighPassFreq) {
        elements.slHighPassFreq.value = s.highPass.frequency || 85;
        if (elements.valHighPassFreq) elements.valHighPassFreq.textContent = `${s.highPass.frequency || 85} Hz`;
      }
    }
    if (s.noiseGate && elements.slNoiseGate) {
      elements.slNoiseGate.value = s.noiseGate.threshold !== undefined ? s.noiseGate.threshold : -55;
      if (elements.valNoiseGate) elements.valNoiseGate.textContent = `${s.noiseGate.threshold || -55} dB`;
    }
    if (s.deEsser) {
      if (elements.chkEnableDeEsser) elements.chkEnableDeEsser.checked = s.deEsser.enabled !== false;
      if (elements.slDeEsserAmount) {
        elements.slDeEsserAmount.value = s.deEsser.amount !== undefined ? s.deEsser.amount : -6;
        if (elements.valDeEsserAmount) elements.valDeEsserAmount.textContent = `${s.deEsser.amount || -6} dB`;
      }
      if (elements.slDeEsserFreq) {
        elements.slDeEsserFreq.value = s.deEsser.frequency || 6200;
        if (elements.valDeEsserFreq) elements.valDeEsserFreq.textContent = `${((s.deEsser.frequency || 6200) / 1000).toFixed(1)} kHz`;
      }
    }
    if (s.compressor) {
      if (elements.chkEnableComp) elements.chkEnableComp.checked = s.compressor.enabled !== false;
      if (elements.slCompThreshold) {
        elements.slCompThreshold.value = s.compressor.threshold || -18;
        if (elements.valCompThreshold) elements.valCompThreshold.textContent = `${s.compressor.threshold || -18} dB`;
      }
      if (elements.slCompRatio) {
        elements.slCompRatio.value = s.compressor.ratio || 3.5;
        if (elements.valCompRatio) elements.valCompRatio.textContent = `${s.compressor.ratio || 3.5}:1`;
      }
      if (elements.slCompMakeup) {
        elements.slCompMakeup.value = s.compressor.makeupGain || 4.0;
        if (elements.valCompMakeup) elements.valCompMakeup.textContent = `+${s.compressor.makeupGain || 4.0} dB`;
      }
    }
    if (s.eq) {
      if (elements.chkEnableEq) elements.chkEnableEq.checked = s.eq.enabled !== false;
      if (elements.slEqLow) {
        elements.slEqLow.value = s.eq.lowShelfGain || 1.5;
        if (elements.valEqLow) elements.valEqLow.textContent = `${s.eq.lowShelfGain >= 0 ? '+' : ''}${s.eq.lowShelfGain || 1.5} dB`;
      }
      if (elements.slEqMid) {
        elements.slEqMid.value = s.eq.midDipGain !== undefined ? s.eq.midDipGain : -2.5;
        if (elements.valEqMid) elements.valEqMid.textContent = `${s.eq.midDipGain || -2.5} dB`;
      }
      if (elements.slEqPresence) {
        elements.slEqPresence.value = s.eq.presenceGain || 3.0;
        if (elements.valEqPresence) elements.valEqPresence.textContent = `+${s.eq.presenceGain || 3.0} dB`;
      }
      if (elements.slEqHigh) {
        elements.slEqHigh.value = s.eq.highShelfGain || 2.5;
        if (elements.valEqHigh) elements.valEqHigh.textContent = `+${s.eq.highShelfGain || 2.5} dB`;
      }
    }
    if (s.saturation) {
      if (elements.chkEnableWarmth) elements.chkEnableWarmth.checked = s.saturation.enabled !== false;
      if (elements.slTubeWarmth) {
        elements.slTubeWarmth.value = s.saturation.warmth || 25;
        if (elements.valTubeWarmth) elements.valTubeWarmth.textContent = `${s.saturation.warmth || 25}%`;
      }
    }
    if (s.ambience && elements.slStudioAmbience) {
      elements.slStudioAmbience.value = s.ambience.amount !== undefined ? s.ambience.amount : 8;
      if (elements.valStudioAmbience) elements.valStudioAmbience.textContent = `${s.ambience.amount || 8}%`;
    }
    if (s.limiter) {
      if (elements.chkEnableLimiter) elements.chkEnableLimiter.checked = s.limiter.enabled !== false;
      if (elements.slLimiterCeiling) {
        elements.slLimiterCeiling.value = s.limiter.ceiling || -1.0;
        if (elements.valLimiterCeiling) elements.valLimiterCeiling.textContent = `${(s.limiter.ceiling || -1.0).toFixed(1)} dBFS`;
      }
    }
    if (s.ducking && elements.slDuckDepth) {
      elements.slDuckDepth.value = s.ducking.duckDb || -14;
      if (elements.valDuckDepth) elements.valDuckDepth.textContent = `${s.ducking.duckDb || -14} dB`;
    }
  }

  function collectCurrentDspSettingsFromUi() {
    return {
      highPass: {
        enabled: elements.chkEnableClean ? elements.chkEnableClean.checked : true,
        frequency: elements.slHighPassFreq ? parseFloat(elements.slHighPassFreq.value) : 85
      },
      noiseGate: {
        enabled: elements.chkEnableClean ? elements.chkEnableClean.checked : true,
        threshold: elements.slNoiseGate ? parseFloat(elements.slNoiseGate.value) : -55
      },
      deEsser: {
        enabled: elements.chkEnableDeEsser ? elements.chkEnableDeEsser.checked : true,
        frequency: elements.slDeEsserFreq ? parseFloat(elements.slDeEsserFreq.value) : 6200,
        amount: elements.slDeEsserAmount ? parseFloat(elements.slDeEsserAmount.value) : -6.0
      },
      eq: {
        enabled: elements.chkEnableEq ? elements.chkEnableEq.checked : true,
        lowShelfFreq: 160,
        lowShelfGain: elements.slEqLow ? parseFloat(elements.slEqLow.value) : 1.5,
        midDipFreq: 450,
        midDipGain: elements.slEqMid ? parseFloat(elements.slEqMid.value) : -2.5,
        midDipQ: 1.4,
        presenceFreq: 3400,
        presenceGain: elements.slEqPresence ? parseFloat(elements.slEqPresence.value) : 3.0,
        presenceQ: 1.2,
        highShelfFreq: 11000,
        highShelfGain: elements.slEqHigh ? parseFloat(elements.slEqHigh.value) : 2.5
      },
      compressor: {
        enabled: elements.chkEnableComp ? elements.chkEnableComp.checked : true,
        threshold: elements.slCompThreshold ? parseFloat(elements.slCompThreshold.value) : -18,
        ratio: elements.slCompRatio ? parseFloat(elements.slCompRatio.value) : 3.5,
        attack: 0.015,
        release: 0.100,
        knee: 6,
        makeupGain: elements.slCompMakeup ? parseFloat(elements.slCompMakeup.value) : 4.0
      },
      saturation: {
        enabled: elements.chkEnableWarmth ? elements.chkEnableWarmth.checked : true,
        warmth: elements.slTubeWarmth ? parseInt(elements.slTubeWarmth.value, 10) : 25
      },
      ambience: {
        enabled: elements.chkEnableWarmth ? elements.chkEnableWarmth.checked : true,
        amount: elements.slStudioAmbience ? parseInt(elements.slStudioAmbience.value, 10) : 8
      },
      limiter: {
        enabled: elements.chkEnableLimiter ? elements.chkEnableLimiter.checked : true,
        ceiling: elements.slLimiterCeiling ? parseFloat(elements.slLimiterCeiling.value) : -1.0,
        targetLufs: -14
      },
      ducking: {
        enabled: elements.chkEnableDucking ? elements.chkEnableDucking.checked : true,
        duckDb: elements.slDuckDepth ? parseFloat(elements.slDuckDepth.value) : -14,
        attack: 0.10,
        release: 0.45
      },
      bgmVolume: elements.slBgmVolume ? parseFloat(elements.slBgmVolume.value) : 0.35,
      voiceVolume: elements.faderVoiceVol ? parseFloat(elements.faderVoiceVol.value) : 1.0
    };
  }

  function handleKnobLiveChange(fromUserInteraction = true) {
    const s = collectCurrentDspSettingsFromUi();

    // Update text labels
    if (elements.valHighPassFreq) elements.valHighPassFreq.textContent = `${s.highPass.frequency} Hz`;
    if (elements.valNoiseGate) elements.valNoiseGate.textContent = `${s.noiseGate.threshold} dB`;
    if (elements.valDeEsserAmount) elements.valDeEsserAmount.textContent = `${s.deEsser.amount} dB`;
    if (elements.valDeEsserFreq) elements.valDeEsserFreq.textContent = `${((s.deEsser.frequency || 6200) / 1000).toFixed(1)} kHz`;
    if (elements.valCompThreshold) elements.valCompThreshold.textContent = `${s.compressor.threshold} dB`;
    if (elements.valCompRatio) elements.valCompRatio.textContent = `${s.compressor.ratio}:1`;
    if (elements.valCompMakeup) elements.valCompMakeup.textContent = `+${s.compressor.makeupGain} dB`;
    if (elements.valEqLow) elements.valEqLow.textContent = `${s.eq.lowShelfGain >= 0 ? '+' : ''}${s.eq.lowShelfGain} dB`;
    if (elements.valEqMid) elements.valEqMid.textContent = `${s.eq.midDipGain} dB`;
    if (elements.valEqPresence) elements.valEqPresence.textContent = `+${s.eq.presenceGain} dB`;
    if (elements.valEqHigh) elements.valEqHigh.textContent = `+${s.eq.highShelfGain} dB`;
    if (elements.valTubeWarmth) elements.valTubeWarmth.textContent = `${s.saturation.warmth}%`;
    if (elements.valStudioAmbience) elements.valStudioAmbience.textContent = `${s.ambience.amount}%`;
    if (elements.valLimiterCeiling) elements.valLimiterCeiling.textContent = `${s.limiter.ceiling.toFixed(1)} dBFS`;
    if (elements.valBgmVolume) elements.valBgmVolume.textContent = `${Math.round(s.bgmVolume * 100)}%`;
    if (elements.valDuckDepth) elements.valDuckDepth.textContent = `${s.ducking.duckDb} dB`;
    if (elements.valVoiceVol) elements.valVoiceVol.textContent = `${Math.round(s.voiceVolume * 100)}%`;

    if (window.AlurAudioEngine) {
      window.AlurAudioEngine.applySettings(s);
    }

    if (fromUserInteraction) {
      if (elements.activePresetBadgeText) {
        elements.activePresetBadgeText.textContent = 'Kustom: Diatur Manual';
      }
      if (elements.presetPillsGrid) {
        elements.presetPillsGrid.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
      }
    }
  }

  // --- BGM TRACK MANAGEMENT ---
  async function fetchBgmList() {
    if (!elements.bgmTrackSelect) return;
    try {
      const res = await fetch('/api/audio/bgm-list');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.audioSuite.bgmList = json.data;
        const currentVal = elements.bgmTrackSelect.value;
        elements.bgmTrackSelect.innerHTML = '<option value="">(Tanpa BGM - Vokal Acapella Murni)</option>';
        json.data.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.url;
          opt.textContent = item.name;
          elements.bgmTrackSelect.appendChild(opt);
        });
        if (currentVal && elements.bgmTrackSelect.querySelector(`option[value="${currentVal}"]`)) {
          elements.bgmTrackSelect.value = currentVal;
        } else if (elements.bgmTrackSelect.options.length > 1) {
          elements.bgmTrackSelect.selectedIndex = 1;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat list BGM:', e);
    }
  }

  async function handleBgmChange() {
    const url = elements.bgmTrackSelect ? elements.bgmTrackSelect.value : '';
    if (!window.AlurAudioEngine) return;
    if (!url) {
      window.AlurAudioEngine.clearBgm();
      showToast('BGM dinonaktifkan (Vokal murni).');
      return;
    }
    try {
      showToast('Memuat musik latar BGM...', 'info');
      await window.AlurAudioEngine.loadBgmFromUrl(url);
      showToast('BGM siap dengan Auto-Ducking!');
    } catch (err) {
      console.error(err);
      showToast(`Gagal memuat BGM: ${err.message}`, 'error');
    }
  }

  async function handleUploadCustomBgm(file) {
    if (!file) return;
    try {
      showToast(`Mengunggah BGM "${file.name}"...`, 'info');
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        const res = await fetch('/api/audio/bgm/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data })
        });
        const json = await res.json();
        if (json.success) {
          showToast('BGM berhasil diunggah!');
          await fetchBgmList();
          if (elements.bgmTrackSelect) elements.bgmTrackSelect.value = json.url;
          handleBgmChange();
        } else {
          showToast(json.error || 'Gagal mengunggah BGM.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast(`Error unggah BGM: ${err.message}`, 'error');
    }
  }

  // --- MASTER EXPORT ACTIONS (WAV & MP3) ---
  function setExportFormat(fmt) {
    state.audioSuite.activeFormat = fmt;
    if (elements.btnFormatWav) elements.btnFormatWav.classList.toggle('active', fmt === 'wav');
    if (elements.btnFormatMp3) elements.btnFormatMp3.classList.toggle('active', fmt === 'mp3');
    if (elements.btnDownloadMasterText) {
      elements.btnDownloadMasterText.textContent = fmt === 'wav' ? '⬇️ Unduh Audio Master (WAV)' : '⬇️ Unduh Audio Master (MP3 320k)';
    }
  }

  async function handleDownloadMasteredAudio() {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.voiceBuffer) {
      showToast('Belum ada audio untuk di-master. Rekam atau unggah audio terlebih dahulu.', 'error');
      return;
    }

    const fmt = state.audioSuite.activeFormat || 'wav';
    const oldBtnText = elements.btnDownloadMasterText.textContent;

    try {
      elements.btnDownloadMasteredAudio.disabled = true;
      elements.btnDownloadMasterText.textContent = 'Memproses DSP & Normalizing -14 LUFS...';

      if (fmt === 'wav') {
        const wavBlob = await window.AlurAudioEngine.exportWavMaster();
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        const timestamp = Date.now();
        const safeTitle = (state.activeProjectTitle || 'alurcerita').replace(/[^a-zA-Z0-9]/g, '_');
        a.href = url;
        a.download = `master_${safeTitle}_${timestamp}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        showToast('Master Lossless WAV (16-bit PCM) berhasil diunduh!');
      } else {
        // MP3 320kbps via backend FFmpeg
        elements.btnDownloadMasterText.textContent = 'Mengonversi ke MP3 320 kbps broadcast via FFmpeg...';
        const activePreset = state.audioSuite.activePresetKey || 'Master';
        const res = await window.AlurAudioEngine.exportMp3Master(state.currentProjectId, activePreset);
        if (res && res.audio_url) {
          const a = document.createElement('a');
          a.href = res.audio_url;
          a.download = res.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast('Mastering MP3 (320 kbps) berhasil diunduh!');
        }
      }
    } catch (err) {
      console.error(err);
      showToast(`Gagal mengekspor master: ${err.message}`, 'error');
    } finally {
      elements.btnDownloadMasteredAudio.disabled = false;
      elements.btnDownloadMasterText.textContent = oldBtnText;
    }
  }

  async function handleAttachAudioToProject() {
    if (!window.AlurAudioEngine || !window.AlurAudioEngine.voiceBuffer) {
      showToast('Belum ada audio untuk dipasang ke proyek.', 'error');
      return;
    }

    try {
      showToast('Menyimpan audio master ke database proyek...', 'info');
      elements.btnAttachAudioToProject.disabled = true;

      const wavBlob = await window.AlurAudioEngine.exportWavMaster();
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = reader.result;
        const activePreset = state.audioSuite.activePresetKey || 'Custom';
        const safeTitle = (state.activeProjectTitle || 'proyek').replace(/[^a-zA-Z0-9]/g, '_');

        const res = await fetch('/api/audio/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: state.currentProjectId || 1,
            base64Data,
            filename: `master_${safeTitle}_${Date.now()}.wav`,
            sourceType: 'mastered',
            isMastered: 1,
            presetUsed: activePreset,
            durationSeconds: window.AlurAudioEngine.getDuration()
          })
        });

        const json = await res.json();
        if (json.success) {
          showToast('✅ Audio master berhasil disimpan dan dipasang ke proyek SQLite!');
          await fetchProjectTtsList();
        } else {
          showToast(json.error || 'Gagal menyimpan ke proyek.', 'error');
        }
        elements.btnAttachAudioToProject.disabled = false;
      };

      reader.readAsDataURL(wavBlob);
    } catch (err) {
      console.error(err);
      showToast(`Gagal memasang audio: ${err.message}`, 'error');
      elements.btnAttachAudioToProject.disabled = false;
    }
  }

  // --- SAVE CURRENT DSP AS NEW CUSTOM PRESET ---
  async function handleSaveCurrentAsPreset() {
    const name = prompt('Masukkan nama preset mixing & mastering baru:', 'Preset Alur Cerita Saya');
    if (!name || !name.trim()) return;

    const desc = prompt('Masukkan deskripsi karakter suara (opsional):', 'Karakter vokal khusus alur cerita YouTube');
    const settings = collectCurrentDspSettingsFromUi();

    try {
      const res = await fetch('/api/audio/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: desc ? desc.trim() : null,
          settings_json: settings,
          category: 'custom'
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Preset "${name}" berhasil disimpan ke database SQLite!`);
        await fetchAudioPresetsList();
        if (elements.customPresetSelect && json.data) {
          elements.customPresetSelect.value = json.data.preset_key;
        }
      } else {
        showToast(json.error || 'Gagal menyimpan preset.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  // --- PRESET CRUD IN DB MASTER MODAL ---
  function handleEditPresetClick(id) {
    const item = state.audioSuite.customPresets.find(x => x.id === Number(id));
    if (!item) return;

    if (elements.editPresetId) elements.editPresetId.value = item.id;
    if (elements.presetFormName) elements.presetFormName.value = item.name;
    if (elements.presetFormKey) elements.presetFormKey.value = item.preset_key;
    if (elements.presetFormDesc) elements.presetFormDesc.value = item.description || '';
    if (elements.presetFormJson) {
      elements.presetFormJson.value = typeof item.settings_json === 'string'
        ? item.settings_json
        : JSON.stringify(item.settings_json, null, 2);
    }
    if (elements.presetFormHeading) elements.presetFormHeading.textContent = `✏️ Edit Preset: ${item.name}`;
    if (elements.btnCancelPresetEdit) elements.btnCancelPresetEdit.hidden = false;
  }

  function resetPresetForm() {
    if (elements.audioPresetForm) elements.audioPresetForm.reset();
    if (elements.editPresetId) elements.editPresetId.value = '';
    if (elements.presetFormHeading) elements.presetFormHeading.textContent = '+ Tambah Preset Mixing & Mastering Baru';
    if (elements.btnCancelPresetEdit) elements.btnCancelPresetEdit.hidden = true;
  }

  async function handleSavePresetFormSubmit(e) {
    e.preventDefault();
    const id = elements.editPresetId ? elements.editPresetId.value : '';
    const name = elements.presetFormName ? elements.presetFormName.value.trim() : '';
    const key = elements.presetFormKey ? elements.presetFormKey.value.trim() : '';
    const desc = elements.presetFormDesc ? elements.presetFormDesc.value.trim() : '';
    const jsonStr = elements.presetFormJson ? elements.presetFormJson.value.trim() : '';

    if (!name) {
      showToast('Nama preset wajib diisi.', 'error');
      return;
    }

    let parsedSettings = null;
    if (jsonStr) {
      try {
        parsedSettings = JSON.parse(jsonStr);
      } catch (err) {
        showToast('Format JSON parameter DSP tidak valid.', 'error');
        return;
      }
    } else {
      parsedSettings = collectCurrentDspSettingsFromUi();
    }

    const payload = {
      name,
      preset_key: key || undefined,
      description: desc,
      settings_json: parsedSettings,
      category: 'custom'
    };

    try {
      const url = id ? `/api/audio/presets/${id}` : '/api/audio/presets';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast(id ? 'Preset berhasil diperbarui!' : 'Preset berhasil ditambahkan ke SQLite!');
        resetPresetForm();
        await fetchAudioPresetsList();
      } else {
        showToast(json.error || 'Gagal menyimpan preset.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  async function handleDeletePresetClick(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus preset kustom ini?')) return;
    try {
      const res = await fetch(`/api/audio/presets/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Preset berhasil dihapus.');
        await fetchAudioPresetsList();
      } else {
        showToast(json.error || 'Gagal menghapus preset.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  async function handleResetDefaultAudioPresets() {
    if (!confirm('Pulihkan 6 preset sistem bawaan Alur Cerita?')) return;
    try {
      // Re-seed defaults via backend or refresh
      await fetchAudioPresetsList();
      showToast('6 preset sistem bawaan aktif dan siap digunakan!');
    } catch (e) {}
  }

  // =========================================================================
  // MEDIA STUDIO & FAIR-USE VIDEO SLICER (3s/10s) + FILE MANAGER CRUD
  // =========================================================================

  function formatDuration(sec) {
    if (!sec || isNaN(sec) || sec <= 0) return '00:00';
    const totalSec = Math.round(sec);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDateShort(iso) {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  // Subnav switcher: Slicer vs AI Cut vs File Manager
  function switchMediaTab(tabName) {
    if (tabName === 'slicer') {
      if (elements.tabMediaSlicer) elements.tabMediaSlicer.classList.add('active');
      if (elements.tabMediaAiCut) elements.tabMediaAiCut.classList.remove('active');
      if (elements.tabMediaFiles) elements.tabMediaFiles.classList.remove('active');
      if (elements.mediaSlicerSection) elements.mediaSlicerSection.hidden = false;
      if (elements.mediaAiCutSection) elements.mediaAiCutSection.hidden = true;
      if (elements.mediaFilesSection) elements.mediaFilesSection.hidden = true;
    } else if (tabName === 'aicut') {
      if (elements.tabMediaAiCut) elements.tabMediaAiCut.classList.add('active');
      if (elements.tabMediaSlicer) elements.tabMediaSlicer.classList.remove('active');
      if (elements.tabMediaFiles) elements.tabMediaFiles.classList.remove('active');
      if (elements.mediaAiCutSection) elements.mediaAiCutSection.hidden = false;
      if (elements.mediaSlicerSection) elements.mediaSlicerSection.hidden = true;
      if (elements.mediaFilesSection) elements.mediaFilesSection.hidden = true;
      populateAiCutVideoDropdown();
    } else {
      if (elements.tabMediaFiles) elements.tabMediaFiles.classList.add('active');
      if (elements.tabMediaSlicer) elements.tabMediaSlicer.classList.remove('active');
      if (elements.tabMediaAiCut) elements.tabMediaAiCut.classList.remove('active');
      if (elements.mediaFilesSection) elements.mediaFilesSection.hidden = false;
      if (elements.mediaSlicerSection) elements.mediaSlicerSection.hidden = true;
      if (elements.mediaAiCutSection) elements.mediaAiCutSection.hidden = true;
      fetchMediaList();
    }
  }

  // Update real-time formula banner calculations
  function updateSlicerFormulaText() {
    const keep = parseFloat(elements.inputKeepSeconds ? elements.inputKeepSeconds.value : 3) || 3;
    const skip = parseFloat(elements.inputSkipSeconds ? elements.inputSkipSeconds.value : 10) || 10;
    const period = keep + skip;
    const pct = Math.round((skip / period) * 100);

    if (elements.chipKeepVal) elements.chipKeepVal.textContent = `${keep} Detik`;
    if (elements.chipSkipVal) elements.chipSkipVal.textContent = `${skip} Detik`;

    if (elements.formulaSummaryTitle) {
      elements.formulaSummaryTitle.textContent = `Pola Siklus: Ambil ${keep}s lalu Buang ${skip}s (Tiap ${period}s)`;
    }

    let estText = `Dari video 10 menit, hasil potongan otomatis menjadi ~${formatDuration(600 * (keep / period))} (-${pct}% footage dipangkas).`;
    if (state.selectedSlicerMedia && state.selectedSlicerMedia.duration_seconds > 0) {
      const origDur = state.selectedSlicerMedia.duration_seconds;
      const slicedDur = origDur * (keep / period);
      estText = `Video sumber "${state.selectedSlicerMedia.original_name}" (${formatDuration(origDur)}) akan dipangkas menjadi ~${formatDuration(slicedDur)} (-${pct}% footage mentah).`;
    }
    if (elements.formulaSummaryDesc) elements.formulaSummaryDesc.textContent = estText;
  }

  // Switch between selecting from manager or uploading new file
  function switchSlicerSourceMode(mode) {
    state.slicerSourceMode = mode;
    if (mode === 'manager') {
      if (elements.btnSourceFromManager) elements.btnSourceFromManager.classList.add('active');
      if (elements.btnSourceFromUpload) elements.btnSourceFromUpload.classList.remove('active');
      if (elements.boxSourceFromManager) elements.boxSourceFromManager.hidden = false;
      if (elements.boxSourceFromUpload) elements.boxSourceFromUpload.hidden = true;
    } else {
      if (elements.btnSourceFromUpload) elements.btnSourceFromUpload.classList.add('active');
      if (elements.btnSourceFromManager) elements.btnSourceFromManager.classList.remove('active');
      if (elements.boxSourceFromUpload) elements.boxSourceFromUpload.hidden = false;
      if (elements.boxSourceFromManager) elements.boxSourceFromManager.hidden = true;
    }
  }

  // Populate slicer dropdown from available videos in SQLite
  function populateSlicerVideoDropdown() {
    if (!elements.slicerSelectVideo) return;
    const videos = state.mediaItems.filter(m => m.file_type === 'video');
    elements.slicerSelectVideo.innerHTML = '<option value="">-- Pilih video dari daftar (' + videos.length + ' video) --</option>';
    videos.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      const durStr = v.duration_seconds > 0 ? ` (${formatDuration(v.duration_seconds)})` : '';
      const catBadge = v.category === 'footage_sliced' ? ' [✂️ Sliced]' : ' [Raw]';
      opt.textContent = `${v.original_name}${durStr}${catBadge}`;
      elements.slicerSelectVideo.appendChild(opt);
    });

    if (state.selectedSlicerMedia) {
      elements.slicerSelectVideo.value = state.selectedSlicerMedia.id;
    }
  }

  // Set selected video for slicing
  function selectSlicerMediaItem(item) {
    state.selectedSlicerMedia = item;
    state.selectedSlicerFile = null;
    if (elements.slicerSelectedPill) elements.slicerSelectedPill.hidden = false;
    if (elements.slicerSelectedTitle) elements.slicerSelectedTitle.textContent = item.original_name;
    if (elements.slicerSelectedMeta) {
      elements.slicerSelectedMeta.textContent = `Durasi: ${formatDuration(item.duration_seconds)} • ${item.resolution || 'HD'} • ${formatBytes(item.file_size)}`;
    }
    updateSlicerFormulaText();

    // If no sliced video is loaded in player, show raw video in player
    if (!state.slicedResultMedia && elements.slicerPreviewVideo) {
      elements.slicerPreviewVideo.src = item.file_url;
      if (elements.playerEmptyPlaceholder) elements.playerEmptyPlaceholder.classList.add('hidden');
      if (elements.badgePreviewMode) elements.badgePreviewMode.textContent = 'Video Asli Mentah';
    }
  }

  // Set directly uploaded file for slicing
  function selectSlicerFileDirect(file) {
    state.selectedSlicerFile = file;
    state.selectedSlicerMedia = null;
    if (elements.slicerSelectedPill) elements.slicerSelectedPill.hidden = false;
    if (elements.slicerSelectedTitle) elements.slicerSelectedTitle.textContent = file.name;
    if (elements.slicerSelectedMeta) {
      elements.slicerSelectedMeta.textContent = `File Lokal: ${formatBytes(file.size)} • Siap dipotong`;
    }
    updateSlicerFormulaText();

    // Local object URL for immediate player preview
    if (elements.slicerPreviewVideo) {
      elements.slicerPreviewVideo.src = URL.createObjectURL(file);
      if (elements.playerEmptyPlaceholder) elements.playerEmptyPlaceholder.classList.add('hidden');
      if (elements.badgePreviewMode) elements.badgePreviewMode.textContent = 'Video Lokal (Pratinjau)';
    }
  }

  function clearSlicerSelectedMedia() {
    state.selectedSlicerMedia = null;
    state.selectedSlicerFile = null;
    if (elements.slicerSelectedPill) elements.slicerSelectedPill.hidden = true;
    if (elements.slicerSelectVideo) elements.slicerSelectVideo.value = '';
    updateSlicerFormulaText();
  }

  // Execute FFmpeg Slicing Process ("Ambil 3s, Buang 10s")
  async function startVideoSlicing() {
    if (!state.selectedSlicerMedia && !state.selectedSlicerFile) {
      showToast('Silakan pilih video dari File Manager atau unggah file video terlebih dahulu.', 'error');
      return;
    }

    const keepSeconds = parseFloat(elements.inputKeepSeconds ? elements.inputKeepSeconds.value : 3) || 3;
    const skipSeconds = parseFloat(elements.inputSkipSeconds ? elements.inputSkipSeconds.value : 10) || 10;
    const muteAudio = elements.checkMuteAudio ? elements.checkMuteAudio.checked : true;
    const mirror = elements.checkMirrorVideo ? elements.checkMirrorVideo.checked : false;
    const speed = parseFloat(elements.selectVideoSpeed ? elements.selectVideoSpeed.value : 1.0) || 1.0;
    const customName = elements.inputCustomOutputName ? elements.inputCustomOutputName.value.trim() : '';

    const formData = new FormData();
    formData.append('keepSeconds', keepSeconds);
    formData.append('skipSeconds', skipSeconds);
    formData.append('muteAudio', muteAudio);
    formData.append('mirror', mirror);
    formData.append('speed', speed);
    formData.append('projectId', state.currentProjectId || 0);
    if (customName) formData.append('customName', customName);

    if (state.selectedSlicerFile) {
      formData.append('file', state.selectedSlicerFile);
    } else if (state.selectedSlicerMedia) {
      formData.append('mediaId', state.selectedSlicerMedia.id);
    }

    // UI Loading state
    if (elements.btnStartSlicing) elements.btnStartSlicing.disabled = true;
    if (elements.btnStartSlicingText) elements.btnStartSlicingText.textContent = '⏳ Sedang Memotong Video (FFmpeg)...';
    if (elements.slicerProgressContainer) elements.slicerProgressContainer.hidden = false;
    if (elements.slicerProgressStatus) {
      elements.slicerProgressStatus.textContent = `Memproses siklus: Ambil ${keepSeconds}s, Buang ${skipSeconds}s... Mohon tunggu.`;
    }

    try {
      const res = await fetch('/api/media/slice-video', {
        method: 'POST',
        body: formData
      });
      let json = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        throw new Error(`Server (${res.status}): Respons server tidak valid atau ukuran file video melebihi batas upload.`);
      }

      if (json.success && json.data) {
        state.slicedResultMedia = json.data;
        showToast(json.message || 'Video berhasil dipotong secara berkala!');

        // Update Video Player with sliced result
        if (elements.slicerPreviewVideo) {
          elements.slicerPreviewVideo.src = json.data.file_url;
          elements.slicerPreviewVideo.load();
          elements.slicerPreviewVideo.play().catch(() => {});
        }
        if (elements.playerEmptyPlaceholder) elements.playerEmptyPlaceholder.classList.add('hidden');
        if (elements.badgePreviewMode) elements.badgePreviewMode.textContent = 'Hasil Potongan (Montage)';

        // Update Result Comparison Metrics Card
        if (elements.slicingResultStats) elements.slicingResultStats.hidden = false;
        if (elements.statSourceDuration) {
          elements.statSourceDuration.textContent = formatDuration(json.summary.source_duration);
        }
        if (elements.statSlicedDuration) {
          elements.statSlicedDuration.textContent = formatDuration(json.summary.sliced_duration);
        }
        if (elements.statSavedPercent) {
          elements.statSavedPercent.textContent = `-${json.summary.time_saved_percent}%`;
        }
        if (elements.statResolutionSize) {
          elements.statResolutionSize.textContent = `${json.data.resolution || '1080p'} • ${formatBytes(json.data.file_size)}`;
        }

        // Enable footer action links
        if (elements.previewFooterActions) elements.previewFooterActions.hidden = false;
        if (elements.btnDownloadSlicedVideo) {
          elements.btnDownloadSlicedVideo.href = json.data.file_url;
          elements.btnDownloadSlicedVideo.download = json.data.filename;
        }

        // Refresh media list and stats in background
        fetchMediaList();
        fetchMediaStats();
      } else {
        showToast(json.error || 'Gagal memotong video.', 'error');
      }
    } catch (err) {
      console.error('Error slicing video:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (elements.btnStartSlicing) elements.btnStartSlicing.disabled = false;
      if (elements.btnStartSlicingText) elements.btnStartSlicingText.textContent = '🎬 Mulai Potong Video (FFmpeg Slicer)';
      if (elements.slicerProgressContainer) elements.slicerProgressContainer.hidden = true;
    }
  }

  // Toggle video player between Sliced result and Raw source
  function togglePreviewSource() {
    if (!elements.slicerPreviewVideo) return;
    if (state.previewModeSource === 'sliced') {
      // Switch to raw
      if (state.selectedSlicerMedia && state.selectedSlicerMedia.file_url) {
        state.previewModeSource = 'raw';
        elements.slicerPreviewVideo.src = state.selectedSlicerMedia.file_url;
        elements.slicerPreviewVideo.load();
        if (elements.badgePreviewMode) elements.badgePreviewMode.textContent = 'Video Asli Mentah';
        if (elements.btnTogglePreviewSource) elements.btnTogglePreviewSource.textContent = '🔄 Lihat Hasil Potongan';
      } else {
        showToast('Tidak ada video asli mentah yang tersimpan.');
      }
    } else {
      // Switch back to sliced
      if (state.slicedResultMedia && state.slicedResultMedia.file_url) {
        state.previewModeSource = 'sliced';
        elements.slicerPreviewVideo.src = state.slicedResultMedia.file_url;
        elements.slicerPreviewVideo.load();
        if (elements.badgePreviewMode) elements.badgePreviewMode.textContent = 'Hasil Potongan (Montage)';
        if (elements.btnTogglePreviewSource) elements.btnTogglePreviewSource.textContent = '🔄 Lihat Video Mentah';
      }
    }
  }

  // --- File Manager Media CRUD Methods ---

  async function fetchMediaList() {
    try {
      const res = await fetch(`/api/media?projectId=${state.currentProjectId || 0}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.mediaItems = json.data;
        populateSlicerVideoDropdown();
        populateAiCutVideoDropdown();
        renderMediaItems();
      }
    } catch (err) {
      console.error('Error fetching media list:', err);
    }
  }

  async function fetchMediaStats() {
    try {
      const res = await fetch(`/api/media/stats?projectId=${state.currentProjectId || 0}`);
      const json = await res.json();
      if (json.success && json.data) {
        state.mediaStats = json.data;
        const s = json.data;
        if (elements.fmTotalFiles) elements.fmTotalFiles.textContent = s.total_files || 0;
        if (elements.fmVideoRawCount) elements.fmVideoRawCount.textContent = (s.video_count - s.sliced_count) || 0;
        if (elements.fmVideoSlicedCount) elements.fmVideoSlicedCount.textContent = s.sliced_count || 0;
        if (elements.fmAudioCount) elements.fmAudioCount.textContent = s.audio_count || 0;
        if (elements.fmTotalStorageSize) elements.fmTotalStorageSize.textContent = formatBytes(s.total_size_bytes);

        if (elements.mediaStatsSummaryText) {
          elements.mediaStatsSummaryText.textContent = `${s.total_files || 0} File • ${s.video_count || 0} Video • ${s.audio_count || 0} Audio • ${formatBytes(s.total_size_bytes)}`;
        }
      }
    } catch (err) {
      console.error('Error fetching media stats:', err);
    }
  }

  // Render media cards (Grid) and rows (Table)
  function renderMediaItems() {
    let items = state.mediaItems || [];

    // Filter by Category
    if (state.fmFilter !== 'all') {
      if (state.fmFilter === 'footage_raw') {
        items = items.filter(m => m.category === 'raw_footage' || (m.file_type === 'video' && m.category !== 'footage_sliced'));
      } else if (state.fmFilter === 'footage_sliced') {
        items = items.filter(m => m.category === 'footage_sliced');
      } else if (state.fmFilter === 'audio_voiceover') {
        items = items.filter(m => m.category === 'voiceover' || m.category === 'audio_voiceover' || (m.file_type === 'audio' && m.category !== 'bgm' && m.category !== 'audio_bgm'));
      } else if (state.fmFilter === 'audio_bgm') {
        items = items.filter(m => m.category === 'bgm' || m.category === 'audio_bgm');
      }
    }

    // Filter by Search Query
    if (state.fmSearch && state.fmSearch.trim()) {
      const term = state.fmSearch.toLowerCase().trim();
      items = items.filter(m =>
        (m.original_name && m.original_name.toLowerCase().includes(term)) ||
        (m.tags && m.tags.toLowerCase().includes(term)) ||
        (m.notes && m.notes.toLowerCase().includes(term))
      );
    }

    // Toggle Empty State
    if (items.length === 0) {
      if (elements.fmEmptyState) elements.fmEmptyState.hidden = false;
      if (elements.fmMediaGrid) elements.fmMediaGrid.innerHTML = '';
      if (elements.fmMediaTableBody) elements.fmMediaTableBody.innerHTML = '';
      return;
    } else {
      if (elements.fmEmptyState) elements.fmEmptyState.hidden = true;
    }

    // Render Grid Cards
    if (elements.fmMediaGrid) {
      elements.fmMediaGrid.innerHTML = '';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'media-file-card';

        const isVideo = item.file_type === 'video';
        const isSliced = item.category === 'footage_sliced';
        let badgeClass = 'badge-raw';
        let badgeLabel = 'Video Raw';
        if (isSliced) {
          badgeClass = 'badge-sliced';
          badgeLabel = '✂️ Sliced 3s/10s';
        } else if (item.category === 'bgm' || item.category === 'audio_bgm') {
          badgeClass = 'badge-bgm';
          badgeLabel = '🎵 BGM';
        } else if (!isVideo) {
          badgeClass = 'badge-voiceover';
          badgeLabel = '🎙️ Voiceover';
        }

        card.innerHTML = `
          <div class="media-card-preview" data-id="${item.id}">
            ${isVideo
              ? `<video src="${item.file_url}#t=0.5" preload="metadata" muted playsinline></video>`
              : `<div class="audio-wave-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  <span>Audio Track</span>
                 </div>`
            }
            <div class="play-hover-btn" title="Klik untuk memutar pratinjau">
              <svg style="width: 20px; height: 20px; margin-left: 2px;" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <span class="type-chip ${badgeClass}">${badgeLabel}</span>
            <span class="duration-chip">${formatDuration(item.duration_seconds)}</span>
          </div>
          <div class="media-card-content">
            <h4 class="media-card-title" title="${escapeHtml(item.original_name)}">${escapeHtml(item.original_name)}</h4>
            <div class="media-card-meta">
              <span>${item.resolution || (isVideo ? 'HD' : 'Audio')}</span>
              <span>•</span>
              <span>${formatBytes(item.file_size)}</span>
              <span>•</span>
              <span>${formatDateShort(item.created_at)}</span>
            </div>
            ${item.notes ? `<p class="media-card-notes">${escapeHtml(item.notes)}</p>` : ''}
          </div>
          <div class="media-card-actions">
            <div class="actions-left">
              ${isVideo ? `
                <button type="button" class="btn-subtle btn-xs btn-card-slice" data-id="${item.id}" title="Kirim video ini ke Slicer 3s/10s">
                  ✂️ Potong
                </button>
                <button type="button" class="btn-subtle btn-xs btn-card-aicut" data-id="${item.id}" title="Analisis subtitle & potong scene dengan AI">
                  🤖 AI Cut
                </button>
              ` : ''}
              <button type="button" class="btn-subtle btn-xs btn-card-edit" data-id="${item.id}" title="Edit metadata & nama">
                ✏️ Edit
              </button>
            </div>
            <div class="actions-right">
              <a href="${item.file_url}" download="${item.filename}" class="btn-subtle btn-xs" title="Unduh file">
                ⬇️
              </a>
              <button type="button" class="btn-subtle btn-xs btn-card-delete" data-id="${item.id}" data-name="${escapeHtml(item.original_name)}" title="Hapus file permanen" style="color: #DC2626;">
                🗑️
              </button>
            </div>
          </div>
        `;

        // Card Preview click
        card.querySelector('.media-card-preview').addEventListener('click', () => openMediaPreviewModal(item));

        // Slice button click
        const btnSlice = card.querySelector('.btn-card-slice');
        if (btnSlice) {
          btnSlice.addEventListener('click', (e) => {
            e.stopPropagation();
            sendMediaToSlicer(item);
          });
        }

        // AI Cut button click
        const btnAiCut = card.querySelector('.btn-card-aicut');
        if (btnAiCut) {
          btnAiCut.addEventListener('click', (e) => {
            e.stopPropagation();
            sendMediaToAiCut(item);
          });
        }

        // Edit button click
        const btnEdit = card.querySelector('.btn-card-edit');
        if (btnEdit) {
          btnEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            openMediaEditModal(item);
          });
        }

        // Delete button click
        const btnDelete = card.querySelector('.btn-card-delete');
        if (btnDelete) {
          btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMediaItem(item.id, item.original_name);
          });
        }

        elements.fmMediaGrid.appendChild(card);
      });
    }

    // Render Table Rows
    if (elements.fmMediaTableBody) {
      elements.fmMediaTableBody.innerHTML = '';
      items.forEach(item => {
        const tr = document.createElement('tr');
        const isVideo = item.file_type === 'video';
        const isSliced = item.category === 'footage_sliced';

        tr.innerHTML = `
          <td>${isVideo ? (isSliced ? '✂️' : '🎬') : '🎙️'}</td>
          <td><strong>${escapeHtml(item.original_name)}</strong></td>
          <td><span class="badge ${isSliced ? 'badge-success' : 'badge-subtle'}">${item.category}</span></td>
          <td>${formatDuration(item.duration_seconds)}</td>
          <td>${item.resolution || '-'}</td>
          <td>${formatBytes(item.file_size)}</td>
          <td>${formatDateShort(item.created_at)}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 4px;">
              <button type="button" class="btn-subtle btn-xs btn-table-play" title="Putar">▶️</button>
              ${isVideo ? `
                <button type="button" class="btn-subtle btn-xs btn-table-slice" title="Potong Fair-Use">✂️</button>
                <button type="button" class="btn-subtle btn-xs btn-table-aicut" title="AI Cut Scene (SRT)">🤖</button>
              ` : ''}
              <button type="button" class="btn-subtle btn-xs btn-table-edit" title="Edit">✏️</button>
              <a href="${item.file_url}" download class="btn-subtle btn-xs" title="Unduh">⬇️</a>
              <button type="button" class="btn-subtle btn-xs btn-table-del" title="Hapus" style="color: #DC2626;">🗑️</button>
            </div>
          </td>
        `;

        tr.querySelector('.btn-table-play').addEventListener('click', () => openMediaPreviewModal(item));
        const btnSlice = tr.querySelector('.btn-table-slice');
        if (btnSlice) btnSlice.addEventListener('click', () => sendMediaToSlicer(item));
        const btnAiCut = tr.querySelector('.btn-table-aicut');
        if (btnAiCut) btnAiCut.addEventListener('click', () => sendMediaToAiCut(item));
        tr.querySelector('.btn-table-edit').addEventListener('click', () => openMediaEditModal(item));
        tr.querySelector('.btn-table-del').addEventListener('click', () => deleteMediaItem(item.id, item.original_name));

        elements.fmMediaTableBody.appendChild(tr);
      });
    }
  }

  // Send video directly to slicer tab
  function sendMediaToSlicer(item) {
    switchMediaTab('slicer');
    switchSlicerSourceMode('manager');
    selectSlicerMediaItem(item);
    if (elements.slicerSelectVideo) elements.slicerSelectVideo.value = item.id;
    showToast(`Video "${item.original_name}" berhasil dimuat ke Slicer Fair-Use!`);
  }

  // Send video directly to AI Cut tab
  function sendMediaToAiCut(item) {
    switchMediaTab('aicut');
    selectAiCutVideo(item);
    if (elements.aiCutSelectVideo) elements.aiCutSelectVideo.value = item.id;
    showToast(`Video "${item.original_name}" berhasil dimuat ke AI Cut Scene!`);
  }

  // --- AI Smart Cut Scene (SRT) Methods ---

  // Populate AI Cut video dropdown from available video records in SQLite
  function populateAiCutVideoDropdown() {
    if (!elements.aiCutSelectVideo) return;
    const videos = state.mediaItems.filter(m => m.file_type === 'video');
    elements.aiCutSelectVideo.innerHTML = '<option value="">-- Pilih video film sumber (' + videos.length + ' video) --</option>';
    videos.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      const durStr = v.duration_seconds > 0 ? ` (${formatDuration(v.duration_seconds)})` : '';
      const catBadge = v.category === 'cut_scene' ? ' [🤖 Cut Scene]' : (v.category === 'footage_sliced' ? ' [✂️ Sliced]' : ' [Raw]');
      opt.textContent = `${v.original_name}${durStr}${catBadge}`;
      elements.aiCutSelectVideo.appendChild(opt);
    });

    if (state.aiCutSelectedMedia) {
      elements.aiCutSelectVideo.value = state.aiCutSelectedMedia.id;
    }
  }

  // Set selected video for AI Cut
  function selectAiCutVideo(item) {
    state.aiCutSelectedMedia = item;
    if (elements.aiCutSelectedVideoPill) elements.aiCutSelectedVideoPill.hidden = false;
    if (elements.aiCutSelectedVideoTitle) elements.aiCutSelectedVideoTitle.textContent = item.original_name;
    if (elements.aiCutSelectedVideoMeta) {
      elements.aiCutSelectedVideoMeta.textContent = `Durasi: ${formatDuration(item.duration_seconds)} • ${item.resolution || 'HD'} • ${formatBytes(item.file_size)}`;
    }

    if (elements.aiCutPreviewVideo) {
      elements.aiCutPreviewVideo.src = item.file_url;
      if (elements.aiCutPlayerPlaceholder) elements.aiCutPlayerPlaceholder.classList.add('hidden');
    }
  }

  function clearAiCutSelectedVideo() {
    state.aiCutSelectedMedia = null;
    if (elements.aiCutSelectedVideoPill) elements.aiCutSelectedVideoPill.hidden = true;
    if (elements.aiCutSelectVideo) elements.aiCutSelectVideo.value = '';
    if (elements.aiCutPreviewVideo) elements.aiCutPreviewVideo.removeAttribute('src');
    if (elements.aiCutPlayerPlaceholder) elements.aiCutPlayerPlaceholder.classList.remove('hidden');
  }

  // Handle SRT / VTT subtitle file upload
  function handleAiSrtFileSelect(file) {
    if (!file) return;
    state.aiCutSrtFile = file;
    if (elements.aiCutSrtMainText) elements.aiCutSrtMainText.textContent = `📄 ${file.name}`;
    if (elements.aiCutSrtSubText) elements.aiCutSrtSubText.textContent = `Ukuran: ${formatBytes(file.size)} • Siap dianalisis`;
    showToast(`File subtitle "${file.name}" berhasil dimuat!`);
  }

  // Extract embedded subtitles from the video file itself using backend FFmpeg
  async function extractEmbeddedSubsFromVideo() {
    if (!state.aiCutSelectedMedia) {
      showToast('Pilih video film sumber di atas terlebih dahulu!', 'warning');
      return;
    }

    try {
      showToast('Memeriksa subtitle internal (embedded stream) di file video...');
      const formData = new FormData();
      formData.append('mediaId', state.aiCutSelectedMedia.id);

      if (elements.aiCutAnalysisProgress) {
        elements.aiCutAnalysisProgress.hidden = false;
        if (elements.aiCutAnalysisStatusText) elements.aiCutAnalysisStatusText.textContent = 'Mengekstrak track subtitle internal dari file video via FFmpeg...';
      }

      const res = await fetch('/api/media/ai-analyze-srt', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (elements.aiCutAnalysisProgress) elements.aiCutAnalysisProgress.hidden = true;

      if (!res.ok || !data.success) {
        showToast(data.error || 'Video tidak memiliki subtitle internal (.srt). Silakan unggah file .srt terpisah.', 'warning');
        return;
      }

      handleAiAnalysisResult(data.data);
    } catch (err) {
      if (elements.aiCutAnalysisProgress) elements.aiCutAnalysisProgress.hidden = true;
      console.error('Error extracting embedded subs:', err);
      showToast('Gagal memeriksa subtitle video: ' + err.message, 'error');
    }
  }

  // Run AI Gemini analysis on subtitle
  async function runAiSrtAnalysis() {
    const srtText = elements.aiCutSrtTextArea ? elements.aiCutSrtTextArea.value.trim() : '';
    if (!state.aiCutSrtFile && !srtText && !state.aiCutSelectedMedia) {
      showToast('Silakan unggah file .SRT atau tempelkan teks dialog subtitle terlebih dahulu!', 'warning');
      return;
    }

    const focusHint = elements.aiCutFocusHint ? elements.aiCutFocusHint.value.trim() : '';
    const maxClips = elements.aiCutMaxClips ? elements.aiCutMaxClips.value : 8;
    const movieTitle = state.aiCutSelectedMedia ? state.aiCutSelectedMedia.original_name : (state.currentProject ? state.currentProject.title : 'Film');

    const formData = new FormData();
    if (state.aiCutSrtFile) {
      formData.append('file', state.aiCutSrtFile);
    }
    if (srtText) {
      formData.append('srtText', srtText);
    }
    if (state.aiCutSelectedMedia) {
      formData.append('mediaId', state.aiCutSelectedMedia.id);
    }
    formData.append('movieTitle', movieTitle);
    formData.append('focusHint', focusHint);
    formData.append('maxClips', maxClips);

    if (elements.btnRunAiSrtAnalysis) elements.btnRunAiSrtAnalysis.disabled = true;
    if (elements.aiCutAnalysisProgress) elements.aiCutAnalysisProgress.hidden = false;
    if (elements.aiCutAnalysisStatusText) {
      elements.aiCutAnalysisStatusText.textContent = 'Gemini sedang membaca dialog, menganalisis bobot dramatis, dan menyusun timestamp adegan...';
    }

    try {
      const res = await fetch('/api/media/ai-analyze-srt', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis subtitle dengan AI Gemini.');
      }

      handleAiAnalysisResult(data.data);
      showToast(`Sukses! ${data.data.scenes.length} adegan kunci terdeteksi dan siap dipotong.`);
    } catch (err) {
      console.error('Error analyzing subtitle:', err);
      showToast('Analisis gagal: ' + err.message, 'error');
    } finally {
      if (elements.btnRunAiSrtAnalysis) elements.btnRunAiSrtAnalysis.disabled = false;
      if (elements.aiCutAnalysisProgress) elements.aiCutAnalysisProgress.hidden = true;
    }
  }

  // Handle successful AI Gemini analysis data
  function handleAiAnalysisResult(aiResult) {
    if (!aiResult || !Array.isArray(aiResult.scenes)) return;

    state.aiCuratedScenes = aiResult.scenes;
    state.aiSelectedClipIndices = new Set(aiResult.scenes.map((_, i) => i));

    if (elements.aiGeminiSummaryBox) elements.aiGeminiSummaryBox.hidden = false;
    if (elements.aiGeminiSummaryText) {
      elements.aiGeminiSummaryText.textContent = aiResult.summary || 'Koleksi dialog dan adegan kunci dengan intensitas dramatis tinggi telah dikurasi oleh Gemini.';
    }

    if (elements.badgeAiClipsCount) {
      elements.badgeAiClipsCount.hidden = false;
      elements.badgeAiClipsCount.textContent = `${aiResult.scenes.length} Adegan Terdeteksi`;
    }

    if (elements.btnSelectAllAiClips) {
      elements.btnSelectAllAiClips.hidden = false;
      elements.btnSelectAllAiClips.textContent = 'Batal Pilih Semua';
    }

    if (elements.boxAiBatchCutControls) elements.boxAiBatchCutControls.hidden = false;
    updateAiSelectedCount();
    renderAiScenesList();
  }

  // Update selected count display
  function updateAiSelectedCount() {
    const count = state.aiSelectedClipIndices.size;
    if (elements.aiSelectedCountDisplay) elements.aiSelectedCountDisplay.textContent = count;
    if (elements.btnExecuteAiBatchCut) {
      elements.btnExecuteAiBatchCut.disabled = (count === 0 || !state.aiCutSelectedMedia);
    }
  }

  // Toggle selection of all scenes
  function toggleSelectAllAiScenes() {
    if (state.aiSelectedClipIndices.size === state.aiCuratedScenes.length) {
      state.aiSelectedClipIndices.clear();
      if (elements.btnSelectAllAiClips) elements.btnSelectAllAiClips.textContent = 'Pilih Semua';
    } else {
      state.aiSelectedClipIndices = new Set(state.aiCuratedScenes.map((_, i) => i));
      if (elements.btnSelectAllAiClips) elements.btnSelectAllAiClips.textContent = 'Batal Pilih Semua';
    }
    updateAiSelectedCount();
    renderAiScenesList();
  }

  // Render cards for each AI detected scene
  function renderAiScenesList() {
    if (!elements.aiScenesContainer) return;
    elements.aiScenesContainer.innerHTML = '';

    if (!state.aiCuratedScenes || state.aiCuratedScenes.length === 0) {
      elements.aiScenesContainer.innerHTML = `
        <div class="fm-empty-state" style="padding: 30px 16px;">
          <div class="empty-icon">🎬</div>
          <h4 style="margin: 0; font-size: 14px; color: #1E293B;">Belum Ada Analisis Subtitle</h4>
          <p style="margin: 0; font-size: 12px; color: #64748B;">Pilih video, unggah file subtitle .SRT di sebelah kiri, lalu klik "Analisis Adegan Kunci dengan AI Gemini".</p>
        </div>
      `;
      return;
    }

    state.aiCuratedScenes.forEach((scene, index) => {
      const isSelected = state.aiSelectedClipIndices.has(index);
      const card = document.createElement('div');
      card.className = `ai-scene-item ${isSelected ? 'selected' : ''}`;

      // Enforce < 3s display
      const durSec = Math.max(0.5, Math.min(2.85, Math.round((parseFloat(scene.end_seconds) - parseFloat(scene.start_seconds)) * 100) / 100));
      const roleBadge = scene.narrative_role ? `<span class="badge badge-subtle" style="font-size: 10px;">${escapeHtml(scene.narrative_role)}</span>` : '';

      card.innerHTML = `
        <div class="ai-scene-item-header">
          <div class="scene-title-left">
            <input type="checkbox" class="scene-checkbox" ${isSelected ? 'checked' : ''} data-index="${index}">
            <span class="scene-num-badge">#${scene.clip_number || (index + 1)}</span>
            <strong class="scene-title-text">${escapeHtml(scene.title || `Adegan ${index + 1}`)}</strong>
            ${roleBadge}
          </div>
          <span class="scene-timecode-chip">${scene.start_time} - ${scene.end_time} (⏱️ ${durSec}s • &lt; 3s)</span>
        </div>

        <div class="scene-dialogue-box">
          "${escapeHtml(scene.dialogue || '')}"
          ${scene.dialogue_translated ? `<div style="font-size: 11px; color: #475569; margin-top: 3px; font-style: normal;">🇮🇩 ${escapeHtml(scene.dialogue_translated)}</div>` : ''}
        </div>

        ${scene.reason ? `<div class="scene-reason-text">💡 <strong>Alasan AI:</strong> ${escapeHtml(scene.reason)}</div>` : ''}

        <div class="scene-actions-row">
          <button type="button" class="btn-subtle btn-xs btn-preview-scene" data-index="${index}">
            ▶️ Putar Detik Ini (${scene.start_time} • ${durSec}s)
          </button>
        </div>
      `;

      // Checkbox listener
      const chk = card.querySelector('.scene-checkbox');
      chk.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.aiSelectedClipIndices.add(index);
          card.classList.add('selected');
        } else {
          state.aiSelectedClipIndices.delete(index);
          card.classList.remove('selected');
        }
        updateAiSelectedCount();
      });

      // Preview listener
      const btnPrev = card.querySelector('.btn-preview-scene');
      btnPrev.addEventListener('click', () => previewAiScene(scene));

      elements.aiScenesContainer.appendChild(card);
    });
  }

  let aiCutPreviewTimer = null;
  // Preview specific scene on video player with automatic cut stop (< 3s)
  function previewAiScene(scene) {
    if (!elements.aiCutPreviewVideo) return;
    if (!state.aiCutSelectedMedia) {
      showToast('Pilih video sumber di kolom kiri untuk memutar pratinjau!', 'warning');
      return;
    }

    if (aiCutPreviewTimer) {
      clearTimeout(aiCutPreviewTimer);
      aiCutPreviewTimer = null;
    }

    const startSec = Math.max(0, parseFloat(scene.start_seconds) || 0);
    const endSec = Math.min(startSec + 2.85, Math.max(startSec + 0.5, parseFloat(scene.end_seconds) || (startSec + 2.85)));
    const clipDurationMs = (endSec - startSec) * 1000;
    const durDisplay = Math.round((endSec - startSec) * 10) / 10;

    elements.aiCutPreviewVideo.currentTime = startSec;
    elements.aiCutPreviewVideo.play().catch(e => console.log('Autoplay prevented:', e));

    if (elements.badgeAiPlayerTimecode) {
      elements.badgeAiPlayerTimecode.textContent = `${scene.start_time} (${durDisplay}s • < 3s)`;
    }
    showToast(`Memutar klip: "${scene.title}" (${durDisplay}s < 3s)`);

    aiCutPreviewTimer = setTimeout(() => {
      if (elements.aiCutPreviewVideo && !elements.aiCutPreviewVideo.paused) {
        elements.aiCutPreviewVideo.pause();
      }
    }, clipDurationMs);
  }

  // Execute batch cut via FFmpeg
  async function executeAiBatchCut() {
    if (!state.aiCutSelectedMedia) {
      showToast('Pilih video film sumber terlebih dahulu sebelum memotong!', 'warning');
      return;
    }

    const selectedScenes = state.aiCuratedScenes.filter((_, i) => state.aiSelectedClipIndices.has(i));
    if (selectedScenes.length === 0) {
      showToast('Pilih minimal 1 adegan yang ingin dipotong!', 'warning');
      return;
    }

    const keepAudio = elements.checkAiKeepDialogAudio ? elements.checkAiKeepDialogAudio.checked : true;
    const mirror = elements.checkAiMirrorCut ? elements.checkAiMirrorCut.checked : false;

    if (elements.btnExecuteAiBatchCut) elements.btnExecuteAiBatchCut.disabled = true;
    if (elements.aiCutBatchProgress) elements.aiCutBatchProgress.hidden = false;
    if (elements.aiBatchCutStatusText) {
      elements.aiBatchCutStatusText.textContent = `Memotong ${selectedScenes.length} adegan film via FFmpeg...`;
    }

    try {
      const res = await fetch('/api/media/ai-batch-cut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: state.aiCutSelectedMedia.id,
          scenes: selectedScenes,
          muteAudio: !keepAudio,
          mirror,
          projectId: state.currentProjectId || 0
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memotong adegan dengan FFmpeg.');
      }

      renderAiCutResults(data.clips || []);
      showToast(`🎉 Sukses! ${data.count} klip video berhasil dipotong & tersimpan di File Manager.`);

      fetchMediaList();
      fetchMediaStats();
    } catch (err) {
      console.error('Error batch cutting scenes:', err);
      showToast('Pemotongan video gagal: ' + err.message, 'error');
    } finally {
      if (elements.btnExecuteAiBatchCut) elements.btnExecuteAiBatchCut.disabled = false;
      if (elements.aiCutBatchProgress) elements.aiCutBatchProgress.hidden = true;
    }
  }

  // Render batch cut result badges
  function renderAiCutResults(clips) {
    if (!elements.aiCutResultsBox || !elements.aiCutClipsGrid) return;
    elements.aiCutClipsGrid.innerHTML = '';
    elements.aiCutResultsBox.hidden = false;

    clips.forEach(clip => {
      const badge = document.createElement('div');
      badge.className = 'ai-cut-clip-badge';
      badge.innerHTML = `
        <div style="overflow: hidden; text-overflow: ellipsis;">
          <strong>🎬 ${escapeHtml(clip.original_name)}</strong>
          <div style="font-size: 10.5px; color: #15803D;">Durasi: ${formatDuration(clip.duration_seconds)} • ${formatBytes(clip.file_size)}</div>
        </div>
        <div style="display: flex; gap: 4px; flex-shrink: 0;">
          <a href="${clip.file_url}" download class="btn-subtle btn-xs" title="Unduh Klip">⬇️</a>
          <button type="button" class="btn-subtle btn-xs btn-open-clip" title="Buka di File Manager">📁</button>
        </div>
      `;

      badge.querySelector('.btn-open-clip').addEventListener('click', () => {
        switchMediaTab('files');
      });

      elements.aiCutClipsGrid.appendChild(badge);
    });
  }

  // Open Full Preview Modal (Lightbox)
  function openMediaPreviewModal(item) {
    if (!elements.mediaPreviewModal) return;
    const isVideo = item.file_type === 'video';
    if (elements.modalPreviewMediaTitle) elements.modalPreviewMediaTitle.textContent = item.original_name;
    if (elements.previewModalTypeIcon) elements.previewModalTypeIcon.textContent = isVideo ? '🎬' : '🎙️';

    if (elements.modalPlayerBox) {
      if (isVideo) {
        elements.modalPlayerBox.innerHTML = `
          <video src="${item.file_url}" controls autoplay playsinline style="width: 100%; height: 100%; object-fit: contain;">
            Browser Anda tidak mendukung tag video.
          </video>
        `;
      } else {
        elements.modalPlayerBox.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 16px;">
            <svg style="width: 48px; height: 48px; color: #38BDF8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            <audio src="${item.file_url}" controls autoplay style="width: 80%;"></audio>
          </div>
        `;
      }
    }

    if (elements.modalPlayerMeta) {
      elements.modalPlayerMeta.innerHTML = `
        <div class="meta-item">
          <strong>Durasi</strong>
          <span>${formatDuration(item.duration_seconds)}</span>
        </div>
        <div class="meta-item">
          <strong>Resolusi</strong>
          <span>${item.resolution || (isVideo ? 'HD' : 'N/A')}</span>
        </div>
        <div class="meta-item">
          <strong>Ukuran File</strong>
          <span>${formatBytes(item.file_size)}</span>
        </div>
        <div class="meta-item">
          <strong>Kategori</strong>
          <span>${item.category}</span>
        </div>
      `;
    }

    if (elements.btnModalSendToSlicer) {
      elements.btnModalSendToSlicer.hidden = !isVideo;
      elements.btnModalSendToSlicer.onclick = () => {
        closeMediaPreviewModal();
        sendMediaToSlicer(item);
      };
    }

    if (elements.btnModalSendToAiCut) {
      elements.btnModalSendToAiCut.hidden = !isVideo;
      elements.btnModalSendToAiCut.onclick = () => {
        closeMediaPreviewModal();
        sendMediaToAiCut(item);
      };
    }

    if (elements.btnModalDownload) {
      elements.btnModalDownload.href = item.file_url;
      elements.btnModalDownload.download = item.filename;
    }

    elements.mediaPreviewModal.hidden = false;
  }

  function closeMediaPreviewModal() {
    if (elements.mediaPreviewModal) {
      elements.mediaPreviewModal.hidden = true;
      if (elements.modalPlayerBox) elements.modalPlayerBox.innerHTML = '';
    }
  }

  // Open Edit Metadata Modal
  function openMediaEditModal(item) {
    if (!elements.mediaEditModal) return;
    if (elements.editMediaId) elements.editMediaId.value = item.id;
    if (elements.editOriginalName) elements.editOriginalName.value = item.original_name;
    if (elements.editCategorySelect) elements.editCategorySelect.value = item.category || 'raw_footage';
    if (elements.editTagsInput) elements.editTagsInput.value = item.tags || '';
    if (elements.editNotesInput) elements.editNotesInput.value = item.notes || '';
    elements.mediaEditModal.hidden = false;
  }

  function closeMediaEditModal() {
    if (elements.mediaEditModal) elements.mediaEditModal.hidden = true;
  }

  // Handle Edit Media Submit
  async function handleEditMediaSubmit(e) {
    e.preventDefault();
    const id = elements.editMediaId ? elements.editMediaId.value : null;
    if (!id) return;

    const payload = {
      original_name: elements.editOriginalName ? elements.editOriginalName.value.trim() : '',
      category: elements.editCategorySelect ? elements.editCategorySelect.value : 'raw_footage',
      tags: elements.editTagsInput ? elements.editTagsInput.value.trim() : '',
      notes: elements.editNotesInput ? elements.editNotesInput.value.trim() : ''
    };

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast('Metadata media berhasil disimpan!');
        closeMediaEditModal();
        fetchMediaList();
      } else {
        showToast(json.error || 'Gagal menyimpan metadata.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  // Delete Media Item
  async function deleteMediaItem(id, name) {
    if (!confirm(`Hapus file "${name}" dari database dan penyimpanan lokal secara permanen?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'File media berhasil dihapus.');
        if (state.selectedSlicerMedia && state.selectedSlicerMedia.id === id) {
          clearSlicerSelectedMedia();
        }
        fetchMediaList();
        fetchMediaStats();
      } else {
        showToast(json.error || 'Gagal menghapus file.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  // Upload Media Modal Handlers
  function openMediaUploadModal() {
    if (elements.mediaUploadModal) elements.mediaUploadModal.hidden = false;
  }

  function closeMediaUploadModal() {
    if (elements.mediaUploadModal) elements.mediaUploadModal.hidden = true;
    if (elements.formUploadMedia) elements.formUploadMedia.reset();
    if (elements.modalDropzoneMainText) elements.modalDropzoneMainText.textContent = 'Klik untuk memilih file atau seret ke sini';
  }

  async function handleUploadMediaSubmit(e) {
    e.preventDefault();
    const fileInput = elements.modalMediaFileInput;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      showToast('Silakan pilih file video atau audio terlebih dahulu.', 'error');
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', state.currentProjectId || 0);
    if (elements.uploadCategorySelect) formData.append('category', elements.uploadCategorySelect.value);
    if (elements.uploadTagsInput) formData.append('tags', elements.uploadTagsInput.value.trim());
    if (elements.uploadNotesInput) formData.append('notes', elements.uploadNotesInput.value.trim());

    if (elements.btnSubmitUploadMedia) {
      elements.btnSubmitUploadMedia.disabled = true;
      elements.btnSubmitUploadMedia.textContent = '⏳ Mengunggah file...';
    }

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'File berhasil diunggah!');
        closeMediaUploadModal();
        fetchMediaList();
        fetchMediaStats();
      } else {
        showToast(json.error || 'Gagal mengunggah file.', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (elements.btnSubmitUploadMedia) {
        elements.btnSubmitUploadMedia.disabled = false;
        elements.btnSubmitUploadMedia.textContent = 'Mulai Unggah File';
      }
    }
  }

  // --- Event Listeners Initialization ---
  function initEvents() {
    // Top Navigation Tabs
    elements.navBtnHome.addEventListener('click', () => switchView('home'));
    elements.navBtnStudio.addEventListener('click', () => switchView('studio'));
    if (elements.navBtnMediaStudio) elements.navBtnMediaStudio.addEventListener('click', () => switchView('media'));
    elements.activeProjectPill.addEventListener('click', () => switchView('home'));

    // Media Studio & File Manager Events
    if (elements.tabMediaSlicer) elements.tabMediaSlicer.addEventListener('click', () => switchMediaTab('slicer'));
    if (elements.tabMediaAiCut) elements.tabMediaAiCut.addEventListener('click', () => switchMediaTab('aicut'));
    if (elements.tabMediaFiles) elements.tabMediaFiles.addEventListener('click', () => switchMediaTab('files'));
    if (elements.btnRefreshMedia) elements.btnRefreshMedia.addEventListener('click', () => { fetchMediaList(); fetchMediaStats(); });
    if (elements.btnOpenUploadModal) elements.btnOpenUploadModal.addEventListener('click', openMediaUploadModal);
    if (elements.btnEmptyUpload) elements.btnEmptyUpload.addEventListener('click', openMediaUploadModal);

    // AI Cut Scene Events
    if (elements.aiCutSelectVideo) {
      elements.aiCutSelectVideo.addEventListener('change', (e) => {
        const val = e.target.value;
        const item = state.mediaItems.find(m => String(m.id) === String(val));
        if (item) selectAiCutVideo(item);
        else clearAiCutSelectedVideo();
      });
    }
    if (elements.aiCutSrtDropzone && elements.aiCutSrtFileInput) {
      elements.aiCutSrtDropzone.addEventListener('click', () => elements.aiCutSrtFileInput.click());
      elements.aiCutSrtFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) handleAiSrtFileSelect(e.target.files[0]);
      });
      elements.aiCutSrtDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.aiCutSrtDropzone.classList.add('dragover');
      });
      elements.aiCutSrtDropzone.addEventListener('dragleave', () => {
        elements.aiCutSrtDropzone.classList.remove('dragover');
      });
      elements.aiCutSrtDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.aiCutSrtDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleAiSrtFileSelect(e.dataTransfer.files[0]);
        }
      });
    }
    if (elements.btnTogglePasteSrt && elements.boxPasteSrtArea) {
      elements.btnTogglePasteSrt.addEventListener('click', () => {
        elements.boxPasteSrtArea.hidden = !elements.boxPasteSrtArea.hidden;
        if (!elements.boxPasteSrtArea.hidden && elements.aiCutSrtTextArea) {
          elements.aiCutSrtTextArea.focus();
        }
      });
    }
    if (elements.btnExtractEmbeddedSubs) {
      elements.btnExtractEmbeddedSubs.addEventListener('click', extractEmbeddedSubsFromVideo);
    }
    if (elements.btnRunAiSrtAnalysis) {
      elements.btnRunAiSrtAnalysis.addEventListener('click', runAiSrtAnalysis);
    }
    if (elements.btnSelectAllAiClips) {
      elements.btnSelectAllAiClips.addEventListener('click', toggleSelectAllAiScenes);
    }
    if (elements.btnExecuteAiBatchCut) {
      elements.btnExecuteAiBatchCut.addEventListener('click', executeAiBatchCut);
    }
    if (elements.btnAiPlayerMuteToggle && elements.aiCutPreviewVideo) {
      elements.btnAiPlayerMuteToggle.addEventListener('click', () => {
        elements.aiCutPreviewVideo.muted = !elements.aiCutPreviewVideo.muted;
        elements.btnAiPlayerMuteToggle.textContent = elements.aiCutPreviewVideo.muted ? '🔇 Mute' : '🔊 Suara On';
      });
    }
    if (elements.aiCutPreviewVideo) {
      elements.aiCutPreviewVideo.addEventListener('timeupdate', () => {
        if (elements.badgeAiPlayerTimecode) {
          const cur = formatDuration(elements.aiCutPreviewVideo.currentTime || 0);
          const dur = formatDuration(elements.aiCutPreviewVideo.duration || 0);
          elements.badgeAiPlayerTimecode.textContent = `${cur} / ${dur}`;
        }
      });
    }

    // Slicer Controls & Source Selector
    if (elements.btnSourceFromManager) elements.btnSourceFromManager.addEventListener('click', () => switchSlicerSourceMode('manager'));
    if (elements.btnSourceFromUpload) elements.btnSourceFromUpload.addEventListener('click', () => switchSlicerSourceMode('upload'));
    if (elements.slicerSelectVideo) {
      elements.slicerSelectVideo.addEventListener('change', (e) => {
        const val = e.target.value;
        const item = state.mediaItems.find(m => String(m.id) === String(val));
        if (item) selectSlicerMediaItem(item);
        else clearSlicerSelectedMedia();
      });
    }

    // Slicer Dropzone & File Input
    if (elements.slicerDropzone && elements.slicerFileInput) {
      elements.slicerDropzone.addEventListener('click', () => elements.slicerFileInput.click());
      elements.slicerFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) selectSlicerFileDirect(e.target.files[0]);
      });
      elements.slicerDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.slicerDropzone.classList.add('dragover');
      });
      elements.slicerDropzone.addEventListener('dragleave', () => {
        elements.slicerDropzone.classList.remove('dragover');
      });
      elements.slicerDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.slicerDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          selectSlicerFileDirect(e.dataTransfer.files[0]);
        }
      });
    }
    if (elements.btnClearSelectedVideo) elements.btnClearSelectedVideo.addEventListener('click', clearSlicerSelectedMedia);

    // Slicer Parameter Slider & Number Inputs Sync
    if (elements.sliderKeepSeconds && elements.inputKeepSeconds) {
      elements.sliderKeepSeconds.addEventListener('input', (e) => {
        elements.inputKeepSeconds.value = e.target.value;
        updateSlicerFormulaText();
      });
      elements.inputKeepSeconds.addEventListener('input', (e) => {
        elements.sliderKeepSeconds.value = e.target.value;
        updateSlicerFormulaText();
      });
    }
    if (elements.sliderSkipSeconds && elements.inputSkipSeconds) {
      elements.sliderSkipSeconds.addEventListener('input', (e) => {
        elements.inputSkipSeconds.value = e.target.value;
        updateSlicerFormulaText();
      });
      elements.inputSkipSeconds.addEventListener('input', (e) => {
        elements.sliderSkipSeconds.value = e.target.value;
        updateSlicerFormulaText();
      });
    }

    // Slicer Action & Player Buttons
    if (elements.btnStartSlicing) elements.btnStartSlicing.addEventListener('click', startVideoSlicing);
    if (elements.btnTogglePreviewSource) elements.btnTogglePreviewSource.addEventListener('click', togglePreviewSource);
    if (elements.btnOpenInFileManager) elements.btnOpenInFileManager.addEventListener('click', () => switchMediaTab('files'));
    if (elements.btnCopyVideoUrl) {
      elements.btnCopyVideoUrl.addEventListener('click', () => {
        if (state.slicedResultMedia && state.slicedResultMedia.file_url) {
          navigator.clipboard.writeText(window.location.origin + state.slicedResultMedia.file_url);
          showToast('Tautan video berhasil disalin ke clipboard!');
        }
      });
    }

    // File Manager Filter Pills & Search
    if (elements.fmFilterBtns) {
      elements.fmFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          elements.fmFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.fmFilter = btn.dataset.filter || 'all';
          renderMediaItems();
        });
      });
    }
    if (elements.fmSearchInput) {
      elements.fmSearchInput.addEventListener('input', (e) => {
        state.fmSearch = e.target.value;
        if (elements.btnFmClearSearch) elements.btnFmClearSearch.hidden = !e.target.value;
        renderMediaItems();
      });
    }
    if (elements.btnFmClearSearch) {
      elements.btnFmClearSearch.addEventListener('click', () => {
        elements.fmSearchInput.value = '';
        state.fmSearch = '';
        elements.btnFmClearSearch.hidden = true;
        renderMediaItems();
      });
    }

    // File Manager View Modes (Grid vs Table)
    if (elements.btnViewGrid) {
      elements.btnViewGrid.addEventListener('click', () => {
        state.fmViewMode = 'grid';
        elements.btnViewGrid.classList.add('active');
        if (elements.btnViewTable) elements.btnViewTable.classList.remove('active');
        if (elements.fmMediaGrid) elements.fmMediaGrid.hidden = false;
        if (elements.fmMediaTableContainer) elements.fmMediaTableContainer.hidden = true;
        renderMediaItems();
      });
    }
    if (elements.btnViewTable) {
      elements.btnViewTable.addEventListener('click', () => {
        state.fmViewMode = 'table';
        elements.btnViewTable.classList.add('active');
        if (elements.btnViewGrid) elements.btnViewGrid.classList.remove('active');
        if (elements.fmMediaGrid) elements.fmMediaGrid.hidden = true;
        if (elements.fmMediaTableContainer) elements.fmMediaTableContainer.hidden = false;
        renderMediaItems();
      });
    }

    // Media Modals: Upload
    if (elements.btnCloseUploadModal) elements.btnCloseUploadModal.addEventListener('click', closeMediaUploadModal);
    if (elements.btnCancelUploadModal) elements.btnCancelUploadModal.addEventListener('click', closeMediaUploadModal);
    if (elements.formUploadMedia) elements.formUploadMedia.addEventListener('submit', handleUploadMediaSubmit);
    if (elements.modalMediaDropzone && elements.modalMediaFileInput) {
      elements.modalMediaDropzone.addEventListener('click', () => elements.modalMediaFileInput.click());
      elements.modalMediaFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          if (elements.modalDropzoneMainText) {
            elements.modalDropzoneMainText.textContent = `File dipilih: ${e.target.files[0].name} (${formatBytes(e.target.files[0].size)})`;
          }
        }
      });
    }

    // Media Modals: Edit Metadata
    if (elements.btnCloseEditMediaModal) elements.btnCloseEditMediaModal.addEventListener('click', closeMediaEditModal);
    if (elements.btnCancelEditMedia) elements.btnCancelEditMedia.addEventListener('click', closeMediaEditModal);
    if (elements.formEditMedia) elements.formEditMedia.addEventListener('submit', handleEditMediaSubmit);

    // Media Modals: Full Preview Lightbox
    if (elements.btnClosePreviewModal) elements.btnClosePreviewModal.addEventListener('click', closeMediaPreviewModal);
    if (elements.btnClosePreviewBottom) elements.btnClosePreviewBottom.addEventListener('click', closeMediaPreviewModal);

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

    // Transcreation & Translation Modal
    if (elements.btnOpenTranslateModal) elements.btnOpenTranslateModal.addEventListener('click', openTranslateModal);
    if (elements.btnSubbarTranslate) elements.btnSubbarTranslate.addEventListener('click', openTranslateModal);
    if (elements.btnCloseTranslateModal) elements.btnCloseTranslateModal.addEventListener('click', closeTranslateModal);
    if (elements.btnCloseTranslateModalFooter) elements.btnCloseTranslateModalFooter.addEventListener('click', closeTranslateModal);
    if (elements.btnTriggerTranscreate) elements.btnTriggerTranscreate.addEventListener('click', handleTranscreateScript);

    // Audio Mixing & Mastering Suite Dock / Side Panel
    if (elements.btnToggleSidebar) elements.btnToggleSidebar.addEventListener('click', () => toggleLeftSidebar());
    if (elements.btnToggleAudioDock) elements.btnToggleAudioDock.addEventListener('click', () => toggleAudioDock());
    if (elements.btnOpenAudioSuiteModal) elements.btnOpenAudioSuiteModal.addEventListener('click', () => toggleAudioDock());
    if (elements.btnCloseAudioSuiteModal) elements.btnCloseAudioSuiteModal.addEventListener('click', closeAudioSuiteModal);
    if (elements.btnCloseAudioSuiteFooter) elements.btnCloseAudioSuiteFooter.addEventListener('click', closeAudioSuiteModal);
    initAudioDockResizer();
    window.addEventListener('resize', resizeAudioCanvases);
    if (elements.btnOpenTtsInAudioSuite) {
      elements.btnOpenTtsInAudioSuite.addEventListener('click', () => {
        const audioUrl = elements.btnDownloadTtsWav ? elements.btnDownloadTtsWav.href : '';
        const filename = elements.btnDownloadTtsWav ? elements.btnDownloadTtsWav.download : 'Voiceover.wav';
        closeTtsModal();
        openAudioSuiteModal({ autoLoadTtsUrl: audioUrl, autoLoadFilename: filename });
      });
    }

    // Source Tabs
    if (elements.tabBtnAudioMic) elements.tabBtnAudioMic.addEventListener('click', () => switchAudioSourceTab('audioSourceTabMic'));
    if (elements.tabBtnAudioUpload) elements.tabBtnAudioUpload.addEventListener('click', () => switchAudioSourceTab('audioSourceTabUpload'));
    if (elements.tabBtnAudioTts) elements.tabBtnAudioTts.addEventListener('click', () => switchAudioSourceTab('audioSourceTabTts'));

    // Recording Actions
    if (elements.btnStartRecord) elements.btnStartRecord.addEventListener('click', () => handleStartRecording());
    if (elements.btnPauseResumeRecord) elements.btnPauseResumeRecord.addEventListener('click', handlePauseResumeRecording);
    if (elements.btnStopRecord) elements.btnStopRecord.addEventListener('click', handleStopRecording);
    if (elements.btnRestartRecord) elements.btnRestartRecord.addEventListener('click', handleRestartRecord);
    if (elements.btnUndoAppendRecord) elements.btnUndoAppendRecord.addEventListener('click', handleUndoAppendRecord);
    if (elements.btnDeckAppendRecord) elements.btnDeckAppendRecord.addEventListener('click', handleDeckAppendRecord);

    // Audio File Dropzone & Browse
    if (elements.btnBrowseAudioFile) elements.btnBrowseAudioFile.addEventListener('click', () => elements.audioFileInput && elements.audioFileInput.click());
    if (elements.audioFileInput) {
      elements.audioFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          handleAudioFileSelect(e.target.files[0]);
        }
      });
    }
    if (elements.audioUploadDropzone) {
      elements.audioUploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.audioUploadDropzone.classList.add('dragover');
      });
      elements.audioUploadDropzone.addEventListener('dragleave', () => {
        elements.audioUploadDropzone.classList.remove('dragover');
      });
      elements.audioUploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.audioUploadDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          handleAudioFileSelect(e.dataTransfer.files[0]);
        }
      });
    }

    // Upload Target Mode Selection
    if (elements.btnUploadModeVocal) elements.btnUploadModeVocal.addEventListener('click', () => setUploadTargetMode('vocal'));
    if (elements.btnUploadModeAppend) elements.btnUploadModeAppend.addEventListener('click', () => setUploadTargetMode('append'));
    if (elements.btnUploadModeBgm) elements.btnUploadModeBgm.addEventListener('click', () => setUploadTargetMode('bgm'));

    // Monitor Deck Quick Upload Trigger
    if (elements.btnDeckUploadAudio) {
      elements.btnDeckUploadAudio.addEventListener('click', () => {
        switchAudioSourceTab('audioSourceTabUpload');
        if (elements.audioFileInput) elements.audioFileInput.click();
      });
    }

    // Sound Library Actions
    if (elements.btnRefreshSoundLibrary) {
      elements.btnRefreshSoundLibrary.addEventListener('click', fetchProjectSoundLibrary);
    }
    if (elements.btnSaveUploadedToLibrary) {
      elements.btnSaveUploadedToLibrary.addEventListener('click', () => {
        if (state.audioSuite.lastUploadedFile && window.AlurAudioEngine && window.AlurAudioEngine.voiceBuffer) {
          saveUploadedSoundToServer(state.audioSuite.lastUploadedFile, window.AlurAudioEngine.voiceBuffer.duration, state.audioSuite.uploadTargetMode || 'vocal');
        } else {
          showToast('Tidak ada file baru untuk disimpan.', 'info');
        }
      });
    }

    // Project TTS Loader
    if (elements.btnLoadSelectedTts) elements.btnLoadSelectedTts.addEventListener('click', handleLoadSelectedTts);

    // Transport & Audition
    if (elements.btnAudioPlayPause) elements.btnAudioPlayPause.addEventListener('click', handlePlayPauseAudio);
    if (elements.btnAudioStop) elements.btnAudioStop.addEventListener('click', handleStopAudio);
    if (elements.waveformContainer) elements.waveformContainer.addEventListener('click', handleWaveformClick);
    if (elements.faderVoiceVol) elements.faderVoiceVol.addEventListener('input', handleKnobLiveChange);

    if (elements.btnAuditionRaw) elements.btnAuditionRaw.addEventListener('click', () => setAuditionMode(false));
    if (elements.btnAuditionMaster) elements.btnAuditionMaster.addEventListener('click', () => setAuditionMode(true));

    // Preset Buttons
    if (elements.presetPillsGrid) {
      elements.presetPillsGrid.querySelectorAll('.preset-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPresetToEngine(btn.dataset.preset));
      });
    }
    if (elements.customPresetSelect) {
      elements.customPresetSelect.addEventListener('change', (e) => {
        if (e.target.value) applyPresetToEngine(e.target.value);
      });
    }
    if (elements.btnSaveCurrentAsPreset) elements.btnSaveCurrentAsPreset.addEventListener('click', handleSaveCurrentAsPreset);

    // Dual-Mode Effects Suite Tabs
    if (elements.tabModeManualRack) {
      elements.tabModeManualRack.addEventListener('click', () => switchEffectSuiteTab('manual'));
    }
    if (elements.tabModeQuickPresets) {
      elements.tabModeQuickPresets.addEventListener('click', () => switchEffectSuiteTab('presets'));
    }
    if (elements.btnResetToDefaultDsp) {
      elements.btnResetToDefaultDsp.addEventListener('click', () => {
        applyPresetToEngine('youtube_recap');
        showToast('Efek audio di-reset ke standar YouTube Recap.');
      });
    }

    // Live DSP Knobs & Switches (Manual Controls)
    const dspInputs = [
      elements.chkEnableClean, elements.slHighPassFreq, elements.slNoiseGate,
      elements.chkEnableDeEsser, elements.slDeEsserAmount, elements.slDeEsserFreq,
      elements.chkEnableEq, elements.slEqLow, elements.slEqMid, elements.slEqPresence, elements.slEqHigh,
      elements.chkEnableComp, elements.slCompThreshold, elements.slCompRatio, elements.slCompMakeup,
      elements.chkEnableWarmth, elements.slTubeWarmth, elements.slStudioAmbience,
      elements.chkEnableLimiter, elements.slLimiterCeiling,
      elements.chkEnableDucking, elements.slBgmVolume, elements.slDuckDepth
    ];
    dspInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => handleKnobLiveChange(true));
        input.addEventListener('change', () => handleKnobLiveChange(true));
      }
    });

    // BGM Actions
    if (elements.bgmTrackSelect) elements.bgmTrackSelect.addEventListener('change', handleBgmChange);
    if (elements.btnUploadCustomBgm) elements.btnUploadCustomBgm.addEventListener('click', () => elements.bgmFileInput && elements.bgmFileInput.click());
    if (elements.bgmFileInput) {
      elements.bgmFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          handleUploadCustomBgm(e.target.files[0]);
        }
      });
    }

    // Master Export & Attach
    if (elements.btnFormatWav) elements.btnFormatWav.addEventListener('click', () => setExportFormat('wav'));
    if (elements.btnFormatMp3) elements.btnFormatMp3.addEventListener('click', () => setExportFormat('mp3'));
    if (elements.btnDownloadMasteredAudio) elements.btnDownloadMasteredAudio.addEventListener('click', handleDownloadMasteredAudio);
    if (elements.btnAttachAudioToProject) elements.btnAttachAudioToProject.addEventListener('click', handleAttachAudioToProject);

    // DB Master Audio Presets tab
    if (elements.tabBtnDbAudioPresets) elements.tabBtnDbAudioPresets.addEventListener('click', () => switchMasterTab('masterTabAudioPresets'));
    if (elements.audioPresetForm) elements.audioPresetForm.addEventListener('submit', handleSavePresetFormSubmit);
    if (elements.btnCancelPresetEdit) elements.btnCancelPresetEdit.addEventListener('click', resetPresetForm);
    if (elements.btnResetDefaultAudioPresets) elements.btnResetDefaultAudioPresets.addEventListener('click', handleResetDefaultAudioPresets);

    if (elements.transTargetLangSelect) {
      elements.transTargetLangSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (elements.transCustomLangGroup) {
          elements.transCustomLangGroup.hidden = val !== 'custom';
        }
        const greetings = {
          'en-US': 'Hey movie fans, welcome back!',
          'en-GB': 'Hello everyone, and welcome back to the channel.',
          'es': '¡Hola amantes del cine, bienvenidos de nuevo!',
          'pt-BR': 'E aí cinéfilos, sejam muito bem-vindos de volta!',
          'ja': '皆さんこんにちは！映画解説チャンネルへようこそ。',
          'de': 'Hallo Filmfans, willkommen zurück auf unserem Kanal!',
          'fr': 'Bonjour à tous les passionnés de cinéma et bienvenue sur la chaîne!',
          'ko': '안녕하세요, 영화 리뷰 채널에 오신 것을 환영합니다!',
          'ar': 'مرحباً بكم يا عشاق السينما في ملخص جديد ومثير اليوم!'
        };
        if (greetings[val] && elements.transOpeningHookInput) {
          elements.transOpeningHookInput.value = greetings[val];
        }
      });
    }

    if (elements.transGeminiModelSelect && elements.transModelBadge) {
      elements.transGeminiModelSelect.addEventListener('change', (e) => {
        elements.transModelBadge.textContent = e.target.value === 'auto' ? 'Auto-Fallback Siaga' : e.target.options[e.target.selectedIndex].text;
      });
    }

    if (elements.btnCopyTransResult && elements.transResultPreview) {
      elements.btnCopyTransResult.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(elements.transResultPreview.value);
          showToast('✓ Naskah hasil terjemahan berhasil disalin ke clipboard!');
        } catch {
          elements.transResultPreview.select();
          document.execCommand('copy');
          showToast('✓ Naskah berhasil disalin!');
        }
      });
    }

    if (elements.btnOpenTransProject) {
      elements.btnOpenTransProject.addEventListener('click', () => {
        if (newlyCreatedTransProjectId) {
          loadProjectIntoStudio(newlyCreatedTransProjectId);
          closeTranslateModal();
          showToast('Beralih ke proyek naskah global!');
        }
      });
    }

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

    // Advanced TTS Settings Toggle & Sliders
    if (elements.btnToggleAdvancedTts && elements.ttsAdvancedBody) {
      elements.btnToggleAdvancedTts.addEventListener('click', () => {
        const isHidden = elements.ttsAdvancedBody.hidden;
        elements.ttsAdvancedBody.hidden = !isHidden;
        elements.btnToggleAdvancedTts.setAttribute('aria-expanded', String(isHidden));
      });
    }
    if (elements.ttsTempRange && elements.ttsTempVal) {
      elements.ttsTempRange.addEventListener('input', (e) => {
        elements.ttsTempVal.textContent = e.target.value;
      });
    }
    if (elements.ttsCfgRange && elements.ttsCfgVal) {
      elements.ttsCfgRange.addEventListener('input', (e) => {
        elements.ttsCfgVal.textContent = e.target.value;
      });
    }

    // Dynamic Character/Voice selection per TTS Model
    if (elements.ttsModelSelect) {
      elements.ttsModelSelect.addEventListener('change', (e) => {
        const selectedModel = e.target.value;
        populateTtsVoiceOptions(selectedModel);

        // Atur parameter default optimal untuk masing-masing model
        if (selectedModel === 'dia') {
          if (elements.ttsTempRange) { elements.ttsTempRange.value = 0.75; if (elements.ttsTempVal) elements.ttsTempVal.textContent = '0.75'; }
          if (elements.ttsCfgRange) { elements.ttsCfgRange.value = 2.5; if (elements.ttsCfgVal) elements.ttsCfgVal.textContent = '2.5'; }
        } else if (selectedModel === 'kokoro') {
          if (elements.ttsTempRange) { elements.ttsTempRange.value = 0.8; if (elements.ttsTempVal) elements.ttsTempVal.textContent = '0.8'; }
          if (elements.ttsCfgRange) { elements.ttsCfgRange.value = 2.0; if (elements.ttsCfgVal) elements.ttsCfgVal.textContent = '2.0'; }
        } else if (selectedModel === 'xtts') {
          if (elements.ttsTempRange) { elements.ttsTempRange.value = 0.7; if (elements.ttsTempVal) elements.ttsTempVal.textContent = '0.7'; }
          if (elements.ttsCfgRange) { elements.ttsCfgRange.value = 2.0; if (elements.ttsCfgVal) elements.ttsCfgVal.textContent = '2.0'; }
        }

        handleSaveColabConfig();
      });
    }

    // Gemini Model Selection & LocalStorage Persistence
    if (elements.geminiModelSelect) {
      const savedModel = localStorage.getItem('alurcerita_gemini_model');
      if (savedModel && elements.geminiModelSelect.querySelector(`option[value="${savedModel}"]`)) {
        elements.geminiModelSelect.value = savedModel;
        if (elements.geminiModelBadge) {
          elements.geminiModelBadge.textContent = savedModel === 'auto' ? '8 Model Siaga' : elements.geminiModelSelect.options[elements.geminiModelSelect.selectedIndex].text;
        }
      }

      elements.geminiModelSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        localStorage.setItem('alurcerita_gemini_model', val);
        if (elements.geminiModelBadge) {
          elements.geminiModelBadge.textContent = val === 'auto' ? '8 Model Siaga' : e.target.options[e.target.selectedIndex].text;
        }
        showToast(val === 'auto' ? '⚡ Mode Auto-Fallback Pintar aktif.' : `Model Gemini diset ke: ${e.target.options[e.target.selectedIndex].text}`);
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

    // Channel Management Modal (SQLite Database)
    if (elements.btnOpenChannelModal) elements.btnOpenChannelModal.addEventListener('click', openChannelModal);
    if (elements.btnCloseChannelModal) elements.btnCloseChannelModal.addEventListener('click', closeChannelModal);
    if (elements.btnCloseChannelModalFooter) elements.btnCloseChannelModalFooter.addEventListener('click', closeChannelModal);
    if (elements.btnCancelEditChannel) elements.btnCancelEditChannel.addEventListener('click', resetChannelForm);
    if (elements.channelForm) elements.channelForm.addEventListener('submit', handleSaveChannelSubmit);

    // Channel List Delegated Actions
    if (elements.channelListContainer) {
      elements.channelListContainer.addEventListener('click', (e) => {
        const applyBtn = e.target.closest('.btn-apply-channel');
        if (applyBtn) {
          applyChannelById(applyBtn.dataset.id, true);
          closeChannelModal();
          return;
        }

        const editBtn = e.target.closest('.btn-edit-channel');
        if (editBtn) {
          startEditChannel(editBtn.dataset.id);
          return;
        }

        const defBtn = e.target.closest('.btn-default-channel');
        if (defBtn) {
          handleSetDefaultChannel(defBtn.dataset.id);
          return;
        }

        const delBtn = e.target.closest('.btn-delete-channel');
        if (delBtn) {
          handleDeleteChannel(delBtn.dataset.id);
          return;
        }
      });
    }

    // Real-time Studio Header Title sync on Movie Title or Year edit
    function updateStudioHeaderTitle() {
      const title = elements.movieTitle ? elements.movieTitle.value.trim() : '';
      const year = elements.movieYear ? elements.movieYear.value.trim() : '';
      const yearPart = year ? ` (${year})` : '';
      if (elements.activeProjectTitleDisplay) {
        elements.activeProjectTitleDisplay.textContent = (title || 'Film Tanpa Judul') + yearPart;
      }
    }
    if (elements.movieTitle) elements.movieTitle.addEventListener('input', updateStudioHeaderTitle);
    if (elements.movieYear) elements.movieYear.addEventListener('input', updateStudioHeaderTitle);

    // Database Master Center Modal
    if (elements.btnOpenDbMasterModal) elements.btnOpenDbMasterModal.addEventListener('click', () => openDbMasterModal('masterTabPersonas'));
    if (elements.btnOpenDbMasterModalHome) elements.btnOpenDbMasterModalHome.addEventListener('click', () => openDbMasterModal('masterTabPersonas'));
    if (elements.btnQuickManagePersona) elements.btnQuickManagePersona.addEventListener('click', () => openDbMasterModal('masterTabPersonas'));
    if (elements.btnCloseDbMasterModal) elements.btnCloseDbMasterModal.addEventListener('click', closeDbMasterModal);
    if (elements.btnCloseDbMasterModalFooter) elements.btnCloseDbMasterModalFooter.addEventListener('click', closeDbMasterModal);

    // Master Modal Tabs
    if (elements.tabBtnDbPersonas) elements.tabBtnDbPersonas.addEventListener('click', () => switchMasterTab('masterTabPersonas'));
    if (elements.tabBtnDbVoices) elements.tabBtnDbVoices.addEventListener('click', () => switchMasterTab('masterTabVoices'));
    if (elements.tabBtnDbPrompts) elements.tabBtnDbPrompts.addEventListener('click', () => switchMasterTab('masterTabPrompts'));
    if (elements.tabBtnDbSettings) elements.tabBtnDbSettings.addEventListener('click', () => switchMasterTab('masterTabSettings'));

    // Personas CRUD listeners
    if (elements.personaForm) elements.personaForm.addEventListener('submit', handleSavePersonaSubmit);
    if (elements.btnCancelEditPersona) elements.btnCancelEditPersona.addEventListener('click', resetPersonaForm);
    if (elements.personaListContainer) {
      elements.personaListContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit-persona');
        if (editBtn) {
          startEditPersona(editBtn.dataset.id);
          return;
        }
        const defBtn = e.target.closest('.btn-default-persona');
        if (defBtn) {
          handleSetDefaultPersona(defBtn.dataset.id);
          return;
        }
        const delBtn = e.target.closest('.btn-delete-persona');
        if (delBtn) {
          handleDeletePersona(delBtn.dataset.id);
          return;
        }
      });
    }

    // TTS Voices CRUD listeners
    if (elements.voiceForm) elements.voiceForm.addEventListener('submit', handleSaveVoiceSubmit);
    if (elements.btnCancelEditVoice) elements.btnCancelEditVoice.addEventListener('click', resetVoiceForm);
    if (elements.selectVoiceFilterModel) elements.selectVoiceFilterModel.addEventListener('change', renderTtsVoicesList);
    if (elements.voiceListContainer) {
      elements.voiceListContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit-voice');
        if (editBtn) {
          startEditVoice(editBtn.dataset.id);
          return;
        }
        const defBtn = e.target.closest('.btn-default-voice');
        if (defBtn) {
          handleSetDefaultVoice(defBtn.dataset.id);
          return;
        }
        const delBtn = e.target.closest('.btn-delete-voice');
        if (delBtn) {
          handleDeleteVoice(delBtn.dataset.id);
          return;
        }
      });
    }

    // Prompts CRUD listeners
    if (elements.selectPromptStageKey) elements.selectPromptStageKey.addEventListener('change', loadSelectedPromptTemplate);
    if (elements.promptTemplateForm) elements.promptTemplateForm.addEventListener('submit', handleSavePromptTemplateSubmit);
    if (elements.btnResetPromptsToDefault) elements.btnResetPromptsToDefault.addEventListener('click', handleResetPromptsToDefault);

    // App Settings listeners
    if (elements.appSettingsForm) elements.appSettingsForm.addEventListener('submit', handleSaveAppSettingsSubmit);

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

    // View Mode Switching (Canvas Editor vs Raw Markdown)
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
      if (!state.isRawMode && elements.scriptPaperReader) {
        const liveMd = domPaperToMarkdown(elements.scriptPaperReader);
        if (liveMd) state.currentScriptMarkdown = liveMd;
      }
      state.isRawMode = true;
      elements.viewBtnRaw.classList.add('active');
      elements.viewBtnReader.classList.remove('active');
      elements.scriptPaperReader.hidden = true;
      elements.scriptPaperReader.style.display = 'none';
      elements.scriptRawEditor.hidden = false;
      elements.scriptRawEditor.style.display = 'block';
      elements.scriptRawEditor.value = state.currentScriptMarkdown;
    });

    // Live CRUD Sync: Canvas Editorial Paper (contenteditable) -> Markdown State & SQLite Auto-save
    if (elements.scriptPaperReader) {
      elements.scriptPaperReader.addEventListener('input', () => {
        const md = domPaperToMarkdown(elements.scriptPaperReader);
        state.currentScriptMarkdown = md;
        if (elements.scriptRawEditor) {
          elements.scriptRawEditor.value = md;
        }
        elements.canvasSyncStatus.textContent = "Menyimpan perubahan ke SQLite...";
        clearTimeout(elements.scriptPaperReader._saveTimer);
        elements.scriptPaperReader._saveTimer = setTimeout(() => {
          saveCurrentProjectToSQLite();
          updateScriptMetrics();
        }, 1200);
      });

      elements.scriptPaperReader.addEventListener('blur', () => {
        const md = domPaperToMarkdown(elements.scriptPaperReader);
        if (md && md !== state.currentScriptMarkdown) {
          state.currentScriptMarkdown = md;
          if (elements.scriptRawEditor) elements.scriptRawEditor.value = md;
          saveCurrentProjectToSQLite();
          updateScriptMetrics();
        }
      });
    }

    // Button: Hapus Basa-Basi AI (Preamble Cleaner)
    if (elements.btnCleanAiPreamble) {
      elements.btnCleanAiPreamble.addEventListener('click', () => {
        const before = state.currentScriptMarkdown;
        const after = stripAiConversationalPreamble(before);
        if (before === after) {
          showToast("Naskah sudah bersih dari basa-basi AI!");
        } else {
          state.currentScriptMarkdown = after;
          renderScript();
          saveCurrentProjectToSQLite();
          showToast("✓ Basa-basi AI berhasil dihapus & tersimpan ke SQLite!");
        }
      });
    }

    // Sync Raw Markdown Editor changes to State & SQLite
    if (elements.scriptRawEditor) {
      elements.scriptRawEditor.addEventListener('input', () => {
        state.currentScriptMarkdown = elements.scriptRawEditor.value;
        elements.canvasSyncStatus.textContent = "Menyimpan perubahan ke SQLite...";
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
        if (elements.channelModal && !elements.channelModal.hidden) closeChannelModal();
        if (elements.apiKeyModal && !elements.apiKeyModal.hidden) closeApiKeyModal();
        if (elements.dbMasterModal && !elements.dbMasterModal.hidden) closeDbMasterModal();
        if (elements.ttsModal && !elements.ttsModal.hidden) closeTtsModal();
        if (elements.translateModal && !elements.translateModal.hidden) closeTranslateModal();
        if (elements.audioSuiteModal && !elements.audioSuiteModal.hidden) closeAudioSuiteModal();
      }
      if (e.code === 'Space' && elements.audioSuiteModal && !elements.audioSuiteModal.hidden && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        handlePlayPauseAudio();
      }
      if (e.code === 'Space' && state.prompter.active) {
        e.preventDefault();
        togglePrompterScroll();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleLeftSidebar();
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

    // Pulihkan status collapse sidebar jika tersimpan
    const savedSidebarCollapsed = localStorage.getItem('alur_sidebar_collapsed');
    if (savedSidebarCollapsed === '1') {
      toggleLeftSidebar(true);
    }

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

    await fetchAppSettings(); // Load global app settings from SQLite
    await fetchPersonasList(); // Load personas from SQLite
    await fetchTtsVoicesList(); // Load TTS voices library from SQLite
    await fetchPromptTemplatesList(); // Load AI prompt templates from SQLite
    await fetchChannelsList(); // Load registered channels from SQLite
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
