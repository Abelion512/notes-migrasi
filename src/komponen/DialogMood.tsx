'use client';

import React from 'react';

import { useAbelionStore } from '@/aksara/Pundi';

interface DialogMoodProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOOD_OPTIONS = [
    { emoji: '🤩', label: 'Sangat Baik', value: '🤩' },
    { emoji: '😊', label: 'Baik', value: '😊' },
    { emoji: '😐', label: 'Netral', value: '😐' },
    { emoji: '😔', label: 'Kurang', value: '😔' },
    { emoji: '😫', label: 'Buruk', value: '😫' },
];

export default function DialogMood({ isOpen, onClose }: DialogMoodProps) {
    const { setMood } = useAbelionStore();

    if (!isOpen) return null;

    const handleSelectMood = (emoji: string) => {
        const today = new Date().toISOString().split('T')[0];
        setMood(today, emoji);
        onClose();
    };

    return (
        <div className="about-modal show">
            <div className="about-modal-content">
                <div className="modal-header-ios">
                    <h3>Kondisi Hari Ini</h3>
                    <button className="done-btn" onClick={onClose}>Batal</button>
                </div>
                <div className="mood-options-grid">
                    {MOOD_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className="mood-option-btn"
                            onClick={() => handleSelectMood(option.value)}
                        >
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{option.emoji}</div>
                            <span style={{ fontSize: '12px' }}>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
