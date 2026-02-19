'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Shield, Zap,
    Command, Download, Play, Copy, Check,
    Lock, Database, Search, ChevronLeft
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';

const BlokKode = ({ kode }: { kode: string }) => {
    const [copied, setCopied] = useState(false);

    const salin = () => {
        navigator.clipboard.writeText(kode);
        setCopied(true);
        haptic.success();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='relative group my-2'>
            <div className='bg-black/5 dark:bg-white/5 p-4 pr-12 rounded-2xl font-mono text-[13px] border border-[var(--separator)]/10 break-all transition-all group-hover:border-blue-500/30'>
                {kode}
            </div>
            <button
                onClick={salin}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[var(--surface)] shadow-md border border-[var(--separator)]/20 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95'
                title='Salin Kode'
            >
                {copied ? <Check size={16} className='text-green-500' /> : <Copy size={16} className='text-[var(--text-secondary)]' />}
            </button>
        </div>
    );
};

export default function DocumentationPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const SECTIONS = [
        { id: 'keamanan', title: 'Keamanan & Enkripsi', icon: Shield, color: 'text-green-500' },
        { id: 'performa', title: 'Performa Tinggi', icon: Zap, color: 'text-yellow-500' },
        { id: 'cli-install', title: 'Instalasi CLI', icon: Download, color: 'text-blue-500' },
        { id: 'cli-start', title: 'Menjalankan CLI', icon: Play, color: 'text-blue-500' },
        { id: 'perintah', title: 'Referensi Perintah', icon: Command, color: 'text-blue-500' },
        { id: 'struktur', title: 'Struktur Data', icon: Database, color: 'text-blue-500' },
    ];

    const filteredSections = useMemo(() => {
        if (!searchQuery) return SECTIONS;
        return SECTIONS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <div className='flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar scroll-smooth bg-[var(--background)]'>
            {/* Header */}
            <header className="sticky top-0 z-50 p-4 sm:p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--separator)]/10">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black">L</div>
                        <span className="font-black text-sm tracking-tighter uppercase">Bantuan</span>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-4 relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Cari dokumentasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--separator)]/20 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />
                    <Link href="/arsip" className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Buka Brankas
                    </Link>
                </div>
            </header>

            <main className='max-w-4xl mx-auto w-full px-6 py-12'>
                {/* Mobile Search */}
                <div className="relative mb-10 md:hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Cari dokumentasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--surface)] border border-[var(--separator)]/20 rounded-2xl py-4 pl-10 pr-4 text-sm outline-none shadow-sm"
                    />
                </div>

                <div className="mb-16">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Pusat Bantuan</h1>
                    <p className="text-lg text-[var(--text-secondary)] font-medium">Pelajari cara menguasai kedaulatan data Anda dengan Lembaran.</p>
                </div>

                <div className="grid grid-cols-1 gap-20">
                    {filteredSections.map(section => {
                        const Icon = section.icon;
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <h2 className={`text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3 ${section.color}`}>
                                    <Icon size={20} /> {section.title}
                                </h2>

                                {section.id === 'keamanan' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Lock size={18} className="text-green-500" /> Brankas Lokal
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                                                Data Anda tidak pernah meninggalkan perangkat tanpa izin. Enkripsi dilakukan di level aplikasi menggunakan kunci yang hanya Anda ketahui.
                                            </p>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Shield size={18} className="text-blue-500" /> AES-GCM 256
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                                                Algoritma standar industri yang menyediakan enkripsi data sekaligus verifikasi integritas data secara otomatis.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {section.id === 'cli-install' && (
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                                            <h3 className="text-lg font-bold mb-4">Metode Rekomendasi</h3>
                                            <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">
                                                Gunakan Bun untuk instalasi tercepat:
                                            </p>
                                            <BlokKode kode="bun install -g Abelion512/lembaran" />
                                        </div>
                                    </div>
                                )}

                                {section.id === 'perintah' && (
                                    <div className="ios-list-group overflow-hidden bg-[var(--surface)] border border-[var(--separator)]/10">
                                        <div className="divide-y divide-[var(--separator)]/10">
                                            {[
                                                { cmd: 'lembaran pantau', desc: 'Memeriksa status sistem dan kesehatan database.' },
                                                { cmd: 'lembaran jelajah', desc: 'Membuka penjelajah catatan dengan fitur pencarian fuzzy.' },
                                                { cmd: 'lembaran ukir <id>', desc: 'Mengedit catatan langsung melalui terminal.' },
                                                { cmd: 'lembaran tanam', desc: 'Mengimpor catatan secara massal.' },
                                                { cmd: 'lembaran petik', desc: 'Mengekspor brankas ke format terenkripsi.' },
                                            ].map((item) => (
                                                <div key={item.cmd} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <code className="text-xs font-black text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-lg w-fit">{item.cmd}</code>
                                                    <span className="text-xs font-medium text-[var(--text-secondary)]">{item.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Info placeholder for other sections if needed */}
                                {['performa', 'cli-start', 'struktur'].includes(section.id) && (
                                    <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 opacity-60">
                                        <p className="text-sm italic">Detail teknis untuk {section.title} sedang disempurnakan.</p>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>

                <footer className="pt-24 border-t border-[var(--separator)]/10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        © 2026 Lembaran Documentation Engine.
                    </p>
                </footer>
            </main>
        </div>
    );
}
