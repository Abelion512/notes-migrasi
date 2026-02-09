## 2026-02-14 - Penguatan Integritas Data dan Mitigasi XSS
**Vulnerability:** Logika verifikasi integritas yang rusak dan risiko XSS pada editor catatan.
**Learning:** Implementasi awal "Segel Digital" menyertakan metadata dinamis (_timestamp) ke dalam hash, sehingga verifikasi gagal saat data dimuat ulang. Editor catatan menggunakan `dangerouslySetInnerHTML` tanpa sanitisasi.
**Prevention:** Selalu hapus metadata dinamis sebelum menghitung hash integritas. Gunakan pustaka sanitisasi seperti DOMPurify untuk konten HTML yang dikontrol pengguna.
