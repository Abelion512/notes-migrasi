'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Arsip } from '@/aksara/Arsip';
import { Note } from '@/aksara/Rumus';
import Link from 'next/link';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import { stripHtml, truncate } from '@/aksara/Penyaring';
import { KerangkaCatatan } from '@/komponen/bersama/KerangkaCatatan';
import { useGunakanTunda } from '@/aksara/GunakanTunda';
import { IlustrasiKosong } from "@/komponen/bersama/IlustrasiKosong";

const Highlight = React.memo(({ text, query }: { text: string, query: string }) => {
    if (!query.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/50 text-inherit rounded-sm px-0.5">{part}</mark>
                    : part
            )}
        </>
    );
});

Highlight.displayName = 'Highlight';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const debouncedQuery = useGunakanTunda(query, 300);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const data = await Arsip.getAllNotes();
                setNotes(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, []);

    const filteredNotes = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        return notes.filter(note =>
            note.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
    }, [debouncedQuery, notes]);

    return (
        <div className="flex-1 flex flex-col min-h-0 px-5 pt-14 pb-32 overflow-hidden bg-[var(--background)]">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Cari</h1>

            <div className="relative mb-8">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <SearchIcon size={20} />
                </div>
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Judul atau isi catatan..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface)] border-none focus:ring-2 focus:ring-[var(--primary)] focus:outline-none shadow-sm text-[17px] placeholder:opacity-40"
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {isLoading ? (
                    <KerangkaCatatan />
                ) : !query.trim() ? (
                    <div className="text-center mt-20 opacity-30 px-10">
                        <p className="text-sm font-semibold uppercase tracking-widest mb-2">Jelajah Arsip</p>
                        <p className="text-xs font-medium">Ketik untuk mencari di dalam brankas terenkripsi.</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="mt-10">
                        <IlustrasiKosong pesan="Hasil Tidak Ditemukan" />
                    </div>
                ) : (
                    <div className="ios-list-group shadow-sm">
                        {filteredNotes.map((note, index) => (
                            <React.Fragment key={note.id}>
                                <Link href={`/catatan/${note.id}`} className="ios-list-item group">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-base font-semibold mb-0.5 truncate">
                                            <Highlight text={note.title || 'Tanpa Judul'} query={debouncedQuery} />
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-[var(--primary)] opacity-40">
                                                {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                                <Highlight text={truncate(stripHtml(note.content), 80)} query={debouncedQuery} />
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-[var(--separator)]" />
                                </Link>
                                {index < filteredNotes.length - 1 && <div className="ios-separator"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
