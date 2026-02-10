'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(
    () => import('@/components/features/editor/TiptapEditor').then(mod => mod.TiptapEditor),
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
            await VaultRepository.saveNote({
                id: crypto.randomUUID(), // Let repo re-generate if needed, but good to have
                title: title || 'Tanpa Judul',
                content: content,
                folderId: null,
                isPinned: false,
                isFavorite: false,
                tags: [],
                createdAt: new Date().toISOString(),
            });
            router.push('/');
        } catch (error) {
            console.error('Failed to save note:', error);
            alert('Gagal menyimpan catatan. Pastikan Vault terbuka.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            {/* Toolbar */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--separator)] bg-[var(--glass-bg)] backdrop-blur-md sticky top-0 z-40">
                <Link href="/" className="text-[var(--text-primary)] text-sm font-medium">
                    Batal
                </Link>
                <div className="font-semibold text-sm">Catatan Baru</div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || (!title && !content)}
                    className="text-[var(--primary)] text-sm font-bold disabled:opacity-50"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            {/* Editor Placeholder */}
            <div className="flex-1 p-5 overflow-y-auto">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/50 mb-4"
                    autoFocus
                />
                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Mulai menulis kisah Anda..."
                />
            </div>
        </div>
    );
}
