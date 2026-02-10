'use client';

import React, { useEffect, useState } from 'react';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { Note } from '@/types';
import Link from 'next/link';
import { FileText, Loader2 } from 'lucide-react';
import { stripHtml, truncate } from '@/lib/utils/html';

export default function Home() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const data = await VaultRepository.getAllNotes();
                setNotes(data);
            } catch (error) {
                console.error('Failed to load notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotes();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-24">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Catatan</h1>

            {notes.length === 0 ? (
                <div className="text-center mt-20 opacity-50 flex flex-col items-center">
                    <FileText className="w-16 h-16 mb-4 text-[var(--text-secondary)]" />
                    <p className="text-sm">Belum ada catatan.</p>
                    <Link href="/tambah" className="mt-4 text-[var(--primary)] font-semibold text-sm icon-link">
                        Buat Catatan Baru
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {notes.map((note) => (
                        <div key={note.id} className="glass-card p-4 active:scale-[0.98] transition-all cursor-pointer">
                            <h3 className="font-semibold text-base mb-1 truncate">{note.title}</h3>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                {truncate(stripHtml(note.content), 100)}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--text-secondary)]/70 uppercase tracking-wider">
                                <span>{new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                {note.folderId && <span>• Folder</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
