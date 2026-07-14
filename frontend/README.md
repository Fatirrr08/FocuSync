# FocusSync Frontend Client Portal (Next.js 14 App Router)

Repositori ini berisi kode frontend, penataan gaya, dan interaksi visual untuk landing page **FocusSync** dan portal otentikasi pengguna. Project ini siap diserahkan kepada tim backend untuk proses integrasi API penuh.

---

## 🚀 Panduan Memulai Cepat (Local Development)

### 1. Instalasi Dependensi
Pastikan Anda menggunakan Node.js versi 18+ (sangat direkomendasikan). Jalankan perintah berikut di root folder proyek:
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin berkas template environment ke berkas lokal Anda:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan sesuaikan nilainya:
* `NEXT_PUBLIC_API_URL`: Mengarah ke port API server backend lokal Anda (misal `http://localhost:8080`).
* `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`: Kunci klien Midtrans Anda untuk integrasi payment gateway.

### 3. Jalankan Development Server
Jalankan dev server dengan perintah:
```bash
npm run dev
```
Aplikasi akan aktif di [http://localhost:3000](http://localhost:3000).

### 4. Build Produksi (Kompilasi)
Untuk melakukan verifikasi tipe data TypeScript, aturan linter, dan kompilasi static bundle untuk deployment:
```bash
npm run build
```

---

## 🛠️ Arsitektur API Proxy & CORS (Next.js Rewrites)

Untuk menghindari kendala **CORS (Cross-Origin Resource Sharing)** selama pengembangan lokal lintas port (misal frontend `:3000` ke backend `:8080`), Next.js telah dikonfigurasi dengan *Rewrites Proxy*.

Semua request dari frontend yang mengarah ke path relatif `/api/v1/...` akan otomatis di-forward oleh server Next.js ke port server backend yang tertera pada `NEXT_PUBLIC_API_URL` di berkas `.env.local`.

*Konfigurasi ini diatur dalam file:* [next.config.mjs](next.config.mjs).

---

## 📂 Struktur Folder Proyek

* `public/`: Menyimpan gambar statis, ikon (`FocuSync.svg`), dan aset publik yang dipanggil secara aman dengan absolute path relatif (misal `/FocuSync.svg`).
* `src/app/`: Mengatur struktur rute aplikasi Next.js (App Router):
  * `src/app/(auth)/login/`: Halaman masuk akun pengguna.
  * `src/app/(auth)/register/`: Halaman daftar akun baru.
  * `src/app/page.tsx`: Halaman landing page utama dengan simulator fokus terpadu.
* `src/components/`:
  * `@/components/layout/`: Switcher background halaman (`FuturisticBackground.tsx`).
  * `@/components/ui/`: Komponen interaktif kustom (Canvas `ChronosField`, 3D grid `HyperGrid`, kursor `CustomCursor`, tombol `FuturisticCta`, dll.).

---

## 📄 Kontrak Data API (Handoff Contract)

Fungsi pengiriman data form otentikasi di frontend telah di-refactor menggunakan arsitektur **Fetch API** asinkron dengan penanganan state *loading/disabled* dan umpan balik *toast notifications*.

### 1. Registrasi Akun (`POST /api/v1/auth/register`)
Form pendaftaran mengirimkan objek JSON berikut dari [register/page.tsx](src/app/(auth)/register/page.tsx):
```json
{
  "name": "Nama Lengkap",
  "email": "nama@email.com",
  "password": "PasswordKuat123!",
  "agreeToTerms": true
}
```

### 2. Masuk Akun (`POST /api/v1/auth/login`)
Form login mengirimkan objek JSON berikut dari [login/page.tsx](src/app/(auth)/login/page.tsx):
```json
{
  "email": "nama@email.com",
  "password": "PasswordKuat123!",
  "rememberMe": true
}
```

### 3. Simulator Sesi Fokus (`GET /api/v1/simulator/status` / WS)
Komponen simulator di landing page siap dihubungkan dengan WebSocket backend yang memancarkan payload real-time berikut:
```json
{
  "success": true,
  "data": {
    "connectionToken": "fs_conn_8f3a9e1d7c5b6a2e",
    "status": "ONLINE",
    "pairedDevice": {
      "deviceId": "mob_dev_991823ab",
      "deviceName": "iPhone 15 Pro",
      "orientation": "face-down",
      "isLocked": true
    },
    "session": {
      "isActive": true,
      "startTime": "2026-07-14T08:15:00.000Z",
      "elapsedSeconds": 360,
      "strikesCount": 1,
      "maxStrikes": 3
    }
  }
}
```
*Gaya UI kursor dan bias cahaya 3D grid sudah teruji 100% mulus (Zero Stuttering) pada monitor 144Hz.*
