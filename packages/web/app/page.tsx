'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Github, Book, Download,
    Globe, Zap, Shield, Sparkles, Terminal
} from 'lucide-react';
import { CliInstallation } from '@/komponen/landing/CliInstallation';
import { ComparisonTable } from '@/komponen/landing/ComparisonTable';
import { NativeShowcase } from '@/komponen/landing/NativeShowcase';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';
import { haptic } from '@lembaran/core/Indera';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/40 border-b border-[var(--separator)]/5">
                <div className="flex items-center gap-4 select-none">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-500/20">
                        L
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[17px] font-bold tracking-tight leading-none text-[var(--text-primary)]">Lembaran</span>
                        <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-[0.2em] mt-1">Sovereign Archive</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-8">
                    <nav className="hidden lg:flex items-center gap-10 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/70">
                        <Link href="/changelog" className="hover:text-blue-500 transition-colors">Riwayat</Link>
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" className="hover:text-blue-500 transition-colors">GitHub</a>
                        <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Dokumentasi</Link>
                    </nav>
                    <div className="w-px h-5 bg-[var(--separator)]/20 mx-2 hidden lg:block"></div>
                    <ThemeToggle />
                    <Link
                        href="/arsip"
                        onClick={() => haptic.medium()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold text-[13px] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="pt-40">
                {/* Hero Section */}
                <section className="px-6 py-20 md:py-32 text-center max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} />
                            <span>Era Kedaulatan Data Personal</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
                            Aksara yang <br />
                            <span className="text-blue-500">Berdikari.</span>
                        </h1>

                        <p className="text-[19px] md:text-[24px] text-[var(--text-secondary)]/80 max-w-3xl mx-auto mb-16 leading-[1.6] font-medium tracking-tight px-4">
                            Brankas arsip digital yang mengutamakan kedaulatan penuh pengguna.
                            Enkripsi lokal AES-256-GCM dengan pengalaman pengguna secepat kilat.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/arsip" className="px-6 py-3 bg-[var(--text-primary)] text-[var(--background)] rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
                                Mulai Menulis <ArrowRight size={20} />
                            </Link>
                            <a href="#native" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all">
                                <Download size={20} /> Unduh App
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Features Highlights */}
                <section className="px-6 py-32 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="p-10 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-8">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Zero-Knowledge</h3>
                            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">Seluruh data dienkripsi dengan Argon2id langsung di browser Anda. Kami tidak bisa melihat apa pun.</p>
                         </div>
                         <div className="p-10 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-8">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Bolt Performance</h3>
                            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">Pengindeksan latar belakang cerdas memungkinkan pencarian isi catatan terenkripsi secara instan.</p>
                         </div>
                         <div className="p-10 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-8">
                                <Terminal size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Developer TUI</h3>
                            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">Dilengkapi CLI puitis v2.6.1 untuk manajemen data tingkat tinggi langsung dari terminal.</p>
                         </div>
                    </div>
                </section>

                {/* CLI Section */}
                <section className="py-24 bg-white/[0.02] border-y border-white/5">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4 uppercase">Instalasi CLI</h2>
                        <p className="text-gray-500 font-medium">Akses Lembaran langsung dari terminal favorit Anda.</p>
                    </div>
                </section>

                {/* Comparison Table */}
                <div className="py-32">
                    <ComparisonTable />
                </div>

                {/* Native Showcase */}
                <section id="native" className="pb-40 px-6 max-w-7xl mx-auto">
                    <NativeShowcase />
                </section>
            </main>

            {/* Footer */}
            <footer className="p-20 border-t border-[var(--separator)]/10 bg-[var(--surface)]/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16 text-[var(--text-muted)]">
                    <div className="flex flex-col gap-6 max-w-sm text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20" />
                            <span className="font-bold text-[17px] tracking-tight text-[var(--text-primary)]">Lembaran v2.6.1</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            Membangun masa depan di mana privasi data bukan lagi sebuah kemewahan, melainkan hak asasi digital.
                        </p>
                    </div>
                    <div className="flex items-center gap-8 uppercase tracking-widest text-[10px] font-bold">
                        <Link href="/privasi" className="hover:text-blue-500 transition-colors">Privasi</Link>
                        <Link href="/ketentuan" className="hover:text-blue-500 transition-colors">Ketentuan</Link>
                        <Link href="/bantuan/publik" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
