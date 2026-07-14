# Task List Rinci — FocuSync (Rencana 14 Hari)

Tech stack acuan: Next.js + Tailwind + TypeScript, Zustand, Supabase (Auth, Postgres, Realtime), Vercel, PDF.js, qrcode.react/html5-qrcode.
Target: MVP siap demo lomba pada akhir Hari 14, plus proposal & materi presentasi lengkap.
Asumsi tim: 2–3 orang (bisa dibagi Frontend Chamber, Frontend Anchor/Mobile, Backend/DB — sesuaikan bila solo).

Setiap fase dilengkapi **Definition of Done (DoD)** agar progres terukur jelas, bukan sekadar "sudah dikerjakan".

---

## Hari 1 — Fondasi Proyek

**Pagi**
- [x] Buat repo GitHub (branch strategy: `main` + `dev`, PR wajib review bila tim > 1 orang)
- [x] Inisialisasi project Next.js 14 (App Router) + TypeScript + Tailwind CSS
- [x] Setup ESLint + Prettier agar konsisten antar anggota tim
- [x] Buat project Supabase baru, catat `SUPABASE_URL` & `ANON_KEY` ke `.env.local`

**Siang**
- [x] Tulis DDL skema database (lihat PRD Bagian 9) dan jalankan sebagai migrasi awal di Supabase SQL Editor
- [x] Aktifkan Row-Level Security (RLS) dasar untuk tabel `sessions`, `tasks`, `focus_allowlist`, `notes`, `heatmap_logs`
- [x] Setup Supabase Realtime (aktifkan Broadcast & Presence pada project)
- [x] Konfigurasi warna dark mode di `tailwind.config` (`#121212`, `#1e1e1e`, aksen emerald `#10b981`)
- [x] Deploy awal (halaman placeholder) ke Vercel, pastikan pipeline auto-deploy dari `main` berjalan

**DoD Hari 1:** repo aktif, skema DB tervalidasi (bisa insert/select manual di Supabase Studio), deploy kosong berhasil tayang di URL Vercel.

---

## Hari 2 — Autentikasi & Kerangka Halaman

**Pagi**
- [x] Integrasi Supabase Auth: halaman `/login` dan `/register` (email/password)
- [x] Buat helper `lib/supabase/client.ts` dan `lib/supabase/server.ts`
- [x] Middleware/route guard: redirect ke `/login` bila belum autentikasi pada rute terproteksi

**Siang**
- [x] Buat kerangka halaman: `/dashboard`, `/session/[sessionId]` (Chamber UI), `/anchor/[sessionToken]` (Device Anchor), `/settings/allowlist`
- [x] Buat komponen layout dasar (Navbar, Sidebar/Bottom Nav mobile) sesuai dark mode
- [x] Trigger otomatis: saat user baru register, seed `focus_allowlist` dengan preset default (lihat PRD 6/F6)

**DoD Hari 2:** pengguna bisa register/login, diarahkan ke dashboard kosong, dan baris preset allow-list otomatis muncul di database untuk user baru.

---

## Hari 3–4 — Dual-Device Lock-In Protocol

**Hari 3 Pagi**
- [x] Buat fungsi `createSession()`: insert ke tabel `sessions` dengan status `PAIRING`, generate `session_token` (UUID)
- [x] Tampilkan QR Code di Chamber UI menggunakan `qrcode.react`, isi URL `/anchor/{session_token}`
- [x] Buat channel Supabase Realtime dengan nama unik berbasis `session_token`, subscribe dari Chamber UI

**Hari 3 Siang**
- [x] Buat halaman Device Anchor: baca `session_token` dari URL, subscribe ke channel yang sama, kirim event `MOBILE_JOINED`
- [x] Chamber UI: dengarkan event `MOBILE_JOINED` → update status sesi ke `READY`, tampilkan tombol "Mulai Sesi" aktif

**Hari 4 Pagi**
- [x] Implementasi `DeviceOrientationEvent` di Device Anchor: hitung nilai `beta`/`gamma`, tentukan threshold "menghadap bawah & diam" (±15°, stabil > 2 detik)
- [x] Implementasi fallback `AmbientLightSensor` (deteksi `isSupported`, minta izin, fallback diam-diam jika ditolak/tidak didukung)
- [x] Buat mode "Manual Anchor" (tombol konfirmasi manual) sebagai fallback total jika kedua sensor tidak tersedia

