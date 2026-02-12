'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { useGunakanTunda } from '@/aksara/GunakanTunda';
import { Note } from '@/aksara/Rumus';
import { getIconForService } from '@/aksara/IkonLayanan';
import dynamic from 'next/dynamic';
import {
    ChevronLeft, Share, Trash2, MoreHorizontal,
    CloudCheck, Cloud, ShieldCheck, ShieldAlert
} from 'lucide-react';

const PenyusunCatatan = dynamic(
    () => import('@/komponen/fitur/Penyusun/PenyusunCatatan').then(mod => mod.PenyusunCatatan),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCredentials, setIsCredentials] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const debouncedTitle = useGunakanTunda(title, 2000);
    const debouncedContent = useGunakanTunda(content, 2000);
    const debouncedIsCreds = useGunakanTunda(isCredentials, 2000);

    useEffect(() => {
        const loadNote = async () => {
            try {
                const data = await Arsip.getNoteById(id);
                if (data) {
                    setNote(data);
                    setTitle(data.title);
                    setContent(data.content);
                    setIsCredentials(!!data.isCredentials);
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoaded(true);
            }
        };
        loadNote();
    }, [id, router]);

    useEffect(() => {
        if (isLoaded && note) {
            const autosave = async () => {
                if (debouncedTitle === note.title && debouncedContent === note.content && debouncedIsCreds === note.isCredentials) return;

                setSaveStatus('saving');
                try {
                    const updatedNote = await Arsip.saveNote({
                        ...note,
                        title: debouncedTitle || 'Tanpa Judul',
                        content: debouncedContent,
                        isCredentials: debouncedIsCreds,
                    });
                    setNote(updatedNote);
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                } catch (error) {
                    console.error('Autosave failed:', error);
                    setSaveStatus('idle');
                }
            };
            autosave();
        }
    }, [debouncedTitle, debouncedContent, debouncedIsCreds, isLoaded, note]);

    const handleSaveManual = async () => {
        if (!note) return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const updatedNote = await Arsip.saveNote({
                ...note,
                title: title || 'Tanpa Judul',
                content: content,
                isCredentials: isCredentials,
            });
            setNote(updatedNote);
            haptic.success();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save note:', error);
            haptic.error();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Hapus catatan ini secara permanen?')) return;
        haptic.heavy();
        try {
            await Arsip.deleteNote(id);
            router.push('/');
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex-1 flex flex-col h-screen bg-[var(--background)] p-10">
                <div className="h-8 w-1/3 bg-[var(--separator)]/20 rounded-lg mb-8 animate-pulse"></div>
                <div className="h-4 w-full bg-[var(--separator)]/10 rounded-lg mb-4 animate-pulse"></div>
            </div>
        );
    }

    const currentIcon = isCredentials ? getIconForService(title, 28) : null;

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            {/* Toolbar */}
            <div className="snappy-header">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { haptic.light(); router.back(); }}
                        className="text-[var(--primary)] flex items-center gap-1 active:opacity-40 transition-opacity"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                            {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : 'Editor'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {saveStatus === 'saved' && <CloudCheck size={20} className="text-green-500" />}

                    <button
                        onClick={() => { haptic.medium(); setIsCredentials(!isCredentials); }}
                        className={`p-2 rounded-full transition-all ${isCredentials ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}
                        title="Identitas Credentials"
                    >
                        {isCredentials ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </button>

                    <button
                        onClick={() => { haptic.light(); setShowOptions(!showOptions); }}
                        className="text-[var(--text-primary)] active:opacity-40"
                    >
                        <MoreHorizontal size={22} />
                    </button>
                    <button
                        onClick={handleSaveManual}
                        disabled={isSaving || (title === note?.title && content === note?.content && isCredentials === note?.isCredentials)}
                        className="text-[var(--primary)] text-[17px] font-bold disabled:opacity-30 transition-opacity"
                    >
                        {isSaving ? '...' : 'Selesai'}
                    </button>
                </div>
            </div>

            {showOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowOptions(false)} />
                    <div className="w-full max-w-sm glass-card p-2 z-10 shadow-2xl">
                        <button className="ios-list-item w-full text-left" onClick={() => setShowOptions(false)}>
                            <div className="flex items-center gap-3">
                                <Share size={18} className="text-[var(--primary)]" />
                                <span className="font-semibold">Bagikan</span>
                            </div>
                        </button>
                        <div className="ios-separator"></div>
                        <button className="ios-list-item w-full text-left" onClick={() => { setShowOptions(false); handleDelete(); }}>
                            <div className="flex items-center gap-3 text-red-500">
                                <Trash2 size={18} />
                                <span className="font-semibold">Hapus Permanen</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Editor */}
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
                    />
                </div>
                <div className="max-w-4xl mx-auto w-full">
                    <PenyusunCatatan
                        content={content}
                        onChange={(val) => {
                            setContent(val);
                            if (saveStatus === 'saved' || saveStatus === 'idle') {
                                setSaveStatus('idle');
                            }
                        }}
                        placeholder={isCredentials ? "Tulis detail akun..." : "Lanjutkan kisah..."}
                    />
                </div>
                <div className="h-32" />
            </div>
        </div>
    );
}
