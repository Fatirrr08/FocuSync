# Product Requirements Document (PRD)
# FocuSync — The Ultimate Multi-Device Focus Ecosystem

**Slogan:** Lock Your Screen, Lock Your Phone, Unlock Your Potential.
**Versi Dokumen:** 2.0 (Detail Lengkap)
**Tanggal:** 12 Juli 2026
**Konteks:** Proposal & pengembangan untuk kebutuhan lomba, target implementasi MVP dalam 2 minggu.

---

## Daftar Isi

1. Ringkasan Eksekutif
2. Latar Belakang & Rumusan Masalah
3. Tujuan & Sasaran (SMART Goals)
4. Target Pengguna & Persona
5. Ruang Lingkup
6. Fitur & Spesifikasi Fungsional (User Story, Acceptance Criteria, API, Edge Case)
7. Tech Stack & Justifikasi
8. Arsitektur Sistem
9. Skema Database (DDL Lengkap)
10. Desain API (Ringkasan Endpoint & Realtime Event)
11. Non-Functional Requirements
12. Alur Pengguna (User Flow) Rinci
13. Batasan & Asumsi
14. Risiko & Mitigasi
15. Metrik Keberhasilan (KPI)
16. Glosarium

---

## 1. Ringkasan Eksekutif

FocuSync adalah aplikasi web produktivitas *cross-device* yang menyinkronkan laptop (Chamber UI) dan handphone (Device Anchor) secara real-time untuk menciptakan sesi belajar/kerja bebas distraksi, tanpa menggunakan kecerdasan buatan. Sistem mengandalkan API bawaan browser (Fullscreen API, Page Visibility API, DeviceOrientation API, Ambient Light Sensor API) serta mekanisme *behavioral psychology* (2-Minute Distraction Inbox, TaskChunker, Contribution Heatmap) untuk menjaga komitmen pengguna selama sesi fokus.

Fitur tambahan: **Allow-list Aplikasi & Website**, sebuah daftar yang dapat dikustomisasi pengguna untuk menentukan aplikasi/website apa saja yang boleh dan tidak boleh dibuka selama sesi fokus di PC/laptop, dengan preset default yang sudah disiapkan sistem dan dapat diubah kapan saja sebelum sesi dimulai.

Seluruh pengembangan MVP dirancang untuk dapat diselesaikan **satu tim kecil (2-3 orang) dalam 14 hari kalender**, menggunakan tech stack yang seluruhnya memiliki tingkat entri (free tier) gratis dan dokumentasi matang, sehingga waktu tim lebih banyak dihabiskan untuk logika produk ketimbang konfigurasi infrastruktur.

## 2. Latar Belakang & Rumusan Masalah

### 2.1 Konteks Masalah
- Penggunaan media sosial dan notifikasi HP terbukti menjadi sumber distraksi terbesar saat sesi belajar mandiri (self-paced learning) di kalangan mahasiswa/pelajar.
- Fenomena *task-switching* (berpindah antar tab/aplikasi) meningkatkan waktu pemulihan fokus (*attention residue*) setiap kali seseorang kembali ke tugas utama.
- Aplikasi pemblokir situs yang beredar umumnya hanya bekerja satu arah (di laptop saja), sehingga HP tetap menjadi jalur distraksi yang terbuka lebar.
- Extension/aplikasi blokir yang ada saat ini mudah dinonaktifkan sepihak tanpa hambatan psikologis maupun fisik yang berarti — tidak ada *cost* nyata untuk "curang".

### 2.2 Rumusan Masalah
1. Bagaimana menciptakan mekanisme yang membuat HP dan laptop saling mengunci status fokus, sehingga mematikan komitmen di satu perangkat memengaruhi perangkat lainnya secara langsung?
2. Bagaimana mengurangi kebutuhan pengguna untuk membuka tab/aplikasi lain dengan menyediakan kebutuhan belajar dasar (bahan bacaan + catatan) dalam satu layar?
3. Bagaimana menangani interupsi pikiran internal (ide mendadak, keinginan mengecek sesuatu) tanpa harus membuka HP atau tab baru?
4. Bagaimana memberi pengguna kendali granular atas aplikasi/website yang relevan dengan tugasnya, tanpa mengorbankan kecepatan pengembangan (mengingat keterbatasan API browser)?

