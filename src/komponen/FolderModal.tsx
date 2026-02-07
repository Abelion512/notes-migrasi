'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder } from '@/aksara/jenis';
import { useAbelionStore } from '@/aksara/toko';

interface FolderModalProps {
  isOpen: boolean;
  folder: Partial<Folder> | null;
  onClose: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, folder, onClose }) => {
  const [nama, setNama] = useState(folder?.nama || '');
  const [ikon, setIkon] = useState(folder?.ikon || '📁');
  const [parentId, setParentId] = useState(folder?.parentId || '');

  const { tambahFolder, perbaruiFolder, folder: allFolders } = useAbelionStore();

  const handleSave = () => {
    if (folder?.id) {
      perbaruiFolder(folder.id, { nama, ikon, parentId: parentId || undefined });
    } else {
      tambahFolder({ nama, ikon, parentId: parentId || undefined });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="about-modal show" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 10000 }}>
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="about-modal-content"
          >
            <div className="modal-header-ios">
              <h3>{folder?.id ? 'Edit Folder' : 'Folder Baru'}</h3>
              <button className="done-btn" onClick={handleSave}>Simpan</button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="section-card">
                <input
                  type="text"
                  className="input-control"
                  placeholder="Nama Folder"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center border-t border-border-subtle">
                  <div className="flex-1 p-3 text-left text-secondary">Ikon</div>
                  <input
                    type="text"
                    className="w-12 text-center bg-transparent border-none text-xl"
                    value={ikon}
                    onChange={(e) => setIkon(e.target.value)}
                  />
                </div>
              </div>

              <div className="list-header">Folder Utama (Opsional)</div>
              <div className="section-card">
                <select
                  className="input-control"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">(Jadikan Folder Utama)</option>
                  {allFolders.filter(f => f.id !== folder?.id).map(f => (
                    <option key={f.id} value={f.id}>{f.ikon} {f.nama}</option>
                  ))}
                </select>
              </div>

              <button className="ghost-btn text-danger mt-2" onClick={onClose}>Batal</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FolderModal;
