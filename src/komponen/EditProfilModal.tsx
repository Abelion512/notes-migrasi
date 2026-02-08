'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Profil } from '@/aksara/jenis';
import { useAbelionStore } from '@/aksara/Pundi';

interface EditProfilModalProps {
  isOpen: boolean;
  profil: Profil;
  onClose: () => void;
}

const EditProfilModal: React.FC<EditProfilModalProps> = ({ isOpen, profil, onClose }) => {
  const [nama, setNama] = useState(profil.nama);
  const [bio, setBio] = useState(profil.bio);
  const [avatar, setAvatar] = useState(profil.avatar);

  const { perbaruiProfil } = useAbelionStore();

  const handleSave = () => {
    perbaruiProfil({ nama, bio, avatar });
    onClose();
  };

  const avatars = [
    '/pustaka/citra/Avatar_Bawaan.svg',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Abel',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="about-modal show" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 10000 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="about-modal-content"
          >
            <div className="modal-header-ios">
              <h3>Edit Profil</h3>
              <button className="done-btn" onClick={handleSave}>Simpan</button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-center gap-4 mb-4">
                {avatars.map((a, idx) => (
                  <div key={a} className="relative w-12 h-12">
                    <Image
                      src={a}
                      alt={`Avatar option ${idx}`}
                      fill
                      className={`rounded-full cursor-pointer border-2 object-cover ${avatar === a ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setAvatar(a)}
                      sizes="48px"
                    />
                  </div>
                ))}
              </div>

              <div className="section-card">
                <input
                  type="text"
                  className="input-control border-b border-border-subtle"
                  placeholder="Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <textarea
                  className="input-control min-h-[80px]"
                  placeholder="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button className="ghost-btn text-danger mt-2" onClick={onClose}>Batal</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfilModal;
