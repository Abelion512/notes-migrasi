# ⚡ Perencanaan: Optimasi & UX

## 1. Optimasi Performa (Anti-Lag)
**Tujuan:** Aplikasi berjalan mulus di HP low-tier maupun high-tier.
- **Virtual Scrolling:** Hanya merender elemen DOM yang masuk dalam area viewport. Sangat penting untuk pengguna dengan ratusan catatan.
- **Lazy Loading Data:** Mengambil detail catatan dari IndexedDB hanya saat dibutuhkan.
- **Web Workers:** Memindahkan proses berat (seperti enkripsi/deskripsi massal) ke thread latar belakang agar UI tidak membeku.

## 2. Swipe Actions (iOS Style)
**Tujuan:** Navigasi cepat dan intuitif.
- **Default Behavior:**
  - **Swipe Kanan:** Pin/Unpin (Warna Biru).
  - **Swipe Kiri:** Hapus (Warna Merah) & Arsip (Warna Oranye).
- **Kustomisasi:** User dapat mengatur aksi apa yang muncul pada setiap arah swipe di menu Setelan.

## 3. Feedback Haptik & Animasi
- Penambahan animasi transisi antar halaman (slide/fade).
- Feedback visual yang lebih responsif saat tombol ditekan (active state yang lebih jelas).
