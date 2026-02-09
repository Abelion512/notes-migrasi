'use client';

import React, { useState } from 'react';
import { Catatan } from '@/aksara/jenis';
import { ChevronLeft, MoreVertical, Share, Trash2, Bold, Italic, List, Image as ImageIcon, Sparkles, Loader2, Shield } from 'lucide-react';
import { useAbelionStore } from '@/aksara/Pundi';
import { motion, AnimatePresence } from 'framer-motion';
import KonfirmasiModal from './KonfirmasiModal';
import { ringkasCatatan } from '@/aksara/Pujangga';

interface BilikAksaraProps {
  catatan: Catatan | null;
  isOpen: boolean;
  onClose: () => void;
}

const BilikAksara: React.FC<BilikAksaraProps> = ({ catatan, isOpen, onClose }) => {
  const [judul, setJudul] = useState(catatan?.judul || '');
  const [konten, setKonten] = useState(catatan?.konten || '');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const perbaruiCatatan = useAbelionStore((state) => state.perbaruiCatatan);
  const pindahkanKeSampah = useAbelionStore((state) => state.pindahkanKeSampah);
  const moods = ['🤩', '😊', '😐', '😔', '😫'];

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

  const handleFormat = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const handleAddImage = () => {
    const url = prompt('Masukkan URL Gambar:');
    if (url) {
      handleFormat('insertImage', url);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const ringkasan = await ringkasCatatan(konten);
    setKonten(prev => prev + `<br/><br/><b>Ringkasan AI:</b><br/>${ringkasan}`);
    setIsSummarizing(false);
    if (catatan) perbaruiCatatan(catatan.id, { konten: konten + `<br/><br/><b>Ringkasan AI:</b><br/>${ringkasan}` });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setReadingProgress(isNaN(progress) ? 0 : progress);
  };

  return (
    <>
      <KonfirmasiModal
        isOpen={showDeleteConfirm}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan ini? Catatan akan dipindahkan ke Sampah."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDanger
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="note-editor-modal show"
          >
            <div className="reading-progress-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '3px', zIndex: 10001 }}>
              <div
                className="reading-progress-bar"
                style={{ width: `${readingProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.1s' }}
              />
            </div>
            <div className="note-editor-dialog">
              <div className="note-editor-header">
                <button className="ghost-btn flex items-center gap-1" onClick={() => { handleSave(); onClose(); }}>
                  <ChevronLeft size={24} />
                  <span className="font-semibold">Selesai</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="ghost-btn p-2"><Share size={20} /></button>
                  <button className="ghost-btn p-2 text-danger" onClick={() => setShowDeleteConfirm(true)}><Trash2 size={20} /></button>
                  <button className="ghost-btn p-2"><MoreVertical size={20} /></button>
                </div>
              </div>

              <div className="note-editor-content" onScroll={handleScroll}>
                {catatan?.konflik && catatan.konflik.length > 0 && (
                  <div className="bg-warning-soft border border-warning/30 p-4 rounded-2xl mb-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-warning font-bold">
                      <Shield size={18} />
                      <span>Terdeteksi Konflik Sinkronisasi</span>
                    </div>
                    <p className="text-xs opacity-70">Ada {catatan.konflik.length} versi lain dari catatan ini. Pilih versi yang ingin Anda pertahankan:</p>
                    <div className="flex flex-col gap-2">
                      <button
                        className="text-left p-3 rounded-xl bg-white dark:bg-black/20 border border-border-subtle hover:border-primary transition-colors"
                        onClick={() => perbaruiCatatan(catatan.id, { konflik: [] })}
                      >
                        <div className="font-bold text-xs">Gunakan Versi Ini (Lokal)</div>
                        <div className="text-[10px] opacity-50">Diperbarui: {new Date(catatan.diperbaruiPada).toLocaleString()}</div>
                      </button>
                      {catatan.konflik.map((k, i) => (
                        <button
                          key={i}
                          className="text-left p-3 rounded-xl bg-white dark:bg-black/20 border border-border-subtle hover:border-primary transition-colors"
                          onClick={() => {
                            perbaruiCatatan(catatan.id, {
                              judul: k.judul,
                              konten: k.konten,
                              versi: k.versi,
                              konflik: catatan.konflik?.filter((_, idx) => idx !== i)
                            });
                            setJudul(k.judul);
                            setKonten(k.konten);
                          }}
                        >
                          <div className="font-bold text-xs text-primary">Gunakan Versi {k.versi} (Konflik)</div>
                          <div className="text-[10px] opacity-50">Diperbarui: {new Date(k.diperbaruiPada).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {moods.map(m => (
                    <button
                      key={m}
                      className={`text-2xl p-2 rounded-xl transition-all ${catatan?.mood === m ? 'bg-primary-soft scale-110 border border-primary' : 'hover:bg-surface-alt border border-transparent'}`}
                      onClick={() => {
                        if (catatan) perbaruiCatatan(catatan.id, { mood: m });
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="editor-title-input"
                  placeholder="Judul"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  onBlur={handleSave}
                />
                <div
                  contentEditable
                  className="editor-block-area w-full min-h-[500px]"
                  onBlur={(e) => {
                    // KEAMANAN: Sanitisasi konten sebelum disimpan untuk mencegah XSS.
                    const newContent = DOMPurify.sanitize(e.currentTarget.innerHTML);
                    setKonten(newContent);
                    if (catatan) perbaruiCatatan(catatan.id, { konten: newContent });
                  }}
                  // KEAMANAN: Sanitisasi konten sebelum dirender melalui dangerouslySetInnerHTML.
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(konten) }}
                />
              </div>

              <div className="editor-toolbar">
                <button
                  className="toolbar-btn-ios text-primary"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                >
                  {isSummarizing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
                <div className="w-[1px] h-6 bg-border-subtle mx-2" />
                <button className="toolbar-btn-ios" onClick={() => handleFormat('bold')}><Bold size={20} /></button>
                <button className="toolbar-btn-ios" onClick={() => handleFormat('italic')}><Italic size={20} /></button>
                <button className="toolbar-btn-ios" onClick={() => handleFormat('insertUnorderedList')}><List size={20} /></button>
                <div className="w-[1px] h-6 bg-border-subtle mx-2" />
                <button className="toolbar-btn-ios" onClick={handleAddImage}><ImageIcon size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BilikAksara;