**Hari 4 Siang**
- [x] Kirim event `ANCHORED` saat posisi terpenuhi, Chamber UI menerima dan mengubah status ke `FOCUSING` (jika tombol "Mulai" sudah ditekan)
- [x] Kirim event `PHONE_LIFTED` saat posisi berubah selama `FOCUSING`, dengan grace period 5 detik sebelum dianggap pelanggaran nyata
- [x] Uji coba pairing end-to-end menggunakan 2 device fisik (HP asli + laptop), catat isu kalibrasi sensor per merk HP yang diuji

**DoD Hari 3–4:** pairing QR berfungsi < 10 detik, status sinkron dua arah teruji di jaringan Wi-Fi kampus/rumah, event `ANCHORED`/`PHONE_LIFTED` terverifikasi manual minimal 5 kali percobaan berturut-turut tanpa gagal.

---

## Hari 5–6 — Fullscreen Study Chamber & Strike Engine

**Hari 5 Pagi**
- [x] Implementasi `requestFullscreen()` otomatis saat status berubah ke `FOCUSING`
- [x] Setup Zustand store `sessionStore`: `status`, `strikeCount`, `history[]`
- [x] Pasang listener `visibilitychange` dan `window.onblur`, hubungkan ke fungsi `addStrike(reason)`

**Hari 5 Siang**
- [x] Pasang listener `fullscreenchange` (deteksi keluar fullscreen manual/`Esc`)
- [x] Bangun state machine penuh sesuai PRD Bagian 8.2 (`IDLE→PAIRING→READY→FOCUSING→STRIKE_WARN→SUCCESS/FAILED`)
- [x] Buat komponen overlay peringatan strike (menampilkan sisa strike, alasan pelanggaran)

**Hari 6 Pagi**
- [x] Implementasi 3-Strikes Rule: strike ke-3 memicu status `FAILED`, keluar fullscreen otomatis, simpan `ended_at`
- [x] Tambahkan audio alarm singkat (< 2 detik) saat status `STRIKE_WARN`
- [x] Tombol "Selesaikan Sesi" manual → status `SUCCESS`, simpan `ended_at`

**Hari 6 Siang**
- [x] Sinkronkan `strike_count` dan `status` sesi ke tabel `sessions` (debounced write, hindari spam update)
- [x] Broadcast event `STRIKE_UPDATE` dan `SESSION_ENDED` ke Device Anchor agar HP juga tahu status akhir
- [x] Uji skenario: buka tab baru, minimize window, keluar fullscreen paksa — pastikan strike konsisten bertambah 1x per pelanggaran (tidak double-count)

**DoD Hari 5–6:** simulasi 3 pelanggaran berturut-turut menghasilkan status `FAILED` yang benar; sesi sukses tersimpan lengkap (durasi, strike, timestamp) di database.

---

## Hari 7 — Allow-list Aplikasi & Website

**Pagi**
- [x] Buat CRUD `focus_allowlist` (query Supabase langsung dari client dengan RLS aman)
- [x] Halaman Settings → Focus Allow-list: tabel dua kolom (Aplikasi / Website), toggle Diizinkan-Tidak Diizinkan, tombol tambah/hapus item
- [x] Tombol "Reset ke Default" mengembalikan daftar user ke preset awal (tanpa menghapus riwayat sesi lama)

**Siang**
- [x] Deteksi domain browser: saat `visibilitychange` terjadi dan tab FocuSync dibuka kembali, cek `document.referrer`/riwayat tab yang dibuka dari dalam aplikasi (bila terlacak) terhadap `focus_allowlist`
- [x] Bila domain tidak dikenali/di luar kendali FocuSync → tampilkan overlay self-report: "Kamu baru saja berpindah — aplikasi/situs apa yang kamu buka?" dengan pilihan cepat dari daftar allow-list + opsi "Lainnya"
- [x] Simpan setiap pelanggaran ke tabel `allowlist_violations` (tandai `is_self_reported: true` bila dari input manual)
- [x] Sinkronkan strike dari pelanggaran allow-list ke `strike_count` yang sama dengan strike enforcer F2

**DoD Hari 7:** pengguna dapat mengubah allow-list dan langsung berefek pada sesi berikutnya; simulasi pelanggaran allow-list tercatat di `allowlist_violations` dan menambah strike sesuai aturan.

---

## Hari 8 — Micro-Learning Sandbox & Zen Editor

**Pagi**
- [x] Integrasi PDF.js di panel kiri: upload file lokal (drag-and-drop + file picker), render dengan scroll & zoom dasar
- [x] Tangani file besar (>20MB) dengan peringatan performa sebelum render