### 2.3 Mengapa Tanpa AI
Pendekatan non-AI dipilih agar sistem 100% dapat diprediksi, ringan secara komputasi, dan tidak bergantung pada biaya API pihak ketiga — relevan untuk kebutuhan lomba yang menuntut solusi hemat biaya namun tetap secara teknis menantang (real-time system, sensor fusion, state management kompleks).

## 3. Tujuan & Sasaran (SMART Goals)

| Tujuan | Target Terukur | Tenggat |
|---|---|---|
| Bangun mekanisme pairing 2 perangkat | Pairing berhasil < 10 detik dari scan QR | Hari 4 |
| Bangun fullscreen lock + strike engine | 3-Strikes Rule berfungsi 100% pada uji manual | Hari 6 |
| Sediakan ruang kerja terintegrasi | PDF + editor berjalan tanpa reload, autosave < 3 detik delay | Hari 8 |
| Bangun sistem allow-list | Pengguna dapat CRUD allow-list dan preset default aktif otomatis | Hari 7 |
| Selesaikan MVP siap demo | Semua fitur inti terintegrasi & stabil | Hari 14 |
| Proposal lomba lengkap | Flowchart, ERD, dan narasi teknis final | Hari 13 |

## 4. Target Pengguna & Persona

### Persona 1 — "Dinda", Mahasiswa Tingkat Akhir
- Sedang mengerjakan skripsi, mudah tergoda membuka Instagram saat mentok mikir.
- Butuh ruang belajar yang "memaksa" fokus tanpa harus mengandalkan niat semata.
- Menggunakan laptop untuk menulis dan HP untuk riset — sering kali HP jadi jalan pintas ke media sosial.

### Persona 2 — "Bagas", Peserta Kompetisi/Olimpiade
- Belajar mandiri dengan modul PDF dan sering mencatat ringkasan.
- Ingin melacak konsistensi belajar hariannya secara visual (heatmap).
- Menghargai kendali penuh atas aplikasi apa yang boleh ia buka (mis. tetap butuh code editor untuk latihan soal pemrograman).

## 5. Ruang Lingkup

### 5.1 MVP (Wajib, selesai dalam 2 minggu — untuk demo lomba)
- Dual-Device Lock-In Protocol (QR pairing + deteksi posisi HP via sensor)
- Fullscreen Study Chamber (fullscreen lock, blur/tab-switch detection, 3-Strikes Rule)
- Split UI: PDF viewer + Zen Markdown editor
- 2-Minute Distraction Inbox
- TaskChunker 15 menit + poin reputasi + Contribution Heatmap (SVG)
- Allow-list Aplikasi & Website (versi MVP: deteksi domain browser + commitment self-report untuk aplikasi desktop)
- Autentikasi dasar & histori sesi
- Dashboard ringkasan progres (poin total, heatmap, riwayat sesi)

### 5.2 Stretch Goals (di luar 2 minggu, dicatat sebagai roadmap di proposal)
- Companion desktop (Electron/Tauri) untuk deteksi aplikasi aktif secara nyata (real app-monitoring via active window title)
- Statistik mingguan/bulanan & leaderboard sosial antar pengguna
- Mode grup/kolaborasi (belajar bareng dengan sinkronisasi sesi multi-user)
- Notifikasi push native (Web Push) saat sesi gagal atau saat waktu chunk 15 menit habis
- Integrasi kalender (Google Calendar) untuk penjadwalan sesi otomatis
- Export laporan progres ke PDF

### 5.3 Di Luar Cakupan (Out of Scope, ditegaskan agar ekspektasi jelas)
- Aplikasi mobile native (iOS/Android) — MVP sepenuhnya web-based (PWA-ready)
- Sistem pembayaran/monetisasi
- Moderasi konten sosial (karena tidak ada fitur sosial di MVP)

## 6. Fitur & Spesifikasi Fungsional

### F1. Dual-Device Lock-In Protocol

**User Story:** Sebagai pengguna, saya ingin memasangkan HP saya dengan laptop melalui QR Code, sehingga status "HP diletakkan menghadap bawah" dapat mengunci sesi fokus saya di laptop.

**Acceptance Criteria:**
- QR Code ditampilkan di Chamber UI berisi URL unik `/anchor/{session_token}`.
- Setelah dipindai dan halaman Device Anchor terbuka, status di laptop berubah dari `PAIRING` menjadi `READY`.
- Pengguna menekan tombol "Mulai Sesi" di laptop hanya bisa aktif setelah status `READY`.
- Saat HP diletakkan menghadap ke bawah dan diam (dideteksi sensor) selama > 2 detik, status berubah menjadi `ANCHORED` dan sesi otomatis masuk `FOCUSING`.
- Saat HP diangkat/dibalik selagi `FOCUSING`, event `PHONE_LIFTED` dikirim, laptop menampilkan overlay peringatan + alarm audio, dan strike bertambah 1.

