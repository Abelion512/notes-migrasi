'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Terminal, Shield, Zap, Book,
    Command, Download, Play, Copy, Check,
    ArrowRight, Github, Lock, Database
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
    return (
        <div className='flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar scroll-smooth'>
            {/* Mobile/Tablet Header */}
            <header className="lg:hidden sticky top-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--separator)]/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black">L</div>
                    <span className="font-black text-sm tracking-tighter uppercase">Docs</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/arsip" className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-xs">
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto w-full px-6 py-12 lg:py-24 space-y-24">
                {/* Hero / Overview */}
                <section id="overview" className="scroll-mt-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Book size={12} />
                        <span>Panduan Pengguna</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Aksara yang <span className="text-blue-500">Berdikari.</span></h1>
                    <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed mb-12">
                        Selamat datang di dokumentasi resmi Lembaran. Pelajari bagaimana kami melindungi data Anda dengan enkripsi kelas militer namun tetap memberikan pengalaman menulis yang instan.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Keamanan Absolut</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                Semua data dienkripsi menggunakan <strong>Argon2id</strong> untuk derivasi kunci dan <strong>AES-GCM 256-bit</strong> untuk penyimpanan.
                            </p>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Performa Instan</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                Dibangun di atas <strong>Next.js 15+</strong> dan <strong>Bun</strong>. Navigasi dan pencarian terjadi dalam milidetik.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Keamanan */}
                <section id="keamanan" className="scroll-mt-24">
                    <h2 className="text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3">
                        <Lock size={20} className="text-blue-500" /> Arsitektur Keamanan
                    </h2>
                    <div className="ios-list-group overflow-hidden">
                        <div className="p-8">
                            <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium leading-relaxed">
                                Lembaran menggunakan pendekatan <strong>Zero-Knowledge Architecture</strong>. Kami tidak memiliki akses ke kunci enkripsi atau data Anda.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold mb-1">Argon2id Derivation</p>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">Mencegah serangan brute-force dengan memaksa penggunaan memori signifikan pada sisi klien.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold mb-1">AES-GCM 256</p>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">Algoritma standar industri yang menyediakan enkripsi data sekaligus verifikasi integritas.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Instalasi CLI */}
                <section id="cli-install" className="scroll-mt-24">
                    <h2 className="text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3">
                        <Download size={20} className="text-blue-500" /> Instalasi CLI
                    </h2>

                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Download size={18} className="text-blue-500" /> Opsi A: Binary Standalone
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium">
                                Cukup unduh file eksekusi sesuai sistem operasi Anda dari halaman rilis GitHub.
                            </p>
                            <Link
                                href="https://github.com/Abelion512/lembaran/releases"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                            >
                                <Github size={18} /> Rilis GitHub
                            </Link>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Terminal size={18} className="text-purple-500" /> Opsi B: Via Package Manager
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">
                                Jika Anda memiliki Bun atau Node.js terpasang, gunakan perintah berikut:
                            </p>
                            <BlokKode kode="bun install -g Abelion512/lembaran" />
                            <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[11px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">
                                Pastikan folder bin global ada dalam PATH Anda.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mulai CLI */}
                <section id="cli-start" className="scroll-mt-24">
                    <h2 className="text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3">
                        <Play size={20} className="text-blue-500" /> Menjalankan CLI
                    </h2>
                    <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                        <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium">
                            Setelah terpasang, Anda bisa memulai antarmuka terminal interaktif (TUI) dengan perintah:
                        </p>
                        <BlokKode kode="lembaran mulai" />
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--separator)]/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Navigasi</p>
                                <p className="text-xs font-bold">Gunakan Tombol Panah ↑/↓</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--separator)]/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Konfirmasi</p>
                                <p className="text-xs font-bold">Tekan Tombol ENTER</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Perintah */}
                <section id="perintah" className="scroll-mt-24">
                    <h2 className="text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3">
                        <Command size={20} className="text-blue-500" /> Referensi Perintah
                    </h2>
                    <div className="ios-list-group overflow-hidden">
                        <div className="divide-y divide-[var(--separator)]/10">
                            {[
                                { cmd: 'lembaran pantau', desc: 'Memeriksa status sistem dan kesehatan database.' },
                                { cmd: 'lembaran jelajah', desc: 'Membuka penjelajah catatan dengan fitur pencarian fuzzy.' },
                                { cmd: 'lembaran kuncung', desc: 'Melakukan otentikasi dan membuka brankas utama.' },
                                { cmd: 'lembaran tanam', desc: 'Mengimpor catatan dari file Markdown secara massal.' },
                                { cmd: 'lembaran petik', desc: 'Mengekspor brankas ke format .lembaran terenkripsi.' },
                            ].map((item) => (
                                <div key={item.cmd} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                    <code className="text-xs font-black text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-lg w-fit">{item.cmd}</code>
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Struktur Data */}
                <section id="struktur" className="scroll-mt-24">
                    <h2 className="text-2xl font-black tracking-tight mb-8 uppercase flex items-center gap-3">
                        <Database size={20} className="text-blue-500" /> Struktur Data
                    </h2>
                    <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                        <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium leading-relaxed">
                            Lembaran menyimpan data secara terorganisir namun fleksibel. Semua field sensitif dienkripsi sebelum masuk ke penyimpanan.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="https://github.com/Abelion512/lembaran/blob/main/packages/core/src/Rumus.ts"
                                target="_blank"
                                className="flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline"
                            >
                                Skema Data (TypeScript) <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer Docs */}
                <footer className="pt-24 border-t border-[var(--separator)]/10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        © 2026 Lembaran Documentation Engine.
                    </p>
                </footer>
            </main>
        </div>
    );
}
