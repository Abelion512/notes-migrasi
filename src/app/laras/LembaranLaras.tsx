'use client';

import React from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import { ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';

export default function LembaranLaras() {
  const { pengaturan, perbaruiPengaturan } = useAbelionStore();

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-20">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Setelan</h1>
      </header>

      <div className="list-header">Tampilan</div>
      <div className="section-card">
        <div className="grouped-list">
          <button
            className={`list-item ${pengaturan.tema === 'light' ? 'active' : ''}`}
            onClick={() => perbaruiPengaturan({ tema: 'light' })}
          >
            <div className="list-item-content">
              <div className="list-item-title">Terang</div>
            </div>
            {pengaturan.tema === 'light' && <span className="text-primary">✓</span>}
          </button>
          <button
            className={`list-item ${pengaturan.tema === 'dark' ? 'active' : ''}`}
            onClick={() => perbaruiPengaturan({ tema: 'dark' })}
          >
            <div className="list-item-content">
              <div className="list-item-title">Gelap</div>
            </div>
            {pengaturan.tema === 'dark' && <span className="text-primary">✓</span>}
          </button>
          <button
            className={`list-item ${pengaturan.tema === 'system' ? 'active' : ''}`}
            onClick={() => perbaruiPengaturan({ tema: 'system' })}
          >
            <div className="list-item-content">
              <div className="list-item-title">Otomatis (Sistem)</div>
            </div>
            {pengaturan.tema === 'system' && <span className="text-primary">✓</span>}
          </button>
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

      <div className="list-header">Ekspor Data</div>
      <div className="section-card p-4">
        <p className="text-xs text-muted mb-4">Simpan salinan catatan Anda secara mandiri.</p>
        <div className="flex flex-col gap-2">
          <select className="input-control bg-surface-strong rounded-lg p-2 border border-border-subtle">
            <option value="json">JSON (Lengkap)</option>
            <option value="md">Markdown (ZIP)</option>
            <option value="pdf">Dokumen PDF</option>
          </select>
          <button className="btn-blue w-full py-2 bg-primary text-white rounded-lg font-semibold">
            Ekspor Sekarang
          </button>
        </div>
      </div>

      <div className="list-header">Koneksi & Integrasi</div>
      <div className="grouped-list">
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title">Layanan Cloud</div>
            <div className="list-item-subtitle">Supabase, Notion, dan lainnya</div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title">Sinkronkan Sekarang</div>
            <div className="list-item-subtitle text-xs text-muted">Ketuk untuk kirim data ke Cloud</div>
          </div>
          <RefreshCw size={18} className="text-muted" />
        </button>
      </div>

      <div className="list-header">Tentang</div>
      <div className="grouped-list">
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title">Versi & Catatan Rilis</div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
        <a
          href="https://github.com/Abelion-National-Archives/Abelion-Notes"
          target="_blank"
          rel="noopener noreferrer"
          className="list-item"
        >
          <div className="list-item-content">
            <div className="list-item-title">Kode Sumber (GitHub)</div>
            <div className="list-item-subtitle">Kontribusi dalam pengembangan</div>
          </div>
          <ExternalLink size={18} className="text-muted" />
        </a>
      </div>

      <div className="mt-12 text-center text-muted text-xs">
        <p>Lembaga Arsip Digital Abelion v2.0.7</p>
        <p>Didesain untuk iOS & Web</p>
      </div>
    </div>
  );
}
