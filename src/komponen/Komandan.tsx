'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAbelionStore } from '@/aksara/Pundi';
import { Search, Plus, Home, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Komandan() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { catatan, tambahCatatan } = useAbelionStore();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    const actions = [
      { id: 'new', label: 'Tulis Catatan Baru', icon: <Plus size={18} />, action: () => { tambahCatatan({}); setIsOpen(false); } },
      { id: 'home', label: 'Buka Beranda', icon: <Home size={18} />, action: () => { router.push('/'); setIsOpen(false); } },
      { id: 'profile', label: 'Buka Profil', icon: <User size={18} />, action: () => { router.push('/jatidiri'); setIsOpen(false); } },
      { id: 'settings', label: 'Buka Setelan', icon: <Settings size={18} />, action: () => { router.push('/laras'); setIsOpen(false); } },
    ].filter(a => a.label.toLowerCase().includes(q));

    const notes = catatan
      .filter(c => c.judul?.toLowerCase().includes(q) || c.konten?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        label: c.judul || 'Tanpa Judul',
        icon: <Search size={18} />,
        action: () => { router.push(`/?edit=${c.id}`); setIsOpen(false); }
      }));

    return [...actions, ...notes];
  }, [query, catatan, router, tambahCatatan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl overflow-hidden border border-border-subtle"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-4 border-b border-border-subtle">
          <Search size={20} className="text-muted mr-3" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent outline-none text-lg"
            placeholder="Ketik perintah atau cari catatan... (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.id}
                className="w-full flex items-center gap-3 p-3 hover:bg-primary-soft rounded-xl transition-colors text-left"
                onClick={r.action}
              >
                <span className="text-primary">{r.icon}</span>
                <span className="font-medium">{r.label}</span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted italic">Tidak ada hasil ditemukan.</div>
          )}
        </div>
        <div className="p-3 bg-surface-alt border-t border-border-subtle flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-50">
          <span>Arahkan & Klik</span>
          <span>Esc untuk Batal</span>
        </div>
      </motion.div>
    </div>
  );
}

