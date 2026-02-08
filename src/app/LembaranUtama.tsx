'use client';

import React, { useState } from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import PustakaKecil from '@/komponen/PustakaKecil';
import BilikAksara from '@/komponen/BilikAksara';
import { Search, Folder as FolderIcon, Clock, Plus } from 'lucide-react';
import { Catatan } from '@/aksara/jenis';

export default function LembaranUtama() {
  const { catatan, tambahCatatan } = useAbelionStore();
  const [editingCatatan, setEditingCatatan] = useState<Catatan | null>(null);
  const [search, setSearch] = useState('');

  const filteredCatatan = catatan.filter(c =>
    (c.judul?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.konten?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const id = crypto.randomUUID();
    const baru = {
      id,
      judul: '',
      konten: '',
      dibuatPada: new Date().toISOString(),
      diperbaruiPada: new Date().toISOString(),
    };
    tambahCatatan(baru);
    setEditingCatatan(baru as Catatan);
  };

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Catatan</h1>
        <div className="search-container-ios mb-6">
          <Search className="search-icon-ios" size={20} />
          <input
            type="text"
            className="search-input-ios"
            placeholder="Cari catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button className="pill-filter active">Semua</button>
          <button className="pill-filter flex items-center gap-1"><FolderIcon size={16} /> Folder</button>
          <button className="pill-filter flex items-center gap-1"><Clock size={16} /> Terbaru</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatatan.map((c) => (
          <PustakaKecil
            key={c.id}
            catatan={c}
            onClick={setEditingCatatan}
            onContextMenu={(e) => {
              e.preventDefault();
              // TODO: Context Menu
            }}
          />
        ))}
        {filteredCatatan.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted">
            <p>Tidak ada catatan ditemukan.</p>
          </div>
        )}
      </div>

      <button className="fab-btn" onClick={handleCreate}>
        <Plus size={28} />
      </button>

      <BilikAksara key={editingCatatan?.id || "baru"}
        catatan={editingCatatan}
        isOpen={!!editingCatatan}
        onClose={() => setEditingCatatan(null)}
      />
    </div>
  );
}
