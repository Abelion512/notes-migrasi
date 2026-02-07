'use client';

import React, { useState } from 'react';
import { Catatan } from '@/aksara/jenis';
import { ChevronLeft, MoreVertical, Share, Trash2 } from 'lucide-react';
import { useAbelionStore } from '@/aksara/toko';

interface DialogEditorProps {
  catatan: Catatan | null;
  isOpen: boolean;
  onClose: () => void;
}

const DialogEditor: React.FC<DialogEditorProps> = ({ catatan, isOpen, onClose }) => {
  const [judul, setJudul] = useState(catatan?.judul || '');
  const [konten, setKonten] = useState(catatan?.konten || '');
  const perbaruiCatatan = useAbelionStore((state) => state.perbaruiCatatan);
  const pindahkanKeSampah = useAbelionStore((state) => state.pindahkanKeSampah);

  // We use a key on the parent in page.tsx to reset this component's state when catatan changes.
  // This avoids the "setState in useEffect" warning and is a more idiomatic React pattern.

  const handleSave = () => {
    if (catatan) {
      perbaruiCatatan(catatan.id, { judul, konten });
    }
  };

  const handleDelete = () => {
    if (catatan) {
      pindahkanKeSampah(catatan.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="note-editor-dialog show">
      <div className="editor-nav-ios">
        <button className="nav-btn-ios" onClick={() => { handleSave(); onClose(); }}>
          <ChevronLeft size={24} />
          <span>Catatan</span>
        </button>
        <div className="editor-nav-actions">
          <button className="nav-btn-ios"><Share size={20} /></button>
          <button className="nav-btn-ios" onClick={handleDelete}><Trash2 size={20} /></button>
          <button className="nav-btn-ios"><MoreVertical size={20} /></button>
        </div>
      </div>

      <div className="editor-body">
        <input
          type="text"
          className="editor-title-input"
          placeholder="Judul"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          onBlur={handleSave}
        />
        <textarea
          className="editor-textarea"
          placeholder="Mulai menulis..."
          value={konten}
          onChange={(e) => setKonten(e.target.value)}
          onBlur={handleSave}
        />
      </div>
    </div>
  );
};

export default DialogEditor;
