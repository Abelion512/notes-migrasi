'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { getIconForService } from '@/aksara/IkonLayanan';
import dynamic from 'next/dynamic';
import { ChevronLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PenyusunKredensial } from '@/komponen/fitur/Kredensial/PenyusunKredensial';

const PenyusunCatatan = dynamic(
    () => import('@/komponen/fitur/Penyusun/PenyusunCatatan').then(mod => mod.PenyusunCatatan),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

export default function AddNotePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCredentials, setIsCredentials] = useState(false);
    const [kredensial, setKredensial] = useState({ username: '', password: '', url: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim() && !title.trim() && !kredensial.username) return;

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
                isCredentials: isCredentials,
                kredensial: isCredentials ? kredensial : undefined
            });
            haptic.success();
            router.push('/');
        } catch (error) {
            console.error('Failed to save note:', error);
            haptic.error();
        } finally {
            setIsSaving(false);
        }
    };

    const currentIcon = isCredentials ? getIconForService(title, 28) : null;

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            <div className="snappy-header">
                <button onClick={() => { haptic.light(); router.back(); }} className="text-[var(--primary)] flex items-center gap-1 active:opacity-40 transition-opacity">
                    <ChevronLeft size={24} />
                    <span className="text-[17px] font-semibold">Batal</span>
                </button>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { haptic.medium(); setIsCredentials(!isCredentials); }} title='Identitas Credentials'
                        className={`p-2 rounded-full transition-all ${isCredentials ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}
                    >
                        {isCredentials ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </button>
                    <button onClick={handleSave} disabled={isSaving || (!title && !content && !kredensial.username)} className="text-[var(--primary)] text-[17px] font-bold">
                        Simpan
                    </button>
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-6 max-w-4xl mx-auto w-full">
                    {isCredentials && (
                        <div className="w-10 h-10 flex items-center justify-center bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--separator)]/10">
                            {currentIcon || <ShieldCheck size={24} className="text-[var(--primary)]" />}
                        </div>
                    )}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isCredentials ? "Nama Layanan / Akun..." : "Judul Catatan..."}
                        className="flex-1 text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20"
                        autoFocus
                    />
                </div>
                <div className="max-w-4xl mx-auto w-full">
                    {isCredentials && (
                        <PenyusunKredensial data={kredensial} onChange={(data) => setKredensial(data as any)} />
                    )}
                    <PenyusunCatatan
                        content={content}
                        onChange={setContent}
                        placeholder={isCredentials ? "Catatan tambahan..." : "Mulai menulis kisah Anda..."}
                    />
                </div>
                <div className="h-32" />
            </div>
        </div>
    );
}