**Detail Teknis:**
- `session_token`: UUID v4, disimpan di tabel `sessions`, kedaluwarsa otomatis jika `PAIRING` lebih dari 5 menit tanpa Device Anchor terhubung.
- Sensor: `DeviceOrientationEvent` (beta/gamma untuk mendeteksi permukaan menghadap bawah), `AmbientLightSensor` (opsional, fallback jika tidak tersedia/tidak diizinkan pengguna).
- Threshold orientasi: `beta` mendekati 180° atau -180° (tergantung kalibrasi device) dianggap "menghadap bawah"; ditoleransi ±15°.
- Realtime channel: 1 channel per `session_token` dengan 2 partisipan (`role: desktop`, `role: mobile`).

**Edge Case:**
- HP tidak mendukung `DeviceOrientationEvent` (jarang, browser lama) → tampilkan pesan error dan sarankan browser lain.
- Pengguna menutup tab Device Anchor tanpa mengangkat HP → sistem mendeteksi disconnect via Presence channel dan memperlakukan sebagai `PHONE_LIFTED` setelah timeout 5 detik.
- Koneksi internet HP terputus sementara → beri grace period 5 detik sebelum dianggap pelanggaran (menghindari false positive).

---

### F2. Fullscreen Study Chamber

**User Story:** Sebagai pengguna, saya ingin layar laptop saya otomatis masuk mode fullscreen dan terkunci dari perpindahan tab, sehingga saya tidak tergoda membuka aplikasi lain.

**Acceptance Criteria:**
- Saat status sesi menjadi `FOCUSING`, `document.documentElement.requestFullscreen()` dipanggil otomatis.
- Event `visibilitychange`, `window.onblur`, dan `fullscreenchange` masing-masing dipantau; setiap pelanggaran menambah `strike_count` sebesar 1.
- Saat `strike_count` mencapai 1 atau 2 → status `STRIKE_WARN`, tampilkan overlay peringatan dengan sisa strike.
- Saat `strike_count` mencapai 3 → status `FAILED`, sesi dihentikan, hasil disimpan ke histori.
- Pengguna dapat menyelesaikan sesi secara sukarela (tombol "Selesaikan Sesi") → status `SUCCESS` jika `strike_count` < 3.

**Detail Teknis:**
- State machine disimpan di Zustand/Context (frontend) dan disinkronkan ke Supabase hanya pada perubahan status penting (debounced write) untuk menghemat kuota database.
- Audio alarm menggunakan `HTMLAudioElement` dengan file pendek (< 2 detik) agar tidak mengganggu berlebihan namun tetap terasa sebagai "hukuman".

**Edge Case:**
- Browser tidak mendukung Fullscreen API (jarang) → fallback ke mode "simulated fullscreen" (CSS `position: fixed; inset: 0`) dengan disclaimer ke pengguna.
- Pengguna menekan `Esc` untuk keluar fullscreen (perilaku native browser tidak selalu bisa dicegah) → dianggap sebagai `fullscreenchange` violation dan tetap menambah strike.

---

### F3. Integrated Micro-Learning Sandbox & Zen Editor

**User Story:** Sebagai pengguna, saya ingin membaca modul PDF dan mencatat poin penting dalam satu layar yang sama, sehingga saya tidak punya alasan berpindah tab.

**Acceptance Criteria:**
- Panel kiri menampilkan PDF yang diunggah pengguna (drag-and-drop atau pilih file) menggunakan PDF.js, mendukung scroll & zoom.
- Panel kanan adalah editor Markdown dengan live preview opsional.
- Menekan tombol/ikon "Zen Mode" menyembunyikan seluruh UI kecuali area ketik; menekan `Esc` atau tombol kecil di pojok mengembalikan UI penuh.
- Catatan otomatis tersimpan (autosave) setiap 5 detik idle atau setiap 200 karakter perubahan, dengan indikator kecil "Tersimpan".

**Detail Teknis:**
- File PDF disimpan sementara di sisi klien (tidak diunggah ke server pada MVP) menggunakan `URL.createObjectURL` untuk menghindari kebutuhan storage besar; opsional upload ke Supabase Storage sebagai stretch goal.
- Catatan Markdown disimpan di tabel `notes` terkait `session_id`.

