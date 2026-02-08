'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAbelionStore } from '@/aksara/Pundi';
import { Award, PenTool, BookOpen } from 'lucide-react';
import EditProfilModal from '@/komponen/EditProfilModal';

export default function LembaranJatidiri() {
  const { profil, catatan } = useAbelionStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const totalKata = catatan.reduce((acc, c) => acc + (c.konten?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0), 0);
  const xpPersen = Math.min(100, (profil.exp / 1000) * 100);

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-32">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Profil</h1>
      </header>

      <section className="profile-hero mb-8 flex flex-col items-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
            <Image
              src={profil.avatar}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white">
            Lv {profil.level}
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4 text-center">{profil.nama}</h2>
        <p className="text-secondary text-center px-8">{profil.bio}</p>
        <button
          className="mt-4 px-6 py-2 bg-primary-soft text-primary font-semibold rounded-full text-sm"
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Profil
        </button>
      </section>

      <div className="list-header">Statistik & XP</div>
      <div className="section-card p-6 mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">Progress Level</span>
            <span className="text-2xl font-bold text-primary">{profil.exp} <span className="text-sm font-normal text-secondary">/ 1000 XP</span></span>
          </div>
          <span className="text-sm font-bold text-primary">{Math.round(xpPersen)}%</span>
        </div>
        <div className="h-3 bg-border-subtle rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${xpPersen}%` }}
          />
        </div>
        <p className="text-xs text-secondary italic">Dapatkan XP dengan menulis lebih banyak catatan.</p>
      </div>

      <div className="list-header">Produktivitas</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Total Catatan</div>
            <div className="list-item-subtitle">Anda telah membuat {catatan.length} arsip</div>
          </div>
          <BookOpen className="text-primary" size={20} />
        </div>
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Total Kata</div>
            <div className="list-item-subtitle">{totalKata.toLocaleString()} kata tersimpan</div>
          </div>
          <PenTool className="text-primary" size={20} />
        </div>
      </div>

      <div className="list-header">Pencapaian</div>
      <div className="grouped-list">
        <div className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">Tier</div>
            <div className="list-item-subtitle">{profil.level > 10 ? 'Veteran Researcher' : 'Junior Scribe'}</div>
          </div>
          <Award className="text-warning" size={20} />
        </div>
      </div>

      <div className="mt-12 text-center text-secondary text-xs">
        <p>© 2026 Lembaga Arsip Digital Abelion</p>
      </div>

      <EditProfilModal
        isOpen={isEditModalOpen}
        profil={profil}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
