'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, FileText, Pin, Copy, Check
} from 'lucide-react';
import { Note } from '@/aksara/Rumus';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { getIconForService } from '@/aksara/IkonLayanan';

interface BarisCatatanProps {
    note: Note;
    isSelected: boolean;
    isEditMode: boolean;
    onToggle: (id: string) => void;
    onCopy: (e: React.MouseEvent, note: Note) => void;
    isCopied: boolean;
}

export const BarisCatatan = ({
    note, isSelected, isEditMode, onToggle, onCopy, isCopied
}: BarisCatatanProps) => {
    const [preview, setPreview] = useState<string>('Memuat...');
    const serviceIcon = getIconForService(note.title, 24);

    useEffect(() => {
        let isMounted = true;

        const loadPreview = async () => {
            try {
                // Decrypt only if it's currently encrypted
                if (note.content.includes('|')) {
                    const decrypted = await Arsip.decryptNote(note);
                    if (isMounted) {
                        const stripHtml = (html: string) => {
                            if (typeof window === 'undefined') return "";
                            const doc = new DOMParser().parseFromString(html, 'text/html');
                            return doc.body.textContent || "";
                        };
                        const text = stripHtml(decrypted.content);
                        setPreview(text.length > 80 ? text.substring(0, 80) + '...' : text || 'Tanpa isi');
                    }
                } else {
                    setPreview(note.content || 'Tanpa isi');
                }
            } catch (err) {
                if (isMounted) setPreview('⚠️ Terkunci');
            }
        };

        // We use a small timeout to avoid blocking initial render of multiple items
        const timeout = setTimeout(loadPreview, 10);
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [note]);

    const handleDoubleClick = () => {
        if (!isEditMode) {
            navigator.clipboard.writeText(note.title || "Tanpa Judul");
            haptic.success();
            // We rely on parent for visual feedback if needed,
            // but double click usually implies silent success in this app
        }
    };

    return (
        <div className="relative">
            <div
                onClick={() => isEditMode ? onToggle(note.id) : null}
                onDoubleClick={handleDoubleClick}
                className={`flex items-center gap-3 px-4 py-3 transition-all active:bg-blue-500/5 cursor-pointer relative group ${isSelected ? 'bg-blue-500/10' : ''}`}
            >
                {isEditMode ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <CheckCircle2
                            size={22}
                            className={isSelected ? 'text-blue-500' : 'text-blue-500/20'}
                            fill={isSelected ? 'currentColor' : 'none'}
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center flex-shrink-0 text-blue-500 overflow-hidden border border-blue-500/10">
                        {serviceIcon || <FileText size={20} className="opacity-40" />}
                    </div>
                )}

                <Link
                    href={isEditMode ? '#' : `/catatan/${note.id}`}
                    className="flex-1 min-w-0"
                    onClick={(e) => isEditMode && e.preventDefault()}
                >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-[15px] font-bold truncate tracking-tight text-[var(--text-primary)]">
                                {note.title || 'Tanpa Judul'}
                            </h3>
                            {note.isPinned && <Pin size={12} className="text-blue-500 fill-blue-500 rotate-45 flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">
                            {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] text-[var(--text-secondary)] truncate leading-snug opacity-70">
                            {preview}
                        </p>
                        {!isEditMode && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => onCopy(e, note)}
                                    className="p-1 rounded-md hover:bg-blue-500/10 text-blue-500"
                                >
                                    {isCopied ? <Check size={14} /> : <Copy size={14} className="opacity-40" />}
                                </button>
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
};
