'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KonfirmasiModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

const KonfirmasiModal: React.FC<KonfirmasiModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya',
  cancelText = 'Batal',
  isDanger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-sheet show" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 20000 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="modal-content"
          >
            <div style={{ padding: '20px 16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 600 }}>{title}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>{message}</p>
            </div>
            <div className="alert-buttons">
              <button onClick={onCancel} className="alert-button">
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`alert-button bold ${isDanger ? 'danger' : ''}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KonfirmasiModal;