**Siang**
- [x] Bangun editor Markdown di panel kanan (textarea + live preview toggle, atau live preview terintegrasi)
- [x] Implementasi Zen Mode: sembunyikan seluruh UI kecuali area ketik via toggle state + CSS
- [x] Implementasi autosave (debounce 5 detik idle / 200 karakter) ke tabel `notes`, tampilkan indikator "Tersimpan"

**DoD Hari 8:** pengguna dapat membaca PDF dan mengetik catatan bersamaan dalam satu layar fullscreen tanpa reload; catatan pulih saat sesi dibuka ulang (refresh browser dalam sesi yang sama).

---

## Hari 9 — 2-Minute Distraction Inbox

**Pagi**
- [x] Implementasi shortcut `Ctrl+I`/`Cmd+I` membuka modal input cepat tanpa keluar fullscreen
- [x] Simpan entri ke `localStorage` dengan key `distraction_inbox_{session_id}`, format array `{id, content, created_at}`

**Siang**
- [x] Pastikan entri **tidak dapat dibuka/dibaca kembali** selama sesi masih `FOCUSING`/`STRIKE_WARN`
- [x] Saat sesi berakhir (`SUCCESS`/`FAILED`), sinkronkan seluruh entri `localStorage` ke tabel `distraction_notes`, lalu bersihkan `localStorage`
- [x] Buat halaman "Distraction Review" pasca-sesi menampilkan daftar catatan yang terkumpul

**DoD Hari 9:** menekan `Ctrl+I` berfungsi mulus tanpa mengganggu fullscreen; catatan baru terlihat hanya setelah sesi selesai, teruji dengan minimal 3 entri per sesi simulasi.

---

## Hari 10 — TaskChunker & Contribution Heatmap

**Pagi**
- [x] CRUD sub-tugas (`tasks`): tambah tugas dengan durasi default 15 menit (bisa diubah 5–30 menit)
- [x] Timer visual per chunk (countdown), tombol "Tandai Selesai" manual

**Siang**
- [x] Kalkulasi poin reputasi saat chunk selesai (`+10` per chunk, konstanta di backend/kode agar tidak dimanipulasi klien)
- [x] Update agregat harian ke `heatmap_logs` setiap sesi berakhir (`sessions_success`, `sessions_failed`, `total_points`)
- [x] Bangun komponen Contribution Heatmap (SVG grid 7×N minggu) di halaman Dashboard, warna hijau/merah sesuai intensitas

**DoD Hari 10:** menyelesaikan beberapa chunk menambah poin secara akurat; heatmap menampilkan data dummy/nyata dengan warna yang berubah sesuai jumlah sesi per hari.

---

## Hari 11 — Integrasi Penuh & Polishing UI

- [x] Hubungkan seluruh alur end-to-end: Dashboard → Setup Sesi (upload PDF, tambah task, cek allow-list) → Pairing → Fullscreen → Sandbox+Inbox+TaskChunker berjalan bersamaan → Sesi berakhir → Review
- [x] Perbaikan responsivitas Device Anchor (mobile) — pastikan indikator status jelas (Pairing/Anchored/Lifted) dengan visual besar & mudah dibaca dari jarak agak jauh
- [x] Perbaikan micro-interaction: transisi antar status sesi, animasi overlay strike, indikator autosave
- [x] Review konsistensi warna, tipografi, dan spacing di seluruh halaman

**DoD Hari 11:** satu siklus penuh (dari login sampai review sesi) dapat dijalankan tanpa bug blocking oleh anggota tim yang belum pernah mencoba sebelumnya (uji "orang buta" internal).

---

## Hari 12 — Testing & Bug Fixing

- [x] Uji sensor Gyroscope/Orientation di minimal 2 merk HP berbeda (mis. Android besutan berbeda) dan catat kalibrasi yang perlu disesuaikan
- [x] Uji stabilitas koneksi Realtime: matikan Wi-Fi sesaat lalu nyalakan lagi, pastikan reconnect tidak merusak status sesi
- [x] Uji skenario 3-Strikes Rule dan allow-list di Chrome desktop + Chrome Android (kombinasi wajib), dan opsional di Edge/Firefox
- [x] Uji autosave editor & PDF.js dengan file PDF berukuran besar (>15MB) dan catatan panjang (>2000 karakter)
- [x] Uji edge case: menutup tab Device Anchor mendadak, menutup tab Chamber UI mendadak, refresh browser di tengah sesi `FOCUSING`
- [x] Perbaikan bug prioritas tinggi (blocking demo) terlebih dahulu, bug kosmetik menyusul bila waktu tersisa

