'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, ChevronRight, FileText, MoreVertical,
    Trash2, Download, Share2, Clock, Copy, Check, Pin
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

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const truncate = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const noOfWords = content.split(/\s/g).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.ceil(minutes);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        haptic.light();
    };

    const handleCopy = (e: React.MouseEvent, note: Note) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(note.title);
        setCopiedId(note.id);
        haptic.success();
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} catatan secara permanen?`)) return;
        haptic.heavy();
        for (const id of selectedIds) {
            await Arsip.deleteNote(id);
        }
        setSelectedIds([]);
        setIsEditMode(false);
        loadNotes();
    };

    const handleBulkZip = async () => {
        const zip = new JSZip();
        for (const id of selectedIds) {
            const note = notes.find(n => n.id === id);
            if (note) {
                zip.file(`${note.title || 'Tanpa Judul'}.md`, stripHtml(note.content));
            }
        }
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Abelion_Archive_${new Date().getTime()}.zip`);
        haptic.success();
    };

    const handleBulkMerge = async () => {
        let merged = "";
        for (const id of selectedIds) {
            const note = notes.find(n => n.id === id);
            if (note) {
                merged += `# ${note.title}\n\n${stripHtml(note.content)}\n\n---\n\n`;
            }
        }
        const blob = new Blob([merged], { type: "text/markdown;charset=utf-8" });
        saveAs(blob, `Merged_Notes_${new Date().getTime()}.md`);
        haptic.success();
    };

    const NoteRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const note = notes[index];
        const isSelected = selectedIds.includes(note.id);
        const serviceIcon = getIconForService(note.title, 24);

        return (
            <div style={style} className="px-2">
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
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all active:bg-blue-500/5 cursor-pointer relative group ${isSelected ? 'bg-blue-500/10' : ''}`}
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
                            <p className="text-[13px] text-[var(--text-secondary)] truncate leading-snug">
                                {truncate(stripHtml(note.content), 60) || 'Tidak ada teks tambahan'}
                            </p>
                            {!isEditMode && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleCopy(e, note)}
                                        className="p-1 rounded-md hover:bg-blue-500/10 text-blue-500"
                                    >
                                        {copiedId === note.id ? <Check size={14} /> : <Copy size={14} className="opacity-40" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 w-full flex flex-col h-screen">
            <header className="snappy-header">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tight">Catatan</h1>
                    <button
                        onClick={() => { setShowGraph(true); haptic.light(); }}
                        className="p-1.5 rounded-full hover:bg-blue-500/10 text-blue-500 active:opacity-40 transition-colors"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
                <button
                    onClick={() => { setIsEditMode(!isEditMode); setSelectedIds([]); haptic.light(); }}
                    className="text-blue-500 font-bold text-[15px] active:opacity-40 transition-all hover:bg-blue-500/5 px-3 py-1 rounded-full"
                >
                    {isEditMode ? 'Selesai' : 'Edit'}
                </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                {isLoading ? (
                    <div className="p-5"><KerangkaCatatan /></div>
                ) : notes.length === 0 ? (
                    <div className="text-center mt-32 opacity-10 flex flex-col items-center">
                        <FileText className="w-24 h-24 mb-4 stroke-[1px]" />
                        <p className="text-xs font-bold uppercase tracking-widest">Kosong</p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full py-4">
                        {notes.map((note, index) => {
                            const isFocused = focusedIndex === index;
                            const isSelected = selectedIds.includes(note.id);
                            const serviceIcon = getIconForService(note.title, 24);

                            return (
                                <div key={note.id} className="relative">
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
                                                <p className="text-[13px] text-[var(--text-secondary)] truncate leading-snug">
                                                    {truncate(stripHtml(note.content), 80) || 'Tidak ada teks tambahan'}
                                                </p>
                                                {!isEditMode && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => handleCopy(e, note)}
                                                            className="p-1 rounded-md hover:bg-blue-500/10 text-blue-500"
                                                        >
                                                            {copiedId === note.id ? <Check size={14} /> : <Copy size={14} className="opacity-40" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                    {index < notes.length - 1 && (
                                        <div className="h-[0.5px] bg-[var(--separator)]/10 ml-16" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
