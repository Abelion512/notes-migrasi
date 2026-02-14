'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, FileText, Pin, Copy, Check
} from 'lucide-react';
import { Note } from '@/aksara/Rumus';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { getIconForService } from '@/aksara/IkonLayanan';
import { formatWaktuRelatif } from '@/aksara/Waktu';

interface BarisCatatanProps {
    note: Note;
    isSelected: boolean;
    isEditMode: boolean;
    onToggle: (id: string) => void;
    onCopy: (e: React.MouseEvent, note: Note) => void;
    isCopied: boolean;
}

let sharedParser: DOMParser | null = null;

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return "";
    if (!sharedParser) sharedParser = new DOMParser();
    const doc = sharedParser.parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

export const BarisCatatan = memo(({
    note, isSelected, isEditMode, onToggle, onCopy, isCopied
}: BarisCatatanProps) => {
    const [preview, setPreview] = useState<string>('Memuat...');
    const serviceIcon = getIconForService(note.title, 24);

    useEffect(() => {
        let isMounted = true;

        const loadPreview = async () => {
            try {
                if (note.content.includes('|')) {
                    const decrypted = await Arsip.decryptNote(note);
                    if (isMounted) {
                        const text = stripHtml(decrypted.content);
                        setPreview(text.length > 80 ? text.substring(0, 80) + '...' : text || 'Tanpa isi');
                    }
                } else {
                    if (isMounted) setPreview(note.content || 'Tanpa isi');
                }
            } catch (err) {
                if (isMounted) setPreview('⚠️ Terkunci');
            }
        };

        const timeout = setTimeout(loadPreview, 50);
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [note.id, note.content, note.updatedAt]);

    const handleDoubleClick = () => {
        if (!isEditMode) {
            navigator.clipboard.writeText(note.title || "Tanpa Judul");
            haptic.success();
        }
    };

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                    <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center flex-shrink-0 text-blue-500 overflow-hidden border border-blue-500/10 shadow-sm transition-transform group-hover:scale-105">
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
                        <span className="text-[10px] font-bold text-[var(--text-muted)] whitespace-nowrap opacity-60 uppercase tracking-tighter">
                            {formatWaktuRelatif(note.updatedAt)}
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
                                    className="p-1 rounded-md hover:bg-blue-500/10 text-blue-500 active:scale-90 transition-transform"
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
});
