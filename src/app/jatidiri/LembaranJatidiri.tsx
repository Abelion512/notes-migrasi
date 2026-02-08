'use client';
import Image from 'next/image';

import React from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import { ChevronRight } from 'lucide-react';

export default function LembaranJatidiri() {
  const { profil, catatan } = useAbelionStore();

  const totalKata = catatan.reduce((acc, c) => acc + (c.konten?.split(/\s+/).length || 0), 0);
  const xpPersen = Math.min(100, (profil.exp / 1000) * 100);

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-20">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Profil</h1>
      </header>

      <section className="profile-hero mb-8 flex flex-col items-center">
        <div className="relative inline-block">
          <Image
            src={profil.avatar}
            alt="Avatar"
            width={96} height={96} className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="absolute bottom-0 right-0 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold border-2 border-white">
            Lv {profil.level}
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4 text-center">{profil.nama}</h2>
        <p className="text-muted text-center">{profil.bio}</p>
      </section>

      <div className="list-header">Statistik & XP</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Total XP</div>
            <div className="list-item-subtitle">{profil.exp} XP</div>
          </div>
        </div>
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Tier</div>
            <div className="list-item-subtitle">{profil.level > 10 ? 'Veteran' : 'Novice'}</div>
          </div>
        </div>
      </div>

      <div className="list-header">Progress Level</div>
      <div className="section-card p-4">
        <div className="flex justify-between mb-2 text-sm font-semibold">
          <span>{profil.exp} / 1000 XP</span>
          <span>{Math.round(xpPersen)}%</span>
        </div>
        <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${xpPersen}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-2">{1000 - profil.exp} XP lagi untuk naik level.</p>
      </div>

      <div className="list-header">Produktivitas Menulis</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Total Catatan</div>
            <div className="list-item-subtitle">{catatan.length}</div>
          </div>
        </div>
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Total Kata</div>
            <div className="list-item-subtitle">{totalKata} kata</div>
          </div>
        </div>
      </div>

      <div className="list-header">Tindakan</div>
      <div className="grouped-list">
        <button className="list-item w-full text-left">
          <div className="list-item-content">
            <div className="list-item-title text-primary">Edit Profil</div>
          </div>
          <ChevronRight className="text-muted" size={20} />
        </button>
      </div>

      <div className="mt-12 text-center text-muted text-xs">
        <p>© 2026 Lembaga Arsip Digital Abelion</p>
      </div>
    </div>
  );
}
