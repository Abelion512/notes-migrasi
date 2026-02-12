'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { useGunakanTunda } from '@/aksara/GunakanTunda';
import { Note } from '@/aksara/Rumus';
import { getIconForService } from '@/aksara/IkonLayanan';
import dynamic from 'next/dynamic';
import {
    ChevronLeft, Trash2, MoreHorizontal,
    CloudCheck, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { PenyusunKredensial } from '@/komponen/fitur/Kredensial/PenyusunKredensial';

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
    const [kredensial, setKredensial] = useState({ username: '', password: '', url: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Debounce for autosave
    const debouncedTitle = useGunakanTunda(title, 1000);
    const debouncedContent = useGunakanTunda(content, 1000);
    const debouncedIsCreds = useGunakanTunda(isCredentials, 1000);
    const debouncedKred = useGunakanTunda(kredensial, 1000);

    // Track last saved state to prevent infinite loops
    const lastSavedHash = useRef("");

    useEffect(() => {
        const loadNote = async () => {
            try {
                const data = await Arsip.getNoteById(id);
                if (data) {
                    setNote(data);
                    setTitle(data.title);
                    setContent(data.content);
                    setIsCredentials(!!data.isCredentials);
                    if (data.kredensial) setKredensial(data.kredensial as any);

                    // Initialize hash
                    lastSavedHash.current = JSON.stringify({
                        title: data.title,
                        content: data.content,
                        isCredentials: !!data.isCredentials,
                        kredensial: data.kredensial
                    });
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
                const currentDataStr = JSON.stringify({
                    title: debouncedTitle,
                    content: debouncedContent,
                    isCredentials: debouncedIsCreds,
                    kredensial: debouncedKred
                });

                // Prevent recursive saves if content hasn't changed from what we just saved
                if (lastSavedHash.current === currentDataStr) return;

                // Compare with original note to avoid unnecessary work
                const isUnchangedFromOriginal = debouncedTitle === note.title &&
                                  debouncedContent === note.content &&
                                  debouncedIsCreds === note.isCredentials &&
                                  JSON.stringify(debouncedKred) === JSON.stringify(note.kredensial);

                if (isUnchangedFromOriginal) return;

                setSaveStatus('saving');
                try {
                    const updatedNote = await Arsip.saveNote({
                        ...note,
                        title: debouncedTitle || 'Tanpa Judul',
                        content: debouncedContent,
                        isCredentials: debouncedIsCreds,
                        kredensial: debouncedKred
                    });

                    lastSavedHash.current = currentDataStr;

                    // Update local note reference but keep decrypted values
                    setNote({
                        ...updatedNote,
                        content: debouncedContent,
                        kredensial: debouncedKred as any
                    });

                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                } catch (error) {
                    console.error('Autosave failed:', error);
                    setSaveStatus('idle');
                }
            };
            autosave();
        }
    }, [debouncedTitle, debouncedContent, debouncedIsCreds, debouncedKred, isLoaded, note]);

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
                kredensial: kredensial
            });

            lastSavedHash.current = JSON.stringify({ title, content, isCredentials, kredensial });

            setNote({
                ...updatedNote,
                content: content,
                kredensial: kredensial as any
            });

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
        return <div className="p-20 text-center opacity-30">Menyiapkan Enkripsi...</div>;
    }

    const currentIcon = isCredentials ? getIconForService(title, 28) : null;

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            <div className="snappy-header">
                <div className="flex items-center gap-2">
                    <button onClick={() => { haptic.light(); router.back(); }} className="text-[var(--primary)] active:opacity-40">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                        {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : 'Editor'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {saveStatus === 'saved' && <CloudCheck size={20} className="text-green-500" />}
                    <button
                        onClick={() => { haptic.medium(); setIsCredentials(!isCredentials); }} title='Identitas Credentials'
                        className={`p-2 rounded-full transition-all ${isCredentials ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}
                    >
                        {isCredentials ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </button>
                    <button onClick={() => { haptic.light(); setShowOptions(!showOptions); }} className="text-[var(--text-primary)]">
                        <MoreHorizontal size={22} />
                    </button>
                    <button onClick={handleSaveManual} disabled={isSaving} className="text-[var(--primary)] text-[17px] font-bold">
                        Selesai
                    </button>
                </div>
            </div>

            {showOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowOptions(false)} />
                    <div className="w-full max-w-sm glass-card p-2 z-10 shadow-2xl">
                        <button className="ios-list-item w-full text-left" onClick={() => { setShowOptions(false); handleDelete(); }}>
                            <div className="flex items-center gap-3 text-red-500">
                                <Trash2 size={18} />
                                <span className="font-semibold">Hapus Permanen</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-6 max-w-6xl mx-auto w-full">
                    {isCredentials && (
                        <div className="w-10 h-10 flex items-center justify-center bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--separator)]/10">
                            {currentIcon || <ShieldCheck size={24} className="text-[var(--primary)]" />}
                        </div>
                    )}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isCredentials ? "Layanan / Akun..." : "Judul..."}
                        className="flex-1 text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20"
                    />
                </div>

                <div className="max-w-6xl mx-auto w-full">
                    {isCredentials && (
                        <PenyusunKredensial data={kredensial} onChange={(data) => setKredensial(data as any)} />
                    )}
                    <PenyusunCatatan
                        content={content}
                        onChange={(val) => {
                            setContent(val);
                            if (saveStatus !== 'saving') setSaveStatus('idle');
                        }}
                        placeholder={isCredentials ? "Catatan tambahan (seperti pertanyaan keamanan)..." : "Mulai menulis..."}
                    />
                </div>
                <div className="h-32" />
            </div>
        </div>
    );
}
