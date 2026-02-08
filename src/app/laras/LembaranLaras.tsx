'use client';

import React, { useState, useEffect } from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import { ChevronRight, RefreshCw, ExternalLink, Trash2, Shield, Database } from 'lucide-react';
import ExportModal from '@/komponen/ExportModal';
import KonfirmasiModal from '@/komponen/KonfirmasiModal';

export default function LembaranLaras() {
  const { pengaturan, perbaruiPengaturan, catatan } = useAbelionStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: '0 KB', percent: 0 });

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0;
        const total = estimate.quota || 1;
        const percent = Math.min(100, (used / total) * 100);
        setStorageInfo({
          used: `${(used / 1024).toFixed(1)} KB`,
          percent
        });
      });
    }
  }, []);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const accentColors = [
    { name: 'Blue', value: '#007AFF' },
    { name: 'Green', value: '#34C759' },
    { name: 'Purple', value: '#AF52DE' },
    { name: 'Orange', value: '#FF9500' },
    { name: 'Red', value: '#FF3B30' },
  ];

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Setelan</h1>
        <p className="subtitle">Preferensi aplikasi dan keamanan data.</p>
      </header>

      <div className="list-header">Tampilan</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Mode Tema</div>
          </div>
          <select
            className="bg-transparent text-primary font-medium text-right outline-none"
            value={pengaturan.tema}
            onChange={(e) => perbaruiPengaturan({ tema: e.target.value as 'light' | 'dark' | 'system' })}
          >
            <option value="light">Terang</option>
            <option value="dark">Gelap</option>
            <option value="system">Sistem</option>
          </select>
        </div>
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Warna Aksen</div>
          </div>
          <div className="flex gap-2">
            {accentColors.map(c => (
              <button
                key={c.value}
                className={`w-6 h-6 rounded-full border-2 ${pengaturan.warnaAksen === c.value ? 'border-white ring-2 ring-primary' : 'border-transparent'}`}
                style={{ backgroundColor: c.value }}
                onClick={() => perbaruiPengaturan({ warnaAksen: c.value })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="list-header">Gaya Estetika</div>
      <div className="section-card">
        <div className="grouped-list">
          <button
            className={`list-item ${pengaturan.gaya === 'ios' ? 'active' : ''}`}
            onClick={() => perbaruiPengaturan({ gaya: 'ios' })}
          >
            <div className="list-item-content">
              <div className="list-item-title">Modern (iOS 17+)</div>
              <div className="list-item-subtitle">Glassmorphism & Minimalis</div>
            </div>
            {pengaturan.gaya === 'ios' && <span className="text-primary">✓</span>}
          </button>
          <button
            className={`list-item ${pengaturan.gaya === 'nusantara' ? 'active' : ''}`}
            onClick={() => perbaruiPengaturan({ gaya: 'nusantara' })}
          >
            <div className="list-item-content">
              <div className="list-item-title">Nusantara</div>
              <div className="list-item-subtitle">Budaya, Batik, & Harmoni Daerah</div>
            </div>
            {pengaturan.gaya === 'nusantara' && <span className="text-primary">✓</span>}
          </button>
        </div>
      </div>

      <div className="list-header">Keamanan & Enkripsi</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Status Vault</div>
            <div className="list-item-subtitle">{pengaturan.enkripsiEnabled ? 'Aktif (AES-256)' : 'Tidak Aktif'}</div>
          </div>
          <div
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pengaturan.enkripsiEnabled ? 'bg-success' : 'bg-border-subtle'}`}
            onClick={() => perbaruiPengaturan({ enkripsiEnabled: !pengaturan.enkripsiEnabled })}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pengaturan.enkripsiEnabled ? 'translate-x-6' : ''}`} />
          </div>
        </div>
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title text-danger">Kunci Vault</div>
            <div className="list-item-subtitle">Keluar dan amankan data Anda.</div>
          </div>
          <Shield size={18} className="text-danger" />
        </button>
      </div>

      <div className="list-header">Ekspor Data</div>
      <div className="section-card p-4">
        <p className="text-sm text-secondary mb-4">Simpan salinan catatan Anda secara mandiri.</p>
        <button
          className="btn-blue w-full py-2 bg-primary text-white rounded-lg font-semibold"
          onClick={() => setIsExportModalOpen(true)}
        >
          Buka Menu Ekspor
        </button>
      </div>

      <div className="list-header">Penyimpanan</div>
      <div className="section-card p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Kapasitas Terpakai</span>
          <span className="text-xs text-secondary">{storageInfo.used}</span>
        </div>
        <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${storageInfo.percent}%` }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-ghost w-full flex items-center justify-center gap-2">
            <Database size={16} /> Optimalkan Penyimpanan
          </button>
          <button
            className="btn-ghost w-full flex items-center justify-center gap-2 text-danger border-danger/30"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <Trash2 size={16} /> Hapus Semua Data
          </button>
        </div>
      </div>

      <div className="list-header">Koneksi & Integrasi</div>
      <div className="grouped-list">
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title">Layanan Cloud</div>
            <div className="list-item-subtitle">Supabase: {pengaturan.supabaseUrl ? 'Tersambung' : 'Terputus'}</div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title">Sinkronkan Sekarang</div>
          </div>
          <RefreshCw size={18} className="text-primary" />
        </button>
      </div>

      <div className="list-header">Keamanan Lanjutan</div>
      <div className="section-card">
        <div className="grouped-list">
          <div className="list-item">
            <div className="list-item-content">
              <div className="list-item-title">Algoritma KDF</div>
              <div className="list-item-subtitle">PBKDF2 (Standar) atau Argon2id (Sangat Kuat)</div>
            </div>
            <select
              className="bg-transparent text-primary font-medium text-right outline-none"
              value={pengaturan.kdfType}
              onChange={(e) => {
                const newKdf = e.target.value as 'pbkdf2' | 'argon2id';
                if (confirm('Mengubah algoritma KDF memerlukan verifikasi ulang kata sandi dan enkripsi ulang data. Lanjutkan?')) {
                  perbaruiPengaturan({ kdfType: newKdf });
                }
              }}
            >
              <option value="pbkdf2">PBKDF2</option>
              <option value="argon2id">Argon2id</option>
            </select>
          </div>
        </div>
      </div>

      <div className="list-header">Tentang</div>
      <div className="grouped-list">
        <a href="#" className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Versi & Catatan Rilis</div>
            <div className="list-item-subtitle">Abelion Notes v2.0.7</div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </a>
        <a
          href="https://github.com/Abelion-National-Archives/Abelion-Notes"
          target="_blank"
          rel="noopener noreferrer"
          className="list-item"
        >
          <div className="list-item-content">
            <div className="list-item-title">Kode Sumber (GitHub)</div>
          </div>
          <ExternalLink size={18} className="text-muted" />
        </a>
      </div>

      <div className="mt-12 text-center text-muted text-xs">
        <p>© 2026 Lembaga Arsip Digital Abelion</p>
        <p>Didesain untuk iOS & Web</p>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        selectedCatatan={catatan}
        onClose={() => setIsExportModalOpen(false)}
      />

      <KonfirmasiModal
        isOpen={isResetConfirmOpen}
        title="Hapus Semua Data?"
        message="Tindakan ini akan menghapus seluruh catatan, folder, dan pengaturan secara permanen. Pastikan Anda telah melakukan backup."
        onConfirm={handleReset}
        onCancel={() => setIsResetConfirmOpen(false)}
        isDanger
        confirmText="Hapus Segalanya"
      />
    </div>
  );
}
