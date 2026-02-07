'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Catatan } from '@/aksara/jenis';
import { eksporKePDF, eksporKeDocx, eksporKeJSON, eksporKeMarkdown, eksporKeTXT } from '@/aksara/ekspor';

interface ExportModalProps {
  isOpen: boolean;
  selectedCatatan: Catatan[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, selectedCatatan, onClose }) => {
  const [format, setFormat] = useState('json');
  const [gabung, setGabung] = useState(false);

  const handleExport = async () => {
    switch (format) {
      case 'json':
        eksporKeJSON(selectedCatatan);
        break;
      case 'md':
        await eksporKeMarkdown(selectedCatatan, gabung);
        break;
      case 'docx':
        await eksporKeDocx(selectedCatatan);
        break;
      case 'pdf':
        await eksporKePDF(selectedCatatan);
        break;
      case 'txt':
        await eksporKeTXT(selectedCatatan, gabung);
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="about-modal show" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 11000 }}>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="about-modal-content"
          >
            <div className="modal-header-ios">
              <h3>Opsi Ekspor</h3>
              <button className="done-btn" onClick={onClose}>Batal</button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="list-header">Format File</div>
              <div className="section-card">
                <select
                  className="input-control"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="json">JSON (Backup Abelion)</option>
                  <option value="md">Markdown (.md)</option>
                  <option value="txt">Teks Polos (.txt)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>

              {(format === 'md' || format === 'txt') && (
                <>
                  <div className="list-header">Metode Penggabungan</div>
                  <div className="section-card">
                    <div className="flex items-center justify-between p-3">
                      <span className="text-17">Gabung jadi 1 file</span>
                      <input
                        type="checkbox"
                        className="w-6 h-6"
                        checked={gabung}
                        onChange={(e) => setGabung(e.target.checked)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted text-left px-1">Jika tidak digabung, catatan akan dikemas dalam file .ZIP.</p>
                </>
              )}

              <div className="mt-4">
                <button className="btn-blue w-full" onClick={handleExport}>
                  Mulai Unduh ({selectedCatatan.length} Catatan)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;
