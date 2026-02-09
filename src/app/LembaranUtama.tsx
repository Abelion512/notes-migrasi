'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import BilikAksara from '@/komponen/BilikAksara';
import FolderModal from '@/komponen/FolderModal';
import ContextMenu from '@/komponen/ContextMenu';
import ExportModal from '@/komponen/ExportModal';
import { Search, Plus, Trash2, X, MoreHorizontal, Download } from 'lucide-react';
import DialogMood from '@/komponen/DialogMood';
import { Catatan, Folder } from '@/aksara/jenis';
import { motion, AnimatePresence } from 'framer-motion';
import Sortable from 'sortablejs';
import { useSearchParams } from 'next/navigation';
import { List } from 'react-window';

// Komponen Baris Catatan untuk Virtual List
const BarisCatatan = ({ index, style, ...props }: any) => {
  const c = props.filteredCatatan[index];
  if (!c) return null;

  return (
    <div style={style} className="list-item-container px-4">
      <motion.div
        drag={props.selectionMode ? false : "x"}
        dragConstraints={{ left: -100, right: 100 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 70) props.perbaruiCatatan(c.id, { isPinned: !c.isPinned });
          if (info.offset.x < -70) props.pindahkanKeSampah(c.id);
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        className={`list-item ${props.selectedIds.includes(c.id) ? 'selected' : ''}`}
        onClick={() => props.selectionMode ? props.toggleSelect(c.id) : props.setEditingId(c.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          props.setContextMenu({ x: e.clientX, y: e.clientY, catatan: c });
        }}
      >
        <div className="list-item-content">
          <div className="list-item-title flex items-center gap-2">
            {c.isPinned && <div className="w-2 h-2 rounded-full bg-primary" />}
            <span className="truncate">{c.judul || 'Tanpa Judul'}</span>
          </div>
          <div className="list-item-subtitle text-secondary">
            <span className="shrink-0">{new Date(c.diperbaruiPada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            {c.mood && <span className="shrink-0">{c.mood}</span>}
            <span className="truncate opacity-60">{c.konten?.replace(/<[^>]*>/g, '').substring(0, 60) || 'Tidak ada isi...'}</span>
          </div>
        </div>
        {props.selectionMode ? (
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${props.selectedIds.includes(c.id) ? 'bg-primary border-primary' : 'border-border-subtle'}`}>
            {props.selectedIds.includes(c.id) && <Plus size={16} className="text-white rotate-45" />}
          </div>
        ) : (
          <button className="list-item-more" onClick={(e) => {
            e.stopPropagation();
            props.setContextMenu({ x: e.clientX, y: e.clientY, catatan: c });
          }}>
            <MoreHorizontal size={18} />
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default function LembaranUtama() {
  const { catatan, folder, tambahCatatan, perbaruiCatatan, pindahkanKeSampah, mood, editingId, setEditingId } = useAbelionStore();
  const searchParams = useSearchParams();

  const editingCatatan = useMemo(() => catatan.find(c => c.id === editingId) || null, [catatan, editingId]);
  const [search, setSearch] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

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
      "“Informasi adalah kekayaan intelektual.”",
      "“Arsip yang tertata adalah cerminan pikiran yang jernih.”",
      "“Mengabadikan ide untuk masa depan peradaban.”",
      "“Dokumentasi adalah kunci keberlanjutan.”",
      "“Setiap catatan adalah bagian dari sejarah digital Anda.”"
    ];
    return mottos[new Date().getDate() % mottos.length];
  }, []);

  const filteredCatatan = useMemo(() => catatan.filter(c => {
    const matchesSearch = (c.judul?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (c.konten?.toLowerCase() || '').includes(search.toLowerCase());

    if (activeFolderId === 'all') return !c.deletedAt && matchesSearch;
    if (activeFolderId === 'trash') return !!c.deletedAt && matchesSearch;
    return c.folderId === activeFolderId && !c.deletedAt && matchesSearch;
  }), [catatan, search, activeFolderId]);

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

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) setEditingId(editId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const el = document.getElementById('notes-list-sortable');
    if (el && !selectionMode) {
      Sortable.create(el, {
        animation: 150,
        handle: '.list-item',
        onEnd: (evt) => {
          // In a real app we would update the store here
          console.log('Sorted', evt.oldIndex, evt.newIndex);
        }
      });
    }
  }, [selectionMode]);

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
        mood: noteToday?.mood || null,
        active: dateStr === now.toISOString().split('T')[0]
      };
    });
  }, [catatan]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const text = await file.text();
        tambahCatatan({
          judul: file.name.replace(/\.[^/.]+$/, ""),
          konten: text,
          kontenMarkdown: text
        });
      }
    }
  };

  return (
    <div
      className="main-content"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <header className="hero-section">
        <div className="flex justify-between items-start">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="title-abelion"
          >
            Catatan
          </motion.h1>
          <button
            className="ghost-btn"
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
            }}
          >
            {selectionMode ? 'Batal' : 'Pilih'}
          </button>
        </div>
        <p className="subtitle">{greeting}, silakan kelola arsip Anda.</p>
        <blockquote className="motto">{motto}</blockquote>
      </header>

      <section className="search-section">
        <div className="search-bar-container">
          <Search size={18} className="text-secondary mr-2" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="folder-section">
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
            className={`folder-pill ${activeFolderId === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveFolderId('trash')}
          >
            Sampah
          </button>
          <button
            className="folder-pill bg-transparent border border-border-subtle !p-2 !rounded-full flex items-center justify-center w-9 h-9"
            onClick={() => {
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section className="notes-section">
        <div className="list-header">{activeFolderId === 'all' ? 'Semua Catatan' : activeFolderId === 'trash' ? 'Sampah' : folder.find(f => f.id === activeFolderId)?.nama}</div>
        <div id="notes-list-sortable" className="grouped-list h-[500px]">
          {filteredCatatan.length > 0 ? (
            <List
              rowCount={filteredCatatan.length}
              rowHeight={80}
              style={{ height: 500 }}
              rowProps={{ filteredCatatan, selectionMode, selectedIds, toggleSelect, setEditingId, setContextMenu, perbaruiCatatan, pindahkanKeSampah }}
              rowComponent={BarisCatatan}
            />
          ) : (
            <div className="p-12 text-center text-muted italic">Belum ada arsip di kategori ini.</div>
          )}
        </div>
      </section>

      <section className="mood-graph-section pb-32">
        <div className="list-header">Mood Mingguan</div>
        <div className="mood-graph">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const iso = d.toISOString().split('T')[0];
            const isToday = i === 6;
            const moodEmoji = mood[iso];

            return (
              <div key={iso} className="mood-bar">
                <div className="mood-emoji" style={{ opacity: moodEmoji ? 1 : 0.3 }}>
                  {moodEmoji || '⚪'}
                </div>
                <div className="mood-date" style={{ fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {d.toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', '')}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="mood-btn" onClick={() => setIsMoodModalOpen(true)}>Perbarui Mood</button>
        </div>
      </section>

      <DialogMood isOpen={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} />

      <section className="mood-graph-section mt-12 mb-20">
        <div className="list-header mb-4 text-center">Mood Mingguan</div>
        <div className="mood-graph flex justify-between bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl shadow-sm">
          {weeklyMoodData.map((d, i) => (
            <div key={i} className={`mood-bar flex flex-col items-center gap-2 ${d.active ? 'opacity-100' : 'opacity-40'}`}>
              <div className="mood-emoji text-2xl h-8 flex items-center justify-center">
                {d.mood || <div className="w-6 h-6 rounded-full border-2 border-[var(--border-subtle)]" />}
              </div>
              <div className="mood-date text-[10px] font-bold uppercase tracking-tighter">{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Selection Bar */}
      <AnimatePresence>
        {selectionMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: 100, x: '-50%' }}
            className="selection-bar fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-lg bg-white dark:bg-[#1C1C1E] border border-[var(--border-subtle)]/30 rounded-3xl p-4 shadow-2xl z-[2000] flex justify-between items-center"
          >
            <div className="selection-info px-2">
              <span className="font-bold text-primary">{selectedIds.length}</span> <span className="text-sm opacity-60 uppercase font-bold">terpilih</span>
            </div>
            <div className="selection-actions flex gap-4">
              <button className="flex flex-col items-center gap-1 text-primary active:scale-90 transition-transform" onClick={() => setIsExportModalOpen(true)}>
                <Download size={20} />
                <span className="text-[10px] font-bold uppercase">Ekspor</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-danger active:scale-90 transition-transform" onClick={handleBulkDelete}>
                <Trash2 size={20} />
                <span className="text-[10px] font-bold uppercase">Hapus</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-secondary active:scale-90 transition-transform" onClick={() => {
                setSelectionMode(false);
                setSelectedIds([]);
              }}>
                <X size={20} />
                <span className="text-[10px] font-bold uppercase">Batal</span>
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
