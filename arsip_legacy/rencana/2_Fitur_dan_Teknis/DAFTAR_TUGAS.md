# 📋 Daftar Tugas Abelion (Technical Backlog)

## ⚡ Performa & UX (Prioritas Tinggi)
- [ ] **Virtual Scrolling:** Implementasi list virtual untuk menangani 100+ catatan tanpa lag.
- [x] **Swipe Actions:** Logika deteksi geser pada card catatan dengan umpan balik visual.
- [x] **Incremental Loading:** Optimasi pembacaan database IndexedDB.

## ✍️ Editor & Ekspor
- [x] **Markdown Engine:** Integrasi parser Markdown yang ringan untuk preview real-time.
- [x] **PDF Generator:** Implementasi `jspdf` atau sejenisnya dengan template minimalis.
- [x] **DOCX Generator:** Implementasi `docx` library untuk ekspor dokumen.

## 🔐 Keamanan & Integrasi
- [x] **Integrations Page:** Pemisahan setelan Supabase & Notion ke halaman khusus yang modular.
- [x] **E2EE Core & Audit:** Penguatan alur enkripsi AES-GCM 256 dan audit penyimpanan kunci.
- [ ] **Supabase/Notion Logic:** Optimasi sinkronisasi dan keamanan token/API key.

## 🏆 Gamifikasi & Profil
- [x] **XP Chart Proximity:** Tooltip grafik tetap aktif tanpa harus presisi di titik data.
- [x] **Enhanced Leaderboard:** Validasi nama & jumlah catatan untuk masuk peringkat.
- [x] **3D Public Profile:** Profil dengan animasi 3D (Lottie/Three.js) & fallback low-end.

## 🚀 DevOps & Maintenance
- [x] **Update Automation:** Mekanisme deteksi versi baru.
- [x] **Update Popup:** UI notifikasi rincian pembaruan & tombol reload.
- [x] **Storage Manager:** Analisis kapasitas terpakai dan fitur "Clear Cache".

---
*Terakhir diperbarui: 7 Februari 2026*
