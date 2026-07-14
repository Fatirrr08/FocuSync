# FocuSync 🎯

> **Slogan:** Lock Your Screen, Lock Your Phone, Unlock Your Potential.
> 
> *FocuSync adalah ekosistem produktivitas fokus lintas perangkat (cross-device) berbasis web, non-AI, dan real-time yang menyinkronkan laptop (Chamber UI) dan handphone (Device Anchor) untuk menciptakan sesi belajar/kerja bebas distraksi.*

---

## 🚀 Gambaran Umum Proyek
FocuSync memanfaatkan API bawaan browser modern (Fullscreen API, Page Visibility API, DeviceOrientation API) serta mekanisme *behavioral psychology* seperti **2-Minute Distraction Inbox**, **TaskChunker**, dan **Focus Allow-list**. Ketika sesi fokus berjalan, pengguna dipaksa berkomitmen menjaga layar tetap terkunci penuh dan meletakkan HP menghadap ke bawah. Pelanggaran komitmen akan memicu sistem **3-Strikes Rule** yang disinkronkan secara real-time.

## 🛠️ Tech Stack & Ekosistem
* **Framework Frontend:** Next.js 14 (App Router) dengan TypeScript
* **Styling & Design System:** Tailwind CSS dengan kustomisasi tema gelap futuristik
* **State Management:** Zustand (ringan, untuk state machine sesi)
* **Realtime & Database:** Supabase Realtime (Broadcast & Presence) & Supabase Postgres dengan RLS (Row-Level Security)
* **Fitur Sandbox:** PDF.js (Client-side renderer) & qrcode.react

---

## 📂 Struktur Repositori (Monorepo)
Proyek ini diatur dalam struktur folder bersih yang memisahkan area kerja frontend, backend, dan dokumentasi inti:
* `frontend/` — Seluruh kode aplikasi Next.js 14, state store, dan komponen visual.
* `backend/` — Skema database DDL, arsitektur RLS, dan cetak biru trigger otomatis.
* `docs/` — Berkas *Source of Truth* proyek (`AGENTS.md`, `PRD-FocuSync (1).md`, `TaskList-FocuSync.md`, `progress_backend.md`).

---

## 💻 Panduan Instalasi & Pengembangan Lokal

### 1. Kloning Repositori
```bash
git clone [https://github.com/Fatirrr08/FocuSync.git](https://github.com/Fatirrr08/FocuSync.git)
cd FocuSync
