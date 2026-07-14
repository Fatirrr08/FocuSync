# FocuSync — Backend Integration & Handoff Guide
*Dokumen Serah Terima Resmi Frontend ke Backend Developer (v1.0)*

Dokumen ini disusun sebagai panduan integrasi arsitektur Supabase (Auth, Database REST, Realtime, dan Postgres RLS/Trigger) untuk menyelaraskan codebase frontend Next.js 14 dengan sistem backend.

---

## 1. Pemetaan Modul State & Handler Siap API

Frontend telah mengisolasi logic state di Zustand dan menyediakan fungsi-fungsi mockup/wrapper di folder `src/lib/supabase/` yang siap dialihkan dari offline-fallback ke REST API/Auth Supabase asli dengan menyalakan variabel lingkungan (.env).

### A. Autentikasi Pengguna (Supabase Auth)
- **Komponen Login:** [login/page.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/app/(auth)/login/page.tsx)
- **Komponen Register:** [register/page.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/app/(auth)/register/page.tsx)
- **State Store:** [authStore.ts](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/state/authStore.ts)
- **Kesiapan Event Handler:**
  - Fungsi `handleLogin(email, password)` dan `handleRegister(email, password)` telah menangkap payload data bersih (*clean payload*):
    ```typescript
    // Data payload yang disiapkan untuk dikirim ke Supabase Auth:
    const payload = {
      email: email.trim().toLowerCase(),
      password: password
    };
    ```
  - Backend hanya perlu mengganti bypass interceptor/mocking instan dengan memanggil `supabase.auth.signInWithPassword()` pada client Supabase.

### B. Sinkronisasi Data REST & File Database Handler
Seluruh helper database REST telah diisolasi di folder [src/lib/supabase/](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/supabase/) dan siap digunakan:

1. **Upsert Notes (Autosave Debounced 5 Detik):**
   - **File Handler:** [notes.ts](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/supabase/notes.ts)
   - **Komponen Pemicu:** [ZenEditor.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/components/chamber/ZenEditor.tsx)
   - **Sistem:** Mengirimkan kueri `upsert` pada tabel `notes` menggunakan ID Sesi (`session_id`) dan `content`. Pengetikan cepat ditahan dengan debounce idle 5 detik sebelum mengirim payload untuk menghindari stuttering/lag visual saat user mengetik sambil membuka dokumen PDF di sebelah kiri.

2. **Manajemen Tugas (Task Chunks CRUD):**
   - **File Handler:** [tasks.ts](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/supabase/tasks.ts)
   - **Komponen Pemicu:** [TaskChunker.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/components/chamber/TaskChunker.tsx)
   - **Sistem:** Menyediakan fungsi `fetchSessionTasks()`, `createSessionTask()`, dan `completeSessionTask()`. Logic timer sub-tugas telah dikonfigurasi untuk memicu poin `+10 pts` secara otomatis setelah waktu habis (*countdown expiry*) dan memperbarui baris tugas pada database.

3. **Penyimpanan Distraksi Pasca-Sesi (Distraction Notes):**
   - **File Handler:** [distractions.ts](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/supabase/distractions.ts)
   - **Komponen Pemicu:** [DistractionInbox.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/components/chamber/DistractionInbox.tsx)
   - **Sistem:** Menampung input distraksi lokal selama sesi (terkunci), kemudian fungsi `syncDistractionNotes(sessionId)` dipicu saat sesi diakhiri untuk mendorong data secara massal ke database remote.

4. **Visualisasi Heatmap (Heatmap Logs):**
   - **File Handler:** [heatmap.ts](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/lib/supabase/heatmap.ts)
   - **Komponen Pemicu:** [page.tsx (Dashboard)](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/app/dashboard/page.tsx)
   - **Sistem:** Memanggil `fetchHeatmapLogs(userId)` untuk memetakan poin produktivitas harian user ke dalam grid SVG heatmap kontribusi.

---

## 2. Struktur Validasi Kontrak Realtime Broadcast & Presence

FocuSync menggunakan **Supabase Realtime Channels (Broadcast)** untuk interaksi tanpa jeda (*zero-delay*) antara Chamber UI (Laptop) dan Device Anchor (Mobile). 

### A. Subskripsi Saluran Dinamis
- **Chamber UI:** [page.tsx (Chamber)](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/app/session/%5BsessionId%5D/page.tsx) berlangganan ke channel `session-${sessionToken}`.
- **Device Anchor:** [page.tsx (Anchor)](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/app/anchor/%5BsessionToken%5D/page.tsx) berlangganan ke channel `session-${sessionToken}` yang sama.

### B. Validasi Payload Event Realtime
Penerima dan pengirim pada frontend telah diselaraskan dengan kontrak event berikut:

| Nama Event | Pengirim | Penerima | Skema Payload & Penjelasan |
|---|---|---|---|
| `MOBILE_JOINED` | Device Anchor | Chamber UI | `{ role: 'mobile' }` — Memicu status ruang belajar berpindah dari `PAIRING` ke `READY`. |
| `SESSION_FOCUSING` | Chamber UI | Device Anchor | `{ status: 'FOCUSING' }` — Memberitahukan ponsel bahwa sesi fokus telah dimulai secara fullscreen. |
| `ANCHORED` | Device Anchor | Chamber UI | `{ orientation: { alpha, beta, gamma } }` — Mengirimkan data sensor posisi awal penempatan ponsel. |
| `PHONE_LIFTED` | Device Anchor | Chamber UI | `{ timestamp: string }` — Dikirimkan jika gyroscope mendeteksi HP terangkat, memicu warning/strike di laptop. |
| `STRIKE_UPDATE` | Chamber UI | Device Anchor | `{ strikeCount: number }` — Sinkronisasi jumlah strike yang saat ini didapatkan ke layar ponsel. |
| `SESSION_ENDED` | Chamber UI | Device Anchor | `{ success: boolean }` — Mengakhiri sesi belajar pada kedua layar secara serentak. |

> [!IMPORTANT]
> Backend wajib mengaktifkan otorisasi **Realtime** di dasbor Supabase agar channel dinamis dapat beroperasi tanpa diblokir kebijakan CORS.

---

## 3. Kesiapan Pengamanan Rute & Database Seed (Konteks RLS)

### A. Route Guarding & Pembacaan Token Sesi
Keamanan rute front-end dijaga oleh [AuthGuard.tsx](file:///Users/fatirgibran/Kuliah/Focusync/frontend/src/components/layout/AuthGuard.tsx):
- Mengecek status otentikasi user via `supabase.auth.getSession()`.
- Mengamankan rute terproteksi (`/dashboard`, `/session`, `/settings/*`, `/distraction-review`) dan melewatkan rute publik (`/`, `/login`, `/register`, `/anchor/*`).
- Token JWT dari sesi terotentikasi otomatis disisipkan ke header kueri Supabase Client untuk diselaraskan dengan **Row-Level Security (RLS)** di postgres backend.

### B. PostgreSQL Row-Level Security (RLS) Checklist untuk Backend:
Backend wajib menulis query DDL berikut di PostgreSQL untuk tabel Supabase:
```sql
-- Contoh RLS pada tabel focus_allowlist:
ALTER TABLE focus_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna hanya dapat mengakses allowlist milik mereka sendiri"
ON focus_allowlist
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### C. Postgres Trigger untuk Default Seed Data
Untuk menginisialisasi setelan awal allow-list saat user baru pertama kali terdaftar, backend harus memasang trigger otomatis di skema `auth.users`:
```sql
-- 1. Buat fungsi seed trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_seed()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.focus_allowlist (user_id, name, type, allowed, created_at)
  VALUES 
    (new.id, 'github.com', 'website', true, now()),
    (new.id, 'youtube.com', 'website', false, now()),
    (new.id, 'Visual Studio Code', 'app', true, now()),
    (new.id, 'whatsapp.com', 'website', false, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Pasang trigger ke tabel auth.users
CREATE TRIGGER trigger_seed_allowlist_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_seed();
```

---

## 4. Draf Panduan Berkas Konfigurasi (.env.example & README)

### A. Berkas `.env.example` Resmi
Letakkan berkas `.env.example` berikut di root folder `frontend/`:
```env
# URL Dashboard Supabase Project Anda (API Settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon Public Key Supabase Project Anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### B. Ringkasan File `README.md` Setup Frontend
Tulis instruksi berikut pada file `README.md` di root frontend untuk tim backend:
```markdown
# FocuSync — Frontend Client

Aplikasi frontend berbasis Next.js 14 App Router, Tailwind CSS, dan Zustand Store.

## Langkah Instalasi & Pengembangan

1. **Instalasi Dependencies:**
   ```bash
   npm install
   ```

2. **Salin Variabel Lingkungan:**
   Buat file `.env.local` di root folder frontend dan isi dengan kredensial proyek Supabase:
   ```bash
   cp .env.example .env.local
   ```

3. **Jalankan Server Pengembangan Lokal:**
   ```bash
   npm run dev
   ```
   Akses aplikasi di: `http://localhost:3000`

4. **Validasi Kompilasi & Build Produksi:**
   Sebelum deploy ke Vercel, pastikan kode lulus audit type-checking dan linter:
   ```bash
   npm run build
   ```
```