**DoD Hari 12:** daftar bug kritis (blocking) = 0; bug minor dicatat di GitHub Issues untuk diprioritaskan di Hari 14 bila sempat.

---

## Hari 13 — Proposal Lomba & Materi Presentasi

- [x] Tulis Pendahuluan: data screen time & learning paralysis, rumusan masalah (acuan PRD Bagian 2)
- [x] Tulis Deskripsi Project & konsep ekosistem non-AI (acuan PRD Bagian 1 & 6)
- [x] Buat flowchart status sesi final (acuan PRD Bagian 8.2), gambar ulang dalam format rapi (Figma/draw.io/Excalidraw)
- [x] Buat diagram ERD dari skema database (acuan PRD Bagian 9)
- [x] Tulis bagian Implementasi & Pengujian: jelaskan pengujian event listener browser, fungsionalitas sensor Gyroscope HP, stabilitas Realtime, dan hasil testing Hari 12
- [x] Cantumkan batasan teknis allow-list aplikasi desktop secara transparan (acuan PRD Bagian 13) sebagai bagian dari kejujuran ilmiah proposal
- [x] Tulis bagian Risiko & Mitigasi serta Roadmap Stretch Goals (acuan PRD Bagian 5.2 & 14)
- [x] Siapkan slide presentasi (maks. 10–12 slide) & skrip demo langkah-per-langkah dengan estimasi waktu tiap bagian

**DoD Hari 13:** draft proposal lengkap siap direview, slide presentasi final, skrip demo tertulis dan sudah dibaca ulang minimal 1x oleh seluruh anggota tim.

---

## Hari 14 — Gladi Bersih & Buffer

- [ ] Deploy versi final ke Vercel + verifikasi seluruh environment variables production (Supabase URL/Key)
- [ ] Gladi bersih demo end-to-end skenario sukses (sesi selesai dengan `SUCCESS`)
- [ ] Gladi bersih demo skenario gagal/strike (sengaja memicu pelanggaran untuk menunjukkan strike engine)
- [ ] Gladi bersih demo fitur allow-list (menunjukkan kustomisasi & pelanggaran allow-list)
- [ ] Siapkan device cadangan (HP & laptop backup) yang sudah login & tersambung ke akun demo
- [ ] Rekam video demo cadangan (jaga-jaga bila demo langsung gagal karena jaringan venue lomba)
- [ ] Buffer waktu untuk bug kritis last-minute / revisi kecil proposal & slide

**DoD Hari 14:** tim dapat menjalankan demo penuh dua kali berturut-turut tanpa error blocking, video cadangan sudah ada, seluruh anggota tim tahu perannya masing-masing saat presentasi.

---

## Checklist Testing Ringkasan (Lintas Fase)

- [x] Pairing QR berhasil di kondisi jaringan normal & agak lambat (throttle 3G di DevTools)
- [x] Deteksi `ANCHORED`/`PHONE_LIFTED` stabil pada minimal 2 device HP berbeda
- [x] 3-Strikes Rule tidak pernah double-count dalam satu pelanggaran yang sama
- [x] Allow-list preset default muncul otomatis untuk akun baru
- [x] Autosave catatan & PDF tidak menyebabkan lag saat mengetik cepat
- [x] Distraction Inbox benar-benar terkunci selama sesi berlangsung
- [x] Heatmap menampilkan data akurat setelah beberapa sesi dummy dijalankan
- [x] Refresh browser di tengah sesi tidak merusak data (recovery state minimal: sesi ditandai `FAILED` dengan wajar)

---

## Catatan Prioritas (Jika Waktu Mepet)

**Boleh disederhanakan lebih dulu (stretch/nice-to-have):**
- Contribution Heatmap visual mewah → cukup versi grid sederhana tanpa animasi
- Deteksi domain allow-list otomatis di browser → boleh disederhanakan jadi self-report manual saja tanpa deteksi `visibilitychange` kompleks
- Live preview Markdown → cukup plain textarea tanpa rendering real-time
- Reset ke Default pada allow-list → bisa jadi fitur manual (hapus lalu tambah ulang) bila waktu sangat mepet

**Tidak boleh dikorbankan (inti demo):**
- Dual-Device Lock-In Protocol (F1)
- Fullscreen + 3-Strikes Rule (F2)
- Alur sesi end-to-end dari pairing sampai hasil akhir tersimpan
- Minimal satu bentuk allow-list yang berfungsi (boleh versi sederhana self-report)
