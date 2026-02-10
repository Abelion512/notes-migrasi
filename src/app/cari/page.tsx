'use client';

import React, { useState, useEffect } from 'react';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { Note } from '@/types';
import Link from 'next/link';
import { Search as SearchIcon, ChevronRight, FileX } from 'lucide-react';
import { stripHtml, truncate } from '@/lib/utils/html';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const data = await VaultRepository.getAllNotes();
                setNotes(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setFilteredNotes([]);
            return;
        }

        const filtered = notes.filter(note =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredNotes(filtered);
    }, [query, notes]);

    return (
        <div className="flex-1 flex flex-col h-screen px-5 pt-14 pb-32 overflow-hidden">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Cari</h1>

            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <SearchIcon size={18} />
                </div>
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Judul atau isi catatan..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:ring-2 focus:ring-primary focus:outline-none shadow-sm text-base"
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {!query.trim() ? (
                    <div className="text-center mt-20 opacity-30 px-10">
                        <p className="text-sm font-medium">Ketik sesuatu untuk mulai mencari di seluruh arsip terenkripsi Anda.</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center mt-20 opacity-30 flex flex-col items-center">
                        <FileX className="w-16 h-16 mb-4 stroke-[1px]" />
                        <p className="text-sm font-medium">Tidak ditemukan hasil untuk "{query}"</p>
                    </div>
                ) : (
                    <div className="ios-list-group">
                        {filteredNotes.map((note, index) => (
                            <React.Fragment key={note.id}>
                                <Link href={`/catatan/${note.id}`} className="ios-list-item group">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-base font-semibold mb-0.5 truncate">{note.title || 'Tanpa Judul'}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-primary opacity-40">
                                                {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                                {truncate(stripHtml(note.content), 60)}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-[var(--text-secondary)]/30" />
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
