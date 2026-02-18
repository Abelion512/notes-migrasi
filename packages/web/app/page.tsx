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
                        <div className="mb-12 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-[0.25em]">
                            <Sparkles size={14} />
                            <span>Era Kedaulatan Data Personal</span>
                        </div>

                        <h1 className="text-6xl md:text-[110px] font-extrabold tracking-[-0.04em] mb-10 leading-[0.9] text-[var(--text-primary)]">
                            Privasi Absolut. <br />
                            <span className="text-blue-500">Performa Instan.</span>
                        </h1>

                        <p className="text-[19px] md:text-[24px] text-[var(--text-secondary)]/80 max-w-3xl mx-auto mb-16 leading-[1.6] font-medium tracking-tight px-4">
                            Brankas arsip digital yang mengutamakan kedaulatan penuh pengguna.
                            Enkripsi lokal AES-256-GCM dengan pengalaman pengguna secepat kilat.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link
                                href="/arsip"
                                onClick={() => haptic.heavy()}
                                className="w-full sm:w-auto px-12 py-6 bg-[var(--text-primary)] text-[var(--background)] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/10"
                            >
                                Mulai Menulis <ArrowRight size={22} />
                            </Link>
                            <Link
                                href="/bantuan"
                                className="w-full sm:w-auto px-12 py-6 bg-[var(--surface)] border border-[var(--separator)]/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[var(--background)] active:scale-95 transition-all shadow-sm"
                            >
                                <Book size={20} /> Pelajari Sistem
                            </Link>
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
                <section className="py-40 bg-[var(--surface)]/30 border-y border-[var(--separator)]/10">
                    <div className="text-center mb-20 px-6">
                        <div className="text-blue-500 font-bold text-[11px] uppercase tracking-[0.3em] mb-4">Command Line Interface</div>
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">Instalasi Terminal.</h2>
                        <p className="text-[18px] text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">Manajemen catatan profesional dengan alias perintah yang efisien.</p>
                    </div>
                    <div className="max-w-5xl mx-auto px-6">
                        <CliInstallation />
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24 uppercase tracking-[0.2em] text-[11px] font-bold">
                        <div className="flex flex-col gap-4">
                            <span className="text-[var(--text-primary)] opacity-30">Arsip</span>
                            <Link href="/arsip" className="hover:text-blue-500 transition-colors">Mulai</Link>
                            <Link href="/cari" className="hover:text-blue-500 transition-colors">Pencarian</Link>
                            <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[var(--text-primary)] opacity-30">Legal</span>
                            <Link href="/privasi" className="hover:text-blue-500 transition-colors">Privasi</Link>
                            <Link href="/ketentuan" className="hover:text-blue-500 transition-colors">Ketentuan</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[var(--text-primary)] opacity-30">Sosial</span>
                            <a href="https://github.com/Abelion512/lembaran" target="_blank" className="hover:text-blue-500 transition-colors">GitHub</a>
                            <a href="#" className="hover:text-blue-500 transition-colors">Twitter</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-[var(--separator)]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 Lembaga Arsip Digital. Semua Hak Dilindungi.</p>
                    <div className="flex items-center gap-6">
                         <Globe size={18} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Global Service</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