**Edge Case:**
- File PDF berukuran besar (>20MB) → tampilkan peringatan performa sebelum memuat.
- Pengguna membuka sesi baru tanpa mengunggah PDF → panel kiri menampilkan state kosong dengan CTA unggah, tidak memblokir penggunaan editor.

---

### F4. 2-Minute Distraction Inbox

**User Story:** Sebagai pengguna, saya ingin mencatat ide/gangguan pikiran yang muncul tiba-tiba tanpa harus membuka HP, sehingga saya bisa kembali fokus dengan cepat.

**Acceptance Criteria:**
- Shortcut `Ctrl+I` (atau `Cmd+I` di Mac) membuka modal input kecil di atas layar kerja tanpa keluar dari fullscreen.
- Teks yang diketik disimpan ke `localStorage` dengan kunci terenkripsi sederhana (base64 minimal, bukan untuk keamanan tinggi, hanya mencegah akses tidak sengaja) dan **tidak ditampilkan kembali** sampai sesi berakhir.
- Setelah sesi berakhir (`SUCCESS` atau `FAILED`), pengguna diarahkan ke halaman "Distraction Review" berisi semua catatan yang terkumpul selama sesi tersebut.

**Detail Teknis:**
- Struktur `localStorage`: key `distraction_inbox_{session_id}`, value array of `{ id, content, created_at }`.
- Saat sesi berakhir, data dari `localStorage` disinkronkan ke tabel `distraction_notes` di Supabase lalu dibersihkan dari `localStorage`.

**Edge Case:**
- Pengguna menutup browser paksa sebelum sesi berakhir → data tetap ada di `localStorage` dan disinkronkan saat pengguna membuka aplikasi kembali (deteksi sesi `FOCUSING` yang belum ditutup → tandai `FAILED` otomatis akibat disconnect, lalu sinkronkan inbox).

---

### F5. TaskChunker & Visual Consistency Grid

**User Story:** Sebagai pengguna, saya ingin memecah tugas besar menjadi bagian 15 menit dan melihat riwayat konsistensi belajar saya dalam bentuk grafik, sehingga saya termotivasi menjaga rutinitas.

**Acceptance Criteria:**
- Pengguna dapat menambah beberapa sub-tugas sebelum/selama sesi, masing-masing berdurasi default 15 menit (dapat diubah 5–30 menit).
- Setiap sub-tugas memiliki timer visual; saat selesai ditandai manual oleh pengguna atau otomatis saat timer habis dan dikonfirmasi.
- Setiap sub-tugas selesai menambah poin reputasi (`+10` poin per chunk selesai, dapat dikonfigurasi di konstanta backend).
- Halaman Dashboard menampilkan Contribution Heatmap (grid harian, warna hijau intensitas berdasarkan jumlah sesi sukses per hari, merah untuk hari dengan sesi gagal dominan).

**Detail Teknis:**
- Perhitungan poin dilakukan di sisi backend (Supabase Edge Function atau kalkulasi saat insert) agar tidak dimanipulasi dari klien.
- Heatmap dirender dengan SVG murni (grid `<rect>` 7 kolom x N minggu) berdasarkan agregasi harian dari tabel `heatmap_logs`.

**Edge Case:**
- Pengguna menyelesaikan chunk lebih cepat dari 15 menit (menandai selesai manual) → tetap dihitung sukses namun dicatat `actual_duration` berbeda dari `planned_duration` untuk analitik jujur (tidak memengaruhi poin di MVP).

---

### F6. Allow-list Aplikasi & Website

**User Story:** Sebagai pengguna, saya ingin menentukan aplikasi dan website apa saja yang boleh saya buka selama sesi fokus, sehingga saya tetap bisa menggunakan alat kerja penting (mis. code editor) tanpa dianggap melanggar.

**Acceptance Criteria:**
- Halaman Settings → "Focus Allow-list" menampilkan dua daftar: Aplikasi Desktop dan Website, masing-masing dengan status Diizinkan/Tidak Diizinkan.
- Sistem menyediakan preset default saat akun pertama kali dibuat (lihat tabel di bawah).
- Pengguna dapat: menambah item baru, mengubah status izin, menghapus item, dan mengembalikan ke preset default (tombol "Reset ke Default").
- Perubahan tersimpan otomatis (per toggle) ke tabel `focus_allowlist`.
- Selama sesi `FOCUSING`, jika pengguna berpindah ke tab/domain baru dalam browser yang sama, sistem mencocokkan domain terhadap allow-list:
  - Jika domain ada di daftar "Diizinkan" → tidak ada strike.
  - Jika domain tidak ada di daftar (atau eksplisit "Tidak Diizinkan") → strike bertambah + overlay peringatan menampilkan nama domain yang terdeteksi.
