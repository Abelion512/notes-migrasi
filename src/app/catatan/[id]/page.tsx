'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { useGunakanTunda } from '@/aksara/GunakanTunda';
import { Note } from '@/types';
import dynamic from 'next/dynamic';
import { ChevronLeft, Share, Trash2, MoreHorizontal, CloudCheck, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TiptapEditor = dynamic(
    () => import('@/komponen/fitur/editor/TiptapEditor').then(mod => mod.TiptapEditor),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const debouncedTitle = useGunakanTunda(title, 2000);
    const debouncedContent = useGunakanTunda(content, 2000);

    useEffect(() => {
        const loadNote = async () => {
            try {
                const data = await Arsip.getNoteById(id);
                if (data) {
                    setNote(data);
                    setTitle(data.title);
                    setContent(data.content);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Failed to load note:', error);
                router.push('/');
            } finally {
                setIsLoaded(true);
            }
        };
        loadNote();
    }, [id, router]);

    // Autosave Effect
    useEffect(() => {
        if (isLoaded && note && (debouncedTitle !== note.title || debouncedContent !== note.content)) {
            const autosave = async () => {
                setSaveStatus('saving');
                try {
                    const updatedNote = await Arsip.saveNote({
                        ...note,
                        title: debouncedTitle || 'Tanpa Judul',
                        content: debouncedContent,
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
    }, [debouncedTitle, debouncedContent, isLoaded, note]);

    const handleSaveManual = async () => {
        if (!note) return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const updatedNote = await Arsip.saveNote({
                ...note,
                title: title || 'Tanpa Judul',
                content: content,
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
            <div className="flex-1 flex flex-col h-screen bg-[var(--background)] animate-pulse p-10">
                <div className="h-8 w-1/3 bg-[var(--separator)]/20 rounded-lg mb-8"></div>
                <div className="h-4 w-full bg-[var(--separator)]/10 rounded-lg mb-4"></div>
                <div className="h-4 w-full bg-[var(--separator)]/10 rounded-lg mb-4"></div>
                <div className="h-4 w-2/3 bg-[var(--separator)]/10 rounded-lg mb-4"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)]">
            {/* Toolbar */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--separator)] bg-[var(--glass-bg)] backdrop-blur-md sticky top-0 z-40">
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
                    <AnimatePresence>
                        {saveStatus === 'saved' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-green-500"
                            >
                                <CloudCheck size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => { haptic.light(); setShowOptions(!showOptions); }}
                        className="text-[var(--text-primary)] active:opacity-40"
                    >
                        <MoreHorizontal size={22} />
                    </button>
                    <button
                        onClick={handleSaveManual}
                        disabled={isSaving || (title === note?.title && content === note?.content)}
                        className="text-[var(--primary)] text-[17px] font-bold disabled:opacity-30 transition-opacity"
                    >
                        {isSaving ? '...' : 'Selesai'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showOptions && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOptions(false)}
                            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] p-4 pb-12"
                        >
                            <div className="ios-list-group shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20">
                                <button className="ios-list-item w-full text-left" onClick={() => { haptic.light(); setShowOptions(false); }}>
                                    <div className="flex items-center gap-3">
                                        <Share size={20} className="text-[var(--primary)]" />
                                        <span className="font-medium">Bagikan Catatan</span>
                                    </div>
                                </button>
                                <div className="ios-separator"></div>
                                <button
                                    className="ios-list-item w-full text-left"
                                    onClick={() => { setShowOptions(false); handleDelete(); }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Trash2 size={20} className="text-red-500" />
                                        <span className="font-medium text-red-500">Hapus Permanen</span>
                                    </div>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowOptions(false)}
                                className="w-full mt-3 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl font-bold text-[var(--primary)] text-lg shadow-lg"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Editor */}
            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20 mb-6"
                />
                <TiptapEditor
                    content={content}
                    onChange={(val) => {
                        setContent(val);
                        if (saveStatus === 'saved' || saveStatus === 'idle') {
                            setSaveStatus('idle');
                        }
                    }}
                    placeholder="Lanjutkan kisah Anda..."
                />

                <div className="h-32" />
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
        </div>
    );
}
