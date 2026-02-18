'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Terminal, Layout, ShieldCheck,
    BookOpen, HardDrive, Cpu, Command, Copy, Check, Download, Play,
    Lock, Key, RefreshCw, Zap, Globe, Github
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

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
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar'>
            <div className="max-w-3xl mx-auto w-full">
                <Link href='/' className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'>
                    <ChevronLeft size={24} />
                    <span className='text-[17px] font-semibold'>Beranda</span>
                </Link>

                <div className='mb-12'>
                    <h1 className='text-4xl font-black tracking-tight mb-4'>Dokumentasi</h1>
                    <p className='text-[17px] text-[var(--text-secondary)] leading-relaxed'>
                        Selamat datang di pusat bantuan Lembaran. Pelajari cara mengamankan arsip digital Anda dengan teknologi enkripsi modern.
                    </p>
                </div>

                <section className="mb-12">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 ml-1'>Dasar Keamanan</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--separator)]/10">
                            <Lock className="text-blue-500 mb-3" size={24} />
                            <h3 className="font-bold text-[17px] mb-2">AES-256-GCM</h3>
                            <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                                Data Anda dienkripsi menggunakan standar industri tertinggi sebelum disimpan ke memori perangkat.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--separator)]/10">
                            <Zap className="text-orange-500 mb-3" size={24} />
                            <h3 className="font-bold text-[17px] mb-2">Argon2id</h3>
                            <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                                Penurunan kunci kriptografi yang tahan terhadap serangan brute-force dan penambangan GPU.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 ml-1'>Instalasi & CLI</h2>
                    <div className='ios-list-group overflow-hidden border border-[var(--separator)]/20 shadow-sm'>
                        <div className='p-6'>
                            <div className='flex items-start gap-4 mb-6'>
                                <div className='p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0'>
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h3 className='font-bold text-[17px] mb-1'>Lembaran CLI (v2.6.0)</h3>
                                    <p className='text-[13px] text-[var(--text-secondary)] mb-4'>
                                        Gunakan kekuatan terminal untuk mengelola arsip Anda dengan lebih cepat dan puitis.
                                    </p>
                                    <BlokKode kode='bun install -g @lembaran/cli' />
                                </div>
                            </div>

                            <div className='ios-separator mb-6'></div>

                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Daftar Perintah Cepat</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-[var(--primary)]">pantau</code>
                                        <span className="text-[11px] text-[var(--text-muted)]">Cek kesehatan sistem & integritas</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran pantau</div>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-[var(--primary)]">jelajah</code>
                                        <span className="text-[11px] text-[var(--text-muted)]">Akses daftar arsip terenkripsi</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran jelajah</div>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <code className="text-sm font-bold text-[var(--primary)]">kuncung</code>
                                        <span className="text-[11px] text-[var(--text-muted)]">Login cepat via Web Browser</span>
                                    </div>
                                    <div className="p-1 px-2 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">lembaran kuncung</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 ml-1'>Tanya Jawab (FAQ)</h2>
                    <div className="space-y-6 px-1">
                        <div>
                            <h4 className="font-bold text-[15px] mb-1">Di mana data saya disimpan?</h4>
                            <p className="text-[13px] text-[var(--text-secondary)]">
                                Secara default, Lembaran menyimpan data di <strong>IndexedDB</strong> pada browser Anda (untuk Web) atau file <code>.lembaran-db.json</code> (untuk CLI). Data tidak pernah dikirim ke server luar tanpa izin Anda.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[15px] mb-1">Bagaimana jika saya lupa kata sandi?</h4>
                            <p className="text-[13px] text-[var(--text-secondary)]">
                                Karena kami menggunakan arsitektur <em>Zero-Knowledge</em>, kami tidak bisa memulihkan kata sandi Anda. Gunakan <strong>Kunci Kertas</strong> (12 kata mnemonik) yang Anda dapatkan saat setup untuk memulihkan akses.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="ios-separator my-12"></div>

                <footer className="text-center">
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <Link href="https://github.com/Abelion512/lembaran" target="_blank" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                            <Github size={20} />
                        </Link>
                        <Link href="/changelog" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                            <RefreshCw size={18} />
                        </Link>
                        <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                            <Globe size={18} />
                        </Link>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">
                        Lembaran v2.6.0 • Dibuat dengan Jiwa
                    </p>
                </footer>
            </div>
        </div>
    );
}
