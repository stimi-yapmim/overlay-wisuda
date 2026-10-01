# ⚽ eFootball™ Lower Third - Mobile First Rundown Controller (Excel Powered)

Aplikasi grafis siaran langsung (Lower Third) bertema **eFootball™** yang didesain secara **Mobile-First**, dikontrol real-time via **WebSocket**, dan **rundown siaran langsung dibaca dari file Excel (`rundown.xlsx`)**.

---

## 🌟 Fitur Utama

1. **📊 Rundown Otomatis Dibaca dari File Excel (`rundown.xlsx`):**
   - File template `rundown.xlsx` tersedia langsung di folder proyek.
   - **Auto-Sync / File Watcher**: Setiap kali Anda mengedit dan menyimpan file `rundown.xlsx` di Microsoft Excel / LibreOffice / WPS, server langsung mendeteksi perubahan dan memperbarui tampilan di OBS serta Controller tanpa perlu me-restart server!
   - **Upload & Download via Mobile/Web**: Tersedia tombol **Upload** file Excel langsung dari HP/laptop, tombol **Reload**, serta tombol **Download** template Excel.
   - Format kolom fleksibel (mendukung bahasa Indonesia / Inggris):
     - `Judul` / `Title` / `Nama` (contoh: *MATCH 1: INDONESIA VS JEPANG*, *MUHAMMAD RIZKY*)
     - `Subtitle` / `Tim` / `Detail` (contoh: *Timnas Indonesia Esports • Top 10 Global*)
     - `Tag` / `Divisi` / `Rating` (contoh: *DIV 1*, *102 OVR*, *MATCHDAY*, *FINAL*)
     - `Platform` (contoh: *youtube*, *twitch*, *twitter*, *tiktok*, *instagram*)
     - `Sosmed` / `Handle` / `Username` (contoh: *@eFootballID*, *youtube.com/@channel*)

2. **🎬 Animasi IN & OUT Halus (Auto Transition):**
   - Ketika beralih dari satu cue rundown ke cue rundown lain saat live, grafis aktif lama **otomatis menjalankan animasi OUT** terlebih dahulu hingga bersih dari layar, lalu grafis baru **otomatis masuk dengan animasi IN** yang dinamis.

3. **📱 Desain Khusus Mobile-First (Thumb-Friendly):**
   - Dioptimalkan untuk layar smartphone dengan tombol jempol besar di bagian bawah:
     - 🔴 **TAMPILKAN**: Menayangkan grafis live ke OBS.
     - ⬛ **SEMBUNYIKAN**: Menutup grafis secara halus dengan animasi OUT.
     - ⏭️ **NEXT CUE**: Beralih ke item rundown berikutnya dan langsung menayangkannya.

4. **⚽ Tema Eksklusif eFootball™ Stadium:**
   - Sudut miring 14° (*slanted dynamic cut*).
   - Warna aksen **Volt Lime Neon** (`#d4ff00`) & **Deep Royal Blue** (`#001f70`).
   - Perisai rating dan lambang bola berputar halus.

5. **⏱️ Kontrol Manual Penuh (Tanpa Timer):**
   - Grafis tetap tayang sampai operator menekan SEMBUNYIKAN atau memilih rundown berikutnya.

---

## 🚀 Cara Menjalankan

Jalankan server secara lokal:
```bash
npm start
```
atau menggunakan **Docker**:
```bash
# Menggunakan Docker Compose (Direkomendasikan)
docker compose up -d

# Atau build dan run manual
docker build -t lower-third .
docker run -d -p 3000:3000 -v "${PWD}/rundown.xlsx:/app/rundown.xlsx" --name lower-third-app lower-third
```

Akses aplikasi:
- **📱 Mobile Controller:** [http://localhost:3000](http://localhost:3000) *(atau buka menggunakan IP LAN di HP: `http://192.168.x.x:3000`)*
- **🎥 OBS Browser Source Overlay:** [http://localhost:3000/overlay](http://localhost:3000/overlay)
- **📊 Download Template Excel:** [http://localhost:3000/rundown.xlsx](http://localhost:3000/rundown.xlsx)

---

## 📊 Cara Mengedit Rundown via Excel

1. Buka file [rundown.xlsx](file:///d:/Project/lower%20third/rundown.xlsx) di Excel / LibreOffice / Google Sheets.
2. Edit baris sesuai kebutuhan acara atau pertandingan Anda.
3. Tekan **Save** (`Ctrl + S`).
4. Selesai! Aplikasi secara otomatis memperbarui rundown ke semua perangkat controller HP dan OBS.
