'use client';

import React from 'react';
import { Catatan } from '@/aksara/jenis';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus } from 'lucide-react';

interface ItemCatatanProps {
  catatan: Catatan;
  index: number;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, catatan: Catatan) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

const ItemCatatan: React.FC<ItemCatatanProps> = ({
  catatan,
  index,
  selectionMode,
  isSelected,
  onToggleSelect,
  onEdit,
  onContextMenu,
  onPin,
  onDelete
}) => {
  return (
    <div className="list-item-container">
      {/* Swipe Action Backgrounds */}
      <div className="absolute inset-0 flex justify-between items-stretch">
        <div className="bg-primary px-6 flex items-center text-white font-bold text-xs uppercase tracking-widest">Sematkan</div>
        <div className="bg-danger px-6 flex items-center text-white font-bold text-xs uppercase tracking-widest">Hapus</div>
      </div>

      <motion.div
        drag={selectionMode ? false : "x"}
        dragConstraints={{ left: -100, right: 100 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 70) onPin(catatan.id, !catatan.isPinned);
          if (info.offset.x < -70) onDelete(catatan.id);
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`list-item ${isSelected ? 'selected' : ''}`}
        onClick={() => selectionMode ? onToggleSelect(catatan.id) : onEdit(catatan.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, catatan);
        }}
      >
        <div className="list-item-content">
          <div className="list-item-title flex items-center gap-2">
            {catatan.isPinned && <div className="w-2 h-2 rounded-full bg-primary" />}
            <span className="truncate">{catatan.judul || 'Tanpa Judul'}</span>
          </div>
          <div className="list-item-subtitle text-secondary">
            <span className="shrink-0">
              {new Date(catatan.diperbaruiPada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
            {catatan.mood && <span className="shrink-0">{catatan.mood}</span>}
            <span className="truncate opacity-60">
              {catatan.konten?.replace(/<[^>]*>/g, '').substring(0, 60) || 'Tidak ada isi...'}
            </span>
          </div>
        </div>
        {selectionMode ? (
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-border-subtle'}`}>
            {isSelected && <Plus size={16} className="text-white rotate-45" />}
          </div>
        ) : (
          <button className="list-item-more" onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, catatan);
          }}>
            <MoreHorizontal size={18} />
          </button>
        )}
      </motion.div>
    </div>
  );
};

// Memoize the component to prevent re-rendering every item when anything else in the parent changes.
// Only re-render if the core props change.
export default React.memo(ItemCatatan, (prev, next) => {
  return (
    prev.catatan.id === next.catatan.id &&
    prev.catatan.judul === next.catatan.judul &&
    prev.catatan.konten === next.catatan.konten &&
    prev.catatan.diperbaruiPada === next.catatan.diperbaruiPada &&
    prev.catatan.isPinned === next.catatan.isPinned &&
    prev.catatan.mood === next.catatan.mood &&
    prev.index === next.index &&
    prev.selectionMode === next.selectionMode &&
    prev.isSelected === next.isSelected
  );
});