- Untuk aplikasi desktop non-browser, sistem menampilkan overlay self-report saat terjadi `window.onblur` yang tidak berasal dari perpindahan tab browser (asumsi: pengguna beralih ke aplikasi lain), meminta konfirmasi jujur "Aplikasi apa yang kamu buka?" dengan pilihan cepat dari allow-list pengguna.

**Preset Default (contoh isi awal):**

| Kategori | Nama | Status Default |
|---|---|---|
| Website | github.com | Diizinkan |
| Website | docs.google.com | Diizinkan |
| Website | scholar.google.com | Diizinkan |
| Website | developer.mozilla.org | Diizinkan |
| Website | notion.so | Diizinkan |
| Website | youtube.com | Tidak Diizinkan |
| Website | instagram.com | Tidak Diizinkan |
| Website | tiktok.com | Tidak Diizinkan |
| Website | x.com / twitter.com | Tidak Diizinkan |
| Aplikasi | Visual Studio Code | Diizinkan |
| Aplikasi | Notion Desktop | Diizinkan |
| Aplikasi | Zotero / Mendeley | Diizinkan |
| Aplikasi | Game launcher (Steam, dll) | Tidak Diizinkan |
| Aplikasi | Aplikasi chat non-esensial | Tidak Diizinkan |

**Detail Teknis:**
- Deteksi domain browser menggunakan kombinasi `document.title`/`location.hostname` pada tab aktif FocuSync itu sendiri (mendeteksi ketika pengguna berpindah **dari** FocuSync ke tab lain lewat `visibilitychange`), **bukan** membaca isi tab lain (keterbatasan browser security model) — sehingga sistem tahu "pengguna pergi" namun tidak selalu tahu pasti "ke mana", kecuali pengguna membuka tab baru dari dalam FocuSync sendiri (mis. tautan referensi) yang bisa dilacak penuh.
- Untuk kasus pengguna membuka tab baru secara manual di luar kendali FocuSync, sistem **tidak bisa 100% mengetahui domain tujuan** — ini dijelaskan sebagai batasan teknis (lihat Bagian 13) dan disiasati dengan pendekatan self-report yang transparan ke pengguna, bukan diklaim sebagai penegakan otomatis penuh.

**Edge Case:**
- Pengguna menambahkan domain dengan format tidak valid → validasi input dasar (regex domain sederhana).
- Preset default diubah sistem di masa depan (versi baru) → perubahan preset tidak menimpa kustomisasi pengguna yang sudah ada (hanya berlaku untuk akun baru).

## 7. Tech Stack & Justifikasi (Prioritas: Cepat & Gratis)

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + Tailwind CSS + TypeScript** | Satu framework untuk web desktop & mobile, hot-reload cepat, deploy 1-klik, komunitas besar untuk lomba yang butuh iterasi cepat |
| State Management | **Zustand** | Ringan, minim boilerplate dibanding Redux, cocok untuk state machine sesi |
| Realtime Sync | **Supabase Realtime (Broadcast & Presence channel)** | Menggantikan server WebSocket custom (Golang/Node+Socket.io) yang butuh hosting terpisah; cukup pasang SDK di frontend, gratis di tier awal, tetap berbasis WebSocket di baliknya |
| Auth | **Supabase Auth** | Email/password + magic link siap pakai, tidak perlu membangun sistem auth dari nol |
| Database | **Supabase Postgres** | Postgres relasional sesuai kebutuhan skema poin/sesi/log, dashboard SQL bawaan, free tier cukup untuk demo lomba |
| PDF Rendering | **PDF.js** | Native, gratis, tanpa server tambahan |
| QR Code | **qrcode.react** (generate) + **jsQR / html5-qrcode** (scan di Device Anchor) | Library ringan, murni client-side |
| Heatmap/Chart | **SVG manual (custom component)** | Ringan, tanpa dependensi berat, mudah dikustomisasi warna |
| Hosting Frontend | **Vercel (Free/Hobby tier)** | Deploy otomatis dari GitHub, cocok untuk Next.js |
| Version Control | **GitHub** | Kolaborasi tim & backup progres lomba |
| Testing Manual | **Browser DevTools + device fisik** | Tidak perlu automated testing framework berat mengingat batas waktu 2 minggu |

