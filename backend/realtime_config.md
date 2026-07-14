# FocuSync — Realtime Broadcast API Contract

Dokumen ini mendokumentasikan kontrak event dan pemetaan payload JSON untuk **Supabase Realtime Broadcast** yang menghubungkan Chamber UI (Laptop) dengan Device Anchor (Mobile).

---

## 1. Konfigurasi Saluran (Channel Setup)
Saluran komunikasi bersifat dinamis berdasarkan **Token Sesi unik (`sessionToken`)** yang dihasilkan saat inisialisasi sesi di dashboard laptop.

*   **Format Saluran:** `session-${sessionToken}`
*   **Contoh Nama Saluran:** `session-token-1784017887060`
*   **Tipe Otorisasi:** Anonymous & Authenticated clients.

---

## 2. Pemetaan & Validasi Payload Event

Setiap pertukaran data broadcast di frontend wajib mematuhi skema payload berikut untuk menjamin validasi data di sisi client.

### A. MOBILE_JOINED
Dikirim oleh **Device Anchor** ketika browser ponsel pertama kali memuat URL pairing dan berhasil bergabung ke dalam channel realtime.
*   **Event Name:** `MOBILE_JOINED`
*   **Payload JSON Schema:**
    ```json
    {
      "role": "mobile"
    }
    ```
*   **Efek di Frontend:** Mengubah status sesi pada layar laptop dari `PAIRING` ke `READY`.

---

### B. SESSION_FOCUSING
Dikirim oleh **Chamber UI** ketika pengguna menekan tombol "Mulai Sesi Fokus" di laptop.
*   **Event Name:** `SESSION_FOCUSING`
*   **Payload JSON Schema:**
    ```json
    {
      "status": "FOCUSING"
    }
    ```
*   **Efek di Frontend:** Memaksa browser ponsel masuk ke mode kunci/layar pemantauan penuh (Device Anchor status active).

---

### C. ANCHORED
Dikirim oleh **Device Anchor** ketika sensor orientasi mendeteksi ponsel telah diletakkan menghadap ke bawah (*face-down*) secara stabil.
*   **Event Name:** `ANCHORED`
*   **Payload JSON Schema:**
    ```json
    {
      "orientation": {
        "alpha": 180.25,
        "beta": -1.42,
        "gamma": 0.05
      }
    }
    ```
*   **Efek di Frontend:** Memulai hitung mundur waktu fokus di laptop.

---

### D. PHONE_LIFTED
Dikirim oleh **Device Anchor** ketika gyroscope mendeteksi perubahan rotasi aksis yang signifikan (ponsel diangkat oleh pengguna).
*   **Event Name:** `PHONE_LIFTED`
*   **Payload JSON Schema:**
    ```json
    {
      "timestamp": "2026-07-14T12:15:30.000Z"
    }
    ```
*   **Efek di Frontend:** Memicu penalti peringatan (*Warning overlay*) di laptop dan menambah jumlah *strike*.

---

### E. STRIKE_UPDATE
Dikirim oleh **Chamber UI** jika laptop mendeteksi pelanggaran (tab blur/visibility hidden atau ponsel terangkat).
*   **Event Name:** `STRIKE_UPDATE`
*   **Payload JSON Schema:**
    ```json
    {
      "strikeCount": 2
    }
    ```
*   **Efek di Frontend:** Mengubah visualisasi indikator strike di layar ponsel secara real-time.

---

### F. SESSION_ENDED
Dikirim oleh **Chamber UI** ketika sesi selesai (berhasil mencapai target waktu atau gagal karena terkena 3 kali strike).
*   **Event Name:** `SESSION_ENDED`
*   **Payload JSON Schema:**
    ```json
    {
      "success": true
    }
    ```
    *(Gunakan `"success": false` jika diakhiri akibat strike > 3)*
*   **Efek di Frontend:** Mengarahkan kedua perangkat kembali ke layar hasil evaluasi secara serentak.

---

## 3. Langkah Aktivasi Realtime di Dasbor Supabase
Bagi tim Backend, ikuti langkah berikut di Supabase Console:
1. Masuk ke dasbor proyek Supabase.
2. Navigasi ke menu **Database** -> **Replication**.
3. Di bawah panel **Source**, pastikan opsi **Realtime** diaktifkan.
4. Buat publikasi kebijakan RLS khusus jika diperlukan untuk mengontrol pengiriman pesan dari klien non-authenticated.