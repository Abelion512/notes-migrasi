'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, ChevronRight, FileText, MoreVertical,
    Trash2, Download, Share2, Clock, Copy, Check
} from 'lucide-react';
import { usePundi } from '@/aksara/Pundi';
import { Arsip } from '@/aksara/Arsip';
import { Note } from '@/aksara/Rumus';
import { haptic } from '@/aksara/Indera';
import { getIconForService } from '@/aksara/IkonLayanan';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Sortable from 'sortablejs';
import { List } from 'react-window';
import { KerangkaCatatan } from '@/komponen/bersama/KerangkaCatatan';
import { PetaCatatan } from '@/komponen/fitur/Peta/PetaCatatan';
import { useRouter } from 'next/navigation';

export default function NoteListPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showGraph, setShowGraph] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const sortableRef = useRef<Sortable | null>(null);
    const router = useRouter();

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const allNotes = await Arsip.getAllNotes();
            const sorted = [...allNotes].sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
            setNotes(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    useEffect(() => {
        if (!isEditMode && listRef.current && notes.length > 0 && notes.length <= 15) {
            sortableRef.current = Sortable.create(listRef.current, {
                animation: 150,
                handle: '.drag-handle',
                ghostClass: 'opacity-50',
                onEnd: async (evt) => {
                    const { oldIndex, newIndex } = evt;
                    if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                        haptic.light();
                        const newNotes = [...notes];
                        const [moved] = newNotes.splice(oldIndex, 1);
                        newNotes.splice(newIndex, 0, moved);
                        setNotes(newNotes);
                    }
                }
            });
        }

        return () => {
            if (sortableRef.current) {
                sortableRef.current.destroy();
                sortableRef.current = null;
            }
        };
    }, [isEditMode, notes.length]);

    // Keyboard Navigation (J/K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditMode || showGraph || isLoading) return;

            if (e.key === 'j') {
                setFocusedIndex(prev => Math.min(prev + 1, notes.length - 1));
            } else if (e.key === 'k') {
                setFocusedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && focusedIndex >= 0) {
                router.push(`/catatan/${notes[focusedIndex].id}`);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditMode, showGraph, notes, focusedIndex, isLoading, router]);

    const toggleSelection = (id: string) => {
        haptic.light();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        haptic.heavy();
        if (!confirm(`Hapus ${selectedIds.length} catatan secara permanen?`)) return;

        setIsLoading(true);
        for (const id of selectedIds) {
            await Arsip.deleteNote(id);
        }
        setSelectedIds([]);
        setIsEditMode(false);
        await loadNotes();
        haptic.success();
    };

    const handleBulkZip = async () => {
        const zip = new JSZip();
        const selectedNotes = notes.filter(n => selectedIds.includes(n.id));

        selectedNotes.forEach(note => {
            zip.file(`${note.title || 'Tanpa Judul'}.md`, note.content);
        });

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "arsip-abelion.zip");
        setSelectedIds([]);
        setIsEditMode(false);
        haptic.success();
    };

    const handleBulkMerge = async () => {
        const selectedNotes = notes.filter(n => selectedIds.includes(n.id));
        const mergedContent = selectedNotes
            .map(n => `# ${n.title || 'Tanpa Judul'}\n\n${n.content}`)
            .join('\n\n---\n\n');

        const blob = new Blob([mergedContent], { type: "text/markdown;charset=utf-8" });
        saveAs(blob, "gabungan-catatan.md");
        setSelectedIds([]);
        setIsEditMode(false);
        haptic.success();
    };

    const calculateReadingTime = (text: string) => {
        const wordsPerMinute = 200;
        const noOfWords = (text || '').split(/\s+/).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.max(1, Math.ceil(minutes));
    };

    const stripHtml = (html: string) => {
        if (typeof document === 'undefined') return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const truncate = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const handleCopy = (e: React.MouseEvent, note: Note) => {
        e.preventDefault();
        e.stopPropagation();
        haptic.light();
        const plainContent = stripHtml(note.content);
        navigator.clipboard.writeText(plainContent);
        setCopiedId(note.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const NoteRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const note = notes[index];
        const isSelected = selectedIds.includes(note.id);
        const isFocused = focusedIndex === index;
        const serviceIcon = getIconForService(note.title);

        return (
            <div style={style}>
                <div
                    onClick={() => isEditMode ? toggleSelection(note.id) : null}
                                        onDoubleClick={(e) => {
                                            if (!isEditMode) {
                                                navigator.clipboard.writeText(note.title || "Tanpa Judul");
                                                setCopiedId(note.id);
                                                haptic.success();
                                                setTimeout(() => setCopiedId(null), 2000);
                                            }
                                        }}
                    className={`ios-list-item group h-full transition-colors ${isFocused ? 'bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]' : ''}`}
                >
                    {isEditMode ? (
                        <div className="mr-3">
                            <CheckCircle2
                                size={20}
                                className={isSelected ? 'text-blue-500' : 'text-blue-500/10'}
                                fill={isSelected ? 'currentColor' : 'none'}
                            />
                        </div>
                    ) : (
                        <div className="mr-3 w-6 flex items-center justify-center">
                            {serviceIcon || <div className="drag-handle text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 transition-opacity"><MoreVertical size={18} /></div>}
                        </div>
                    )}
                    <Link
                        href={isEditMode ? '#' : `/catatan/${note.id}`}
                        className="flex-1 min-w-0 pr-4"
                        onClick={(e) => isEditMode && e.preventDefault()}
                    >
                        <h3 className="text-base font-semibold mb-0.5 truncate">{note.title || 'Tanpa Judul'}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-blue-500 opacity-40 whitespace-nowrap">
                                {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                {truncate(stripHtml(note.content), 40) || 'Tidak ada teks tambahan'}
                            </p>
                            <span className="mx-1 opacity-10 text-[10px]">•</span>
                            <span className="inline-flex items-center gap-0.5 opacity-30 text-[10px] font-bold">
                                <Clock size={10} />
                                {calculateReadingTime(note.content)} m
                            </span>
                        </div>
                    </Link>
                    {!isEditMode && (
                        <button
                            onClick={(e) => handleCopy(e, note)}
                            className="p-2 rounded-full hover:bg-[var(--primary)]/5 transition-colors mr-1"
                        >
                            {copiedId === note.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-[var(--text-secondary)]/30" />}
                        </button>
                    )}
                    {!isEditMode && <ChevronRight size={14} className="text-[var(--text-secondary)]/30" />}
                </div>
                <div className="ios-separator"></div>
            </div>
        );
    };

    const VirtualList = List as any;

    return (
        <div className="flex-1 w-full max-w-2xl mx-auto px-5 pt-14 pb-48">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Catatan</h1>
                    <button
                        onClick={() => { setShowGraph(true); haptic.light(); }}
                        className="p-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] active:opacity-40"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
                <button
                    onClick={() => { setIsEditMode(!isEditMode); setSelectedIds([]); haptic.light(); }}
                    className="text-blue-500 font-medium text-[17px] active:opacity-40 transition-opacity"
                >
                    {isEditMode ? 'Selesai' : 'Edit'}
                </button>
            </header>

            {isLoading ? (
                <KerangkaCatatan />
            ) : notes.length === 0 ? (
                <div className="text-center mt-32 opacity-20 flex flex-col items-center">
                    <FileText className="w-24 h-24 mb-4 stroke-[1px]" />
                    <p className="text-sm font-bold uppercase tracking-widest">Kosong</p>
                </div>
            ) : (
                <div className="ios-list-group">
                    {notes.length > 15 ? (
                        <div style={{ height: 'calc(100vh - 350px)' }}>
                            <VirtualList
                                height={600}
                                rowCount={notes.length}
                                rowHeight={72}
                                width="100%"
                                rowComponent={NoteRow}
                                className="no-scrollbar"
                            />
                        </div>
                    ) : (
                        <div ref={listRef}>
                            {notes.map((note, index) => {
                                const isFocused = focusedIndex === index;
                                const isSelected = selectedIds.includes(note.id);
                                const serviceIcon = getIconForService(note.title);

                                return (
                                <div key={note.id} className="relative overflow-hidden">
                                    <div
                                        onClick={() => isEditMode ? toggleSelection(note.id) : null}
                                        onDoubleClick={(e) => {
                                            if (!isEditMode) {
                                                navigator.clipboard.writeText(note.title || "Tanpa Judul");
                                                setCopiedId(note.id);
                                                haptic.success();
                                                setTimeout(() => setCopiedId(null), 2000);
                                            }
                                        }}
                                        className={`ios-list-item group ${isFocused ? 'bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]' : ''}`}
                                    >
                                        {isEditMode ? (
                                            <div className="mr-3">
                                                <CheckCircle2
                                                    size={20}
                                                    className={isSelected ? 'text-blue-500' : 'text-blue-500/10'}
                                                    fill={isSelected ? 'currentColor' : 'none'}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mr-3 w-6 flex items-center justify-center">
                                                {serviceIcon || <div className="drag-handle text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 transition-opacity"><MoreVertical size={18} /></div>}
                                            </div>
                                        )}
                                        <Link
                                            href={isEditMode ? '#' : `/catatan/${note.id}`}
                                            className="flex-1 min-w-0 pr-4"
                                            onClick={(e) => isEditMode && e.preventDefault()}
                                        >
                                            <h3 className="text-base font-semibold mb-0.5 truncate">{note.title || 'Tanpa Judul'}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-medium text-blue-500 opacity-40 whitespace-nowrap">
                                                    {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                                    {truncate(stripHtml(note.content), 40) || 'Tidak ada teks tambahan'}
                                                </p>
                                                <span className="mx-1 opacity-10 text-[10px]">•</span>
                                                <span className="inline-flex items-center gap-0.5 opacity-30 text-[10px] font-bold">
                                                    <Clock size={10} />
                                                    {calculateReadingTime(note.content)} m
                                                </span>
                                            </div>
                                        </Link>
                                        {!isEditMode && (
                                            <button
                                                onClick={(e) => handleCopy(e, note)}
                                                className="p-2 rounded-full hover:bg-[var(--primary)]/5 transition-colors mr-1"
                                            >
                                                {copiedId === note.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-[var(--text-secondary)]/30" />}
                                            </button>
                                        )}
                                        {!isEditMode && <ChevronRight size={14} className="text-[var(--text-secondary)]/30 group-active:text-[var(--text-secondary)]/50" />}
                                    </div>
                                    {index < notes.length - 1 && <div className="ios-separator"></div>}
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {isEditMode && selectedIds.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
                    <div className="glass-card flex items-center justify-between px-6 py-4 rounded-[2rem] shadow-2xl border-blue-500/20 bg-blue-500/5">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-500 uppercase">{selectedIds.length} Terpilih</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={handleBulkZip} className="p-2 text-blue-500 active:opacity-40" title="Zip Archive">
                                <Download size={20} />
                            </button>
                            <button onClick={handleBulkMerge} className="p-2 text-blue-500 active:opacity-40" title="Merge to Markdown">
                                <FileText size={20} />
                            </button>
                            <button onClick={handleBulkDelete} className="p-2 text-red-500 active:opacity-40" title="Delete Permanent">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showGraph && <PetaCatatan onClose={() => setShowGraph(false)} />}
        </div>
    );
}