**Kenapa tidak Golang/Node+Socket.io custom?** Membangun & men-deploy server WebSocket terpisah (perlu hosting seperti Render/Railway, cold-start, konfigurasi CORS/env tambahan) memakan waktu yang berharga di jendela 2 minggu. Supabase Realtime memberi hasil fungsional yang sama (sinkronisasi status sesi antar perangkat secara real-time) dengan waktu setup jauh lebih singkat dan tanpa biaya.

### 7.1 Struktur Folder (Usulan)

```
focusync/
├─ app/
│  ├─ (auth)/login/
│  ├─ (auth)/register/
│  ├─ dashboard/
│  ├─ session/[sessionId]/          # Chamber UI (desktop)
│  ├─ anchor/[sessionToken]/        # Device Anchor (mobile)
│  ├─ settings/allowlist/
│  └─ api/                          # Route handlers bila dibutuhkan
├─ components/
│  ├─ chamber/
│  ├─ anchor/
│  ├─ editor/
│  ├─ heatmap/
│  └─ allowlist/
├─ lib/
│  ├─ supabase/ (client & server helper)
│  ├─ state/ (Zustand store: sessionStore, allowlistStore)
│  └─ sensors/ (orientation.ts, lightSensor.ts)
├─ types/
└─ supabase/
   └─ migrations/
```

## 8. Arsitektur Sistem

```
[ Next.js Desktop (Chamber UI) ] <--Supabase Realtime Channel--> [ Next.js Mobile (Device Anchor) ]
            |                                                                |
            +---------------------- Supabase Postgres + Auth ----------------+
                                          |
                                 Supabase Storage (opsional, PDF)
```

### 8.1 Sequence Diagram (Teks) — Alur Pairing hingga Strike

```
User(Desktop)      Chamber UI        Supabase Realtime      Device Anchor      Sensor HP
     |-- buka dashboard -->|                  |                    |               |
     |                     |-- create session (PAIRING) --> DB     |               |
     |                     |-- subscribe channel(token) -->|       |               |
     |<-- tampilkan QR ----|                  |                    |               |
     |-- scan QR (HP) ---------------------------------------------|-- buka /anchor/token
     |                     |                  |<-- subscribe channel(token) -------|
     |                     |<== event: MOBILE_JOINED ======|                       |
     |<-- status: READY ---|                  |                    |               |
     |-- klik "Mulai" ---->|-- update status FOCUSING --> DB       |               |
     |                     |== broadcast: SESSION_FOCUSING =======>|               |
     |                     |                  |                    |-- baca sensor--|
     |                     |                  |<== event: ANCHORED ================|
     |<-- fullscreen aktif-|                  |                    |               |
     ...
     |                     |                  |                    |<-- HP diangkat-|
     |                     |<== event: PHONE_LIFTED ================|              |
     |<-- overlay strike --|-- update strike_count --> DB           |              |
```

### 8.2 State Machine Sesi

```
IDLE -> PAIRING -> READY -> FOCUSING -> STRIKE_WARN -> SUCCESS
                                |             |
                                +-------------+--> FAILED
```

Transisi detail:
- `IDLE -> PAIRING`: pengguna membuka halaman sesi baru, `session_token` dibuat.
- `PAIRING -> READY`: Device Anchor berhasil subscribe ke channel yang sama.
- `READY -> FOCUSING`: pengguna menekan "Mulai Sesi" DAN HP dalam posisi `ANCHORED`.
- `FOCUSING -> STRIKE_WARN`: pelanggaran ke-1 atau ke-2 terjadi (blur/tab-switch/phone lifted/allowlist violation).
- `STRIKE_WARN -> FOCUSING`: pengguna kembali fokus tanpa pelanggaran baru dalam 10 detik (opsional, untuk UX yang tidak terlalu keras).
- `STRIKE_WARN -> FAILED`: pelanggaran ke-3 terjadi.
- `FOCUSING/STRIKE_WARN -> SUCCESS`: pengguna menekan "Selesaikan Sesi" secara sukarela.

