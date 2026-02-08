'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pin, Archive, Trash2, Edit2 } from 'lucide-react';
import { Catatan } from '@/aksara/jenis';
import { useAbelionStore } from '@/aksara/toko';

interface ContextMenuProps {
  x: number;
  y: number;
  catatan: Catatan;
  onClose: () => void;
  onEdit: (c: Catatan) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, catatan, onClose, onEdit }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { perbaruiCatatan, pindahkanKeSampah } = useAbelionStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handlePin = () => {
    perbaruiCatatan(catatan.id, { isPinned: !catatan.isPinned });
    onClose();
  };

  const handleArchive = () => {
    perbaruiCatatan(catatan.id, { isArchived: !catatan.isArchived });
    onClose();
  };

  const handleDelete = () => {
    pindahkanKeSampah(catatan.id);
    onClose();
  };

  // Adjust position if too close to edges
  const posX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 200 : x);
  const posY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 200 : y);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      style={{ top: posY, left: posX }}
      className="context-menu"
    >
      <button className="context-menu-item" onClick={() => { onEdit(catatan); onClose(); }}>
        <Edit2 size={16} /> Edit
      </button>
      <button className="context-menu-item" onClick={handlePin}>
        <Pin size={16} /> {catatan.isPinned ? 'Lepas Sematan' : 'Sematkan'}
      </button>
      <button className="context-menu-item" onClick={handleArchive}>
        <Archive size={16} /> {catatan.isArchived ? 'Buka Arsip' : 'Arsipkan'}
      </button>
      <div className="context-menu-divider" />
      <button className="context-menu-item danger" onClick={handleDelete}>
        <Trash2 size={16} /> Hapus
      </button>
    </motion.div>
  );
};

export default ContextMenu;
