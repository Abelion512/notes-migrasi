'use client';

import React, { useEffect, useState } from 'react';
import {
    FileText, Share2, Download, Trash2
} from 'lucide-react';
import { Arsip } from '@/aksara/Arsip';
import { Note } from '@/aksara/Rumus';
import { haptic } from '@/aksara/Indera';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { KerangkaCatatan } from '@/komponen/bersama/KerangkaCatatan';
import { PetaCatatan } from '@/komponen/fitur/Peta/PetaCatatan';
import { BarisCatatan } from '@/komponen/fitur/Daftar/BarisCatatan';

export default function NoteListPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showGraph, setShowGraph] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const allNotes = await Arsip.getAllNotes();
            setNotes(allNotes);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

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
                const decrypted = await Arsip.decryptNote(note);
                const stripHtml = (html: string) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    return doc.body.textContent || "";
                };
                zip.file(`${note.title || 'Tanpa Judul'}.md`, stripHtml(decrypted.content));
            }
        }
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Abelion_Archive_${new Date().getTime()}.zip`);
        haptic.success();
    };

    return (
        <div className="flex-1 w-full flex flex-col h-screen">
            <header className="snappy-header">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Catatan</h1>
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
                    <div className="max-w-5xl mx-auto w-full py-4">
                        {notes.map((note, index) => (
                            <BarisCatatan
                                key={note.id}
                                note={note}
                                isSelected={selectedIds.includes(note.id)}
                                isEditMode={isEditMode}
                                onToggle={toggleSelection}
                                onCopy={handleCopy}
                                isCopied={copiedId === note.id}
                            />
                        ))}
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