## 9. Skema Database (DDL Lengkap)

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_token uuid unique not null default gen_random_uuid(),
  status text not null default 'IDLE'
    check (status in ('IDLE','PAIRING','READY','FOCUSING','STRIKE_WARN','SUCCESS','FAILED')),
  strike_count int not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create table distraction_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  unlocked_at timestamptz
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  title text not null,
  planned_duration_minutes int not null default 15,
  actual_duration_minutes int,
  is_done boolean default false,
  points_awarded int default 0,
  created_at timestamptz default now()
);

create table focus_allowlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('app','website')),
  name text not null,
  is_allowed boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz default now()
);

create table allowlist_violations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  detected_name text,
  type text check (type in ('app','website')),
  is_self_reported boolean default false,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  content_markdown text,
  updated_at timestamptz default now()
);

create table heatmap_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  log_date date not null,
  sessions_success int not null default 0,
  sessions_failed int not null default 0,
  total_points int not null default 0,
  unique (user_id, log_date)
);
```

**Catatan Row-Level Security (RLS):** setiap tabel yang memuat `user_id` atau relasi ke `sessions.user_id` diaktifkan RLS di Supabase agar pengguna hanya bisa membaca/menulis datanya sendiri.

## 10. Desain API (Ringkasan Endpoint & Realtime Event)

### 10.1 REST-like (via Supabase client, tidak perlu backend custom)
| Aksi | Tabel/Fungsi | Keterangan |
|---|---|---|
| Buat sesi baru | `insert sessions` | Dipicu saat buka halaman Chamber UI baru |
| Update status sesi | `update sessions` | Dipicu oleh state machine frontend |
| CRUD allow-list | `select/insert/update/delete focus_allowlist` | Halaman Settings |
| Simpan distraction notes | `insert distraction_notes` (bulk) | Setelah sesi berakhir |
| CRUD tasks | `select/insert/update tasks` | Selama sesi berlangsung |
| Autosave notes | `upsert notes` | Debounced setiap 5 detik |
| Ambil data heatmap | `select heatmap_logs where user_id=...` | Halaman Dashboard |

### 10.2 Realtime Channel Events (Supabase Broadcast, per `session_token`)
| Event | Pengirim | Penerima | Payload |
|---|---|---|---|
| `MOBILE_JOINED` | Device Anchor | Chamber UI | `{ role: 'mobile' }` |
| `SESSION_FOCUSING` | Chamber UI | Device Anchor | `{ status: 'FOCUSING' }` |
| `ANCHORED` | Device Anchor | Chamber UI | `{ orientation: {...} }` |
| `PHONE_LIFTED` | Device Anchor | Chamber UI | `{ timestamp }` |
| `STRIKE_UPDATE` | Chamber UI | Device Anchor | `{ strike_count }` |
| `SESSION_ENDED` | Chamber UI | Device Anchor | `{ status: 'SUCCESS'|'FAILED' }` |

## 11. Non-Functional Requirements

- **Performa:** latensi sinkronisasi status HP↔laptop < 1 detik pada jaringan wajar (4G/Wi-Fi standar).
- **Ketersediaan Sensor:** aplikasi tetap dapat digunakan (graceful degradation) bila Ambient Light Sensor tidak didukung browser (fallback ke orientation saja); bila kedua sensor tidak tersedia, tampilkan mode "Manual Anchor" (pengguna menekan tombol konfirmasi di HP sebagai pengganti sensor).
- **Kompatibilitas Browser:** diuji minimal di Chrome & Edge desktop (untuk Fullscreen API penuh) serta Chrome Android (untuk sensor HP); Safari/iOS dicatat sebagai limitasi (Ambient Light Sensor tidak didukung).
- **Keamanan:** RLS aktif di seluruh tabel Supabase; `session_token` di-generate sebagai UUID acak agar tidak mudah ditebak.
- **Responsif:** Chamber UI dioptimalkan desktop (≥1024px), Device Anchor dioptimalkan mobile (≤480px).
- **Aksesibilitas Dasar:** kontras warna dark mode memenuhi rasio minimum WCAG AA untuk teks utama.

## 12. Alur Pengguna (User Flow) Rinci

1. **Registrasi/Login** → pengguna membuat akun via email/password.
2. **Dashboard** → melihat ringkasan poin, heatmap, dan tombol "Mulai Sesi Baru".
3. **Setup Sesi** → (opsional) mengunggah PDF, menambah sub-tugas TaskChunker, meninjau/mengubah allow-list.
4. **Pairing** → QR ditampilkan, HP memindai, status berubah `READY`.
5. **Mulai Fokus** → HP diletakkan terbalik, laptop masuk fullscreen, status `FOCUSING`.
6. **Sesi Berjalan** → pengguna membaca PDF/mencatat, menyelesaikan chunk tugas, sesekali menekan `Ctrl+I` untuk mencatat distraksi.
7. **(Kondisional) Pelanggaran** → overlay peringatan muncul, strike bertambah; jika allow-list terlanggar, nama domain/app ditampilkan.
8. **Sesi Selesai** → status `SUCCESS`/`FAILED`, poin & heatmap diperbarui, distraction notes terbuka untuk direview.
9. **Review** → pengguna melihat ringkasan sesi (durasi efektif, jumlah strike, chunk selesai, catatan distraksi).

## 13. Batasan & Asumsi

1. Tanpa AI, seluruh logika berbasis event listener, state machine, dan kalkulasi sederhana.
2. **Batasan Allow-list Aplikasi:** browser (web app) tidak memiliki akses untuk mendeteksi atau memblokir aplikasi native lain di OS pengguna, maupun mengetahui domain persis dari tab lain yang dibuka pengguna di luar kendali FocuSync (keterbatasan model keamanan browser modern). Penegakan penuh (real app-monitoring) membutuhkan companion desktop terpisah (Electron/Tauri) yang **di luar cakupan MVP 2 minggu** dan dicatat sebagai roadmap lanjutan.
3. Ambient Light Sensor API belum didukung di semua browser (mis. Safari/iOS) — perlu fallback UX yang dijelaskan ke juri, disiasati dengan mode "Manual Anchor".
4. Demo lomba mengasumsikan koneksi internet stabil untuk kedua perangkat; grace period 5 detik diberikan untuk menghindari false positive akibat jaringan tidak stabil.
5. File PDF pada MVP diproses di sisi klien saja (tidak diunggah permanen ke server), sehingga tidak persisten lintas perangkat/sesi kecuali diaktifkan Supabase Storage sebagai pengembangan lanjutan.

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sensor HP tidak konsisten antar merk/browser | Deteksi `ANCHORED` gagal/salah | Sediakan mode "Manual Anchor" sebagai fallback + threshold toleransi orientasi |
| Free tier Supabase mencapai limit saat demo | Realtime/DB gagal saat presentasi | Pantau kuota H-1 demo, siapkan akun cadangan |
| Waktu 2 minggu terlalu ketat untuk semua fitur | Fitur tidak selesai | Prioritas jelas (lihat Catatan Prioritas di Task List): fitur inti didahulukan, allow-list domain disederhanakan bila perlu |
| Keterbatasan deteksi allow-list disalahpahami sebagai bug | Ekspektasi juri tidak sesuai realita teknis | Jelaskan secara eksplisit di proposal & saat demo sebagai batasan API browser, bukan kekurangan implementasi |
| Perangkat demo bermasalah saat presentasi | Demo gagal | Siapkan device cadangan (HP & laptop kedua) + rekaman video demo sebagai cadangan |

## 15. Metrik Keberhasilan (KPI)

| Metrik | Target |
|---|---|
| Keberhasilan demo end-to-end tanpa error kritis | 100% (gladi bersih minimal 2x) |
| Waktu setup sesi (buka web → mulai fokus) | < 30 detik |
| Akurasi deteksi `ANCHORED`/`PHONE_LIFTED` pada uji manual | ≥ 90% |
| Kelengkapan proposal (flowchart, ERD, narasi) | 100% sebelum Hari 14 |
| Jumlah fitur inti MVP yang berfungsi saat demo | 6 dari 6 fitur (F1–F6) |

## 16. Glosarium

- **Chamber UI**: antarmuka web di laptop tempat sesi fokus utama berlangsung.
- **Device Anchor**: antarmuka web di HP yang berfungsi sebagai "jangkar" fisik sesi fokus.
- **Strike**: penanda pelanggaran komitmen fokus (blur, tab-switch, HP diangkat, allow-list terlanggar).
- **Chunk**: satuan sub-tugas 15 menit dalam TaskChunker.
- **Allow-list**: daftar aplikasi/website yang diizinkan/tidak diizinkan dibuka selama sesi fokus.
- **Self-report**: mekanisme pelaporan jujur oleh pengguna sendiri saat sistem tidak dapat mendeteksi aplikasi desktop secara teknis.
