'use client';

import { haptic } from '@/lib/utils/haptics';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    FileText,
    ChevronRight,
    CheckCircle2,
    Trash2,
    Download,
    FilePlus,
    MoreVertical
} from 'lucide-react';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { Note } from '@/types';
import { truncate, stripHtml } from '@/lib/utils/html';
import { NoteSkeleton } from '@/components/shared/NoteSkeleton';
// @ts-ignore
import { List } from 'react-window';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Sortable from 'sortablejs';

export default function Home() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const loadNotes = async () => {
        try {
            const data = await VaultRepository.getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setTimeout(() => setIsLoading(false), 400);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    // Drag & Drop implementation
    useEffect(() => {
        if (!isLoading && listRef.current && notes.length > 0 && notes.length <= 15) {
            const sortable = new Sortable(listRef.current, {
                animation: 150,
                handle: '.drag-handle',
                ghostClass: 'bg-primary/5',
                onEnd: (evt) => {
                    haptic.light();
                    // In a real app, we would update the order in DB here.
                    // Since we don't have an 'order' field yet, this is visual.
                    console.log('Order changed:', evt.oldIndex, evt.newIndex);
                }
            });
            return () => sortable.destroy();
        }
    }, [isLoading, notes.length]);

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
            await VaultRepository.deleteNote(id);
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

    const NoteRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const note = notes[index];
        const isSelected = selectedIds.includes(note.id);

        return (
            <div style={style}>
                <div
                    onClick={() => isEditMode ? toggleSelection(note.id) : null}
                    className="ios-list-item group h-full"
                >
                    {isEditMode && (
                        <div className="mr-3">
                            <CheckCircle2
                                size={20}
                                className={isSelected ? 'text-blue-500' : 'text-blue-500/10'}
                                fill={isSelected ? 'currentColor' : 'none'}
                            />
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
                                {truncate(stripHtml(note.content), 60) || 'Tidak ada teks tambahan'}
                            </p>
                        </div>
                    </Link>
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
                <h1 className="text-3xl font-bold tracking-tight">Catatan</h1>
                <button
                    onClick={() => { setIsEditMode(!isEditMode); setSelectedIds([]); haptic.light(); }}
                    className="text-blue-500 font-medium text-[17px] active:opacity-40 transition-opacity"
                >
                    {isEditMode ? 'Selesai' : 'Edit'}
                </button>
            </header>

            {isLoading ? (
                <NoteSkeleton />
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
                            {notes.map((note, index) => (
                                <div key={note.id} className="relative overflow-hidden">
                                    <div
                                        onClick={() => isEditMode ? toggleSelection(note.id) : null}
                                        className="ios-list-item group"
                                    >
                                        {!isEditMode && (
                                            <div className="drag-handle mr-3 cursor-grab active:cursor-grabbing text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical size={18} />
                                            </div>
                                        )}
                                        {isEditMode && (
                                            <div className="mr-3">
                                                <CheckCircle2
                                                    size={20}
                                                    className={selectedIds.includes(note.id) ? 'text-blue-500' : 'text-blue-500/10'}
                                                    fill={selectedIds.includes(note.id) ? 'currentColor' : 'none'}
                                                />
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
                                                    {truncate(stripHtml(note.content), 60) || 'Tidak ada teks tambahan'}
                                                </p>
                                            </div>
                                        </Link>
                                        {!isEditMode && <ChevronRight size={14} className="text-[var(--text-secondary)]/30 group-active:text-[var(--text-secondary)]/50" />}
                                    </div>
                                    {index < notes.length - 1 && <div className="ios-separator"></div>}
                                </div>
                            ))}
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
        </div>
    );
}
