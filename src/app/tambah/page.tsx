'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import dynamic from 'next/dynamic';
import { ChevronLeft } from 'lucide-react';

const TiptapEditor = dynamic(
    () => import('@/komponen/fitur/editor/TiptapEditor').then(mod => mod.TiptapEditor),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

export default function AddNotePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim() && !title.trim()) return;

        setIsSaving(true);
        try {
            await Arsip.saveNote({
                id: crypto.randomUUID(),
                title: title || 'Tanpa Judul',
                content: content,
                folderId: null,
                isPinned: false,
                isFavorite: false,
                tags: [],
                createdAt: new Date().toISOString(),
            });
            haptic.success();
            router.push('/');
        } catch (error) {
            console.error('Failed to save note:', error);
            haptic.error();
            alert('Gagal menyimpan catatan. Pastikan Vault terbuka.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            {/* Toolbar */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--separator)] bg-[var(--glass-bg)] backdrop-blur-md sticky top-0 z-40">
                <button
                    onClick={() => { haptic.light(); router.back(); }}
                    className="text-[var(--primary)] flex items-center gap-1 active:opacity-40 transition-opacity"
                >
                    <ChevronLeft size={24} />
                    <span className="text-[17px]">Batal</span>
                </button>
                <div className="font-semibold text-sm">Catatan Baru</div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || (!title && !content)}
                    className="text-[var(--primary)] text-[17px] font-bold disabled:opacity-30 transition-opacity"
                >
                    {isSaving ? '...' : 'Simpan'}
                </button>
            </div>

            {/* Editor */}
            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20 mb-6"
                    autoFocus
                />
                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Mulai menulis kisah Anda..."
                />
                <div className="h-32" />
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
        </div>
    );
}
