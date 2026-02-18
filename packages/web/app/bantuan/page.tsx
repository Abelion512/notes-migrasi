'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Terminal, Shield,
    Copy, Check, Download, Play,
    Lock, Key, RefreshCw, Zap, Globe, Github, Book
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
            <div className='bg-black/5 dark:bg-white/5 p-3 pr-10 rounded-xl font-mono text-[12px] border border-[var(--separator)]/10 break-all leading-relaxed'>
                <span className="text-[var(--primary)] mr-2">$</span>
                {kode}
            </div>
            <button
                onClick={salin}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--surface)] shadow-sm border border-[var(--separator)]/20 opacity-0 group-hover:opacity-100 transition-opacity active:opacity-50'
                title='Salin Kode'
            >
                {copied ? <Check size={14} className='text-green-500' /> : <Copy size={14} className='text-[var(--text-secondary)]' />}
            </button>
        </div>
    );
};

export default function DocumentationPage() {
    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] overflow-y-auto no-scrollbar'>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/60 border-b border-[var(--separator)]/10">
                <Link href="/" className="flex items-center gap-1 text-[var(--primary)] active:opacity-40 transition-opacity p-1">
                    <ChevronLeft size={24} />
                    <span className="text-[17px] font-semibold">Beranda</span>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/arsip" className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
                <div className='mb-12'>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Book size={12} />
                        <span>Panduan Dokumentasi</span>
                    </div>
                    <h1 className='text-4xl md:text-6xl font-black tracking-tighter mb-4'>Aksara yang <span className="text-blue-500">Berdikari.</span></h1>
                    <p className='text-lg text-[var(--text-secondary)] font-medium leading-relaxed'>
                        Pelajari bagaimana Lembaran menjaga kedaulatan data Anda dengan enkripsi modern dan desain yang puitis.
                    </p>
                </div>

                {/* Grid Dasar Keamanan */}
                <section className="mb-20">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6'>Arsitektur Keamanan</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                            <Lock className="text-blue-500 mb-4" size={24} />
                            <h3 className="font-bold text-[18px] mb-2 tracking-tight">AES-256-GCM</h3>
                            <p className="text-[14px] text-[var(--text-secondary)] leading-snug font-medium">
                                Standar enkripsi simetris yang menjamin kerahasiaan sekaligus integritas data di memori lokal Anda.
                            </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                            <Zap className="text-orange-500 mb-4" size={24} />
                            <h3 className="font-bold text-[18px] mb-2 tracking-tight">Argon2id</h3>
                            <p className="text-[14px] text-[var(--text-secondary)] leading-snug font-medium">
                                Mekanisme derivasi kunci (KDF) yang dirancang untuk melawan serangan brute-force dan penambangan GPU.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CLI & Terminal */}
                <section className="mb-20">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6'>Ekosistem CLI (v2.6.0)</h2>
                    <div className='ios-list-group overflow-hidden border border-[var(--separator)]/20 shadow-sm'>
                        <div className='p-6'>
                            <div className='flex items-start gap-4 mb-6'>
                                <div className='p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0'>
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h3 className='font-bold text-[17px] mb-1'>Instalasi Global</h3>
                                    <p className='text-[14px] text-[var(--text-secondary)] mb-4 font-medium'>
                                        Dapatkan akses terminal untuk manajemen arsip yang lebih cepat.
                                    </p>
                                    <BlokKode kode='bun install -g @lembaran/cli' />
                                </div>
                            </div>

                            <div className='ios-separator mb-6'></div>

                            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Daftar Perintah</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-blue-500">pantau</code>
                                        <span className="text-[11px] text-[var(--text-muted)] font-medium">Cek kesehatan sistem & audit log</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran pantau</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-blue-500">jelajah</code>
                                        <span className="text-[11px] text-[var(--text-muted)] font-medium">Akses arsip terenkripsi di terminal</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran jelajah</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-blue-500">kuncung</code>
                                        <span className="text-[11px] text-[var(--text-muted)] font-medium">Masuk ke antarmuka Web dengan cepat</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran kuncung</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-20 px-1">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8'>Pertanyaan Umum</h2>
                    <div className="space-y-10">
                        <div className="group">
                            <h4 className="font-bold text-[18px] mb-3 tracking-tight group-hover:text-blue-500 transition-colors">Apakah data saya dikirim ke cloud?</h4>
                            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                Tidak secara default. Lembaran adalah aplikasi <strong>Local-First</strong>. Semua catatan Anda hanya hidup di perangkat Anda (IndexedDB atau file lokal). Sinkronisasi cloud hanya aktif jika Anda menghubungkan provider Anda sendiri.
                            </p>
                        </div>
                        <div className="group">
                            <h4 className="font-bold text-[18px] mb-3 tracking-tight group-hover:text-blue-500 transition-colors">Bagaimana jika saya lupa kata sandi?</h4>
                            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                Karena kami menggunakan arsitektur <strong>Zero-Knowledge</strong>, kami tidak bisa memulihkan data Anda tanpa kata sandi. Gunakan 12 kata <strong>Kunci Kertas</strong> yang Anda simpan saat setup pertama kali untuk memulihkan akses.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="ios-separator my-12"></div>

                <footer className="text-center">
                    <div className="flex items-center justify-center gap-8 mb-6">
                        <Link href="https://github.com/Abelion512/lembaran" target="_blank" className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                            <Github size={22} />
                        </Link>
                        <Link href="/changelog" className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                            <RefreshCw size={20} />
                        </Link>
                        <Link href="/" className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                            <Globe size={20} />
                        </Link>
                    </div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">
                        Lembaran v2.6.0 • Dibuat dengan Jiwa
                    </p>
                </footer>
            </main>
        </div>
    );
}
