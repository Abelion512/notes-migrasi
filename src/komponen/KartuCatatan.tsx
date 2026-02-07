'use client';

import React from 'react';
import { Catatan } from '@/aksara/jenis';
import { formatTanggalRelative } from '@/aksara/perkakas';

interface KartuCatatanProps {
  catatan: Catatan;
  onClick: (catatan: Catatan) => void;
  onContextMenu: (e: React.MouseEvent, catatan: Catatan) => void;
}

const KartuCatatan: React.FC<KartuCatatanProps> = ({ catatan, onClick, onContextMenu }) => {
  return (
    <div
      className="note-card"
      onClick={() => onClick(catatan)}
      onContextMenu={(e) => onContextMenu(e, catatan)}
    >
      <div className="note-card-header">
        <h3 className="note-card-title">{catatan.judul || 'Tanpa Judul'}</h3>
        {catatan.mood && <span className="note-card-mood">{catatan.mood}</span>}
      </div>
      <p className="note-card-excerpt">
        {catatan.konten ? catatan.konten.substring(0, 100) : 'Tidak ada isi...'}
      </p>
      <div className="note-card-footer">
        <span className="note-card-date">{formatTanggalRelative(catatan.diperbaruiPada)}</span>
      </div>
    </div>
  );
};

export default KartuCatatan;
