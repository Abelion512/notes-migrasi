'use client';

import React, { useState, useMemo } from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import BilikAksara from '@/komponen/BilikAksara';
import FolderModal from '@/komponen/FolderModal';
import ContextMenu from '@/komponen/ContextMenu';
import ExportModal from '@/komponen/ExportModal';
import { Search, Plus, Trash2, X, MoreHorizontal, Download } from 'lucide-react';
import { Catatan, Folder } from '@/aksara/jenis';
import { motion, AnimatePresence } from 'framer-motion';

export default function LembaranUtama() {
  const { catatan, folder, tambahCatatan, pindahkanKeSampah, editingId, setEditingId } = useAbelionStore();

  const editingCatatan = useMemo(() => catatan.find(c => c.id === editingId) || null, [catatan, editingId]);
  const [search, setSearch] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Partial<Folder> | null>(null);

  // Selection Mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, catatan: Catatan } | null>(null);

  // Dynamic Content
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const motto = useMemo(() => {
    const mottos = [
      '“Ide adalah aset.”',
      '“Catat sebelum terlupa.”',
      '“Arsip masa depan.”',
      '“Pikiran yang teratur.”'
    ];
    return mottos[new Date().getDate() % mottos.length];
  }, []);

  const filteredCatatan = catatan.filter(c => {
    const matchesSearch = (c.judul?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (c.konten?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesFolder = activeFolderId === 'all' || c.folderId === activeFolderId;
    return matchesSearch && matchesFolder;
  });

  const handleCreate = () => {
    tambahCatatan({
      folderId: activeFolderId !== 'all' ? activeFolderId : undefined,
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Hapus ${selectedIds.length} catatan?`)) {
      selectedIds.forEach(id => pindahkanKeSampah(id));
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  // Weekly Mood Graph Data
  const weeklyMoodData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const noteToday = catatan.find(c => c.diperbaruiPada.startsWith(dateStr) && c.mood);
      return {
        label: days[d.getDay()],
        mood: noteToday?.mood || '⚪',
        active: dateStr === now.toISOString().split('T')[0]
      };
    });
  }, [catatan]);

  return (
    <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-32">
      <header className="hero-section">
        <div className="flex justify-between items-start mb-2">
          <h1 className="title-abelion font-bold text-4xl">Catatan</h1>
          <button
            className="ghost-btn bg-white/50 backdrop-blur border border-border-subtle rounded-full px-4 py-1 text-sm font-semibold"
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
            }}
          >
            {selectionMode ? 'Batal' : 'Pilih'}
          </button>
        </div>
        <p className="subtitle">{greeting} di Abelion Notes.</p>
        <blockquote className="motto">{motto}</blockquote>
      </header>

      <section className="mt-8">
        <div className="search-bar-container">
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="folder-section mt-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            className={`folder-pill ${activeFolderId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFolderId('all')}
          >
            Semua
          </button>
          {folder.map(f => (
            <button
              key={f.id}
              className={`folder-pill ${activeFolderId === f.id ? 'active' : ''}`}
              onClick={() => setActiveFolderId(f.id)}
              onDoubleClick={() => {
                setEditingFolder(f);
                setIsFolderModalOpen(true);
              }}
            >
              {f.ikon} {f.nama}
            </button>
          ))}
          <button
            className="p-2 rounded-full bg-white/50 border border-border-subtle"
            onClick={() => {
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section className="notes-section mt-8">
        <div className="list-header">{activeFolderId === 'all' ? 'Semua Catatan' : folder.find(f => f.id === activeFolderId)?.nama}</div>
        <div className="grouped-list">
          {filteredCatatan.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`list-item-container ${selectedIds.includes(c.id) ? 'selected' : ''}`}
              onClick={() => selectionMode ? toggleSelect(c.id) : setEditingId(c.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, catatan: c });
              }}
            >
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">{c.judul || 'Tanpa Judul'}</div>
                  <div className="list-item-subtitle">
                    {c.mood && <span className="mr-2">{c.mood}</span>}
                    {c.konten?.replace(/<[^>]*>/g, '').substring(0, 40) || 'Tidak ada isi...'}
                  </div>
                </div>
                {selectionMode ? (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.includes(c.id) ? 'bg-primary border-primary' : 'border-border-subtle'}`}>
                    {selectedIds.includes(c.id) && <Plus size={16} className="text-white rotate-45" />}
                  </div>
                ) : (
                  <button className="list-item-more" onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY, catatan: c });
                  }}>
                    <MoreHorizontal size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filteredCatatan.length === 0 && (
            <div className="p-12 text-center text-muted">Belum ada catatan di sini.</div>
          )}
        </div>
      </section>

      <section className="mood-graph-section mt-12">
        <div className="list-header">Mood Mingguan</div>
        <div className="mood-graph">
          {weeklyMoodData.map((d, i) => (
            <div key={i} className={`mood-bar ${d.active ? 'opacity-100' : 'opacity-60'}`}>
              <div className="mood-emoji">{d.mood}</div>
              <div className="mood-date">{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      <button className="fab-btn" onClick={handleCreate}>
        <Plus size={28} />
      </button>

      {/* Selection Bar */}
      <AnimatePresence>
        {selectionMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="selection-bar"
          >
            <div className="selection-info">
              <span>{selectedIds.length} terpilih</span>
            </div>
            <div className="selection-actions">
              <button className="ghost-btn flex items-center gap-1" onClick={() => setIsExportModalOpen(true)}>
                <Download size={20} /> Ekspor
              </button>
              <button className="ghost-btn text-danger flex items-center gap-1" onClick={handleBulkDelete}>
                <Trash2 size={20} /> Hapus
              </button>
              <button className="ghost-btn" onClick={() => {
                setSelectionMode(false);
                setSelectedIds([]);
              }}>
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BilikAksara
        key={editingCatatan?.id || 'none'}
        catatan={editingCatatan}
        isOpen={!!editingCatatan}
        onClose={() => setEditingId(null)}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        folder={editingFolder}
        onClose={() => setIsFolderModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        selectedCatatan={catatan.filter(c => selectedIds.includes(c.id))}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectionMode(false);
          setSelectedIds([]);
        }}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          catatan={contextMenu.catatan}
          onClose={() => setContextMenu(null)}
          onEdit={(c) => setEditingId(c.id)}
        />
      )}
    </div>
  );
}
