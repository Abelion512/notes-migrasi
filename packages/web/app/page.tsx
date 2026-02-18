'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Github, Book, History, Download,
    Globe, Zap, Shield, Sparkles, Terminal
} from 'lucide-react';
import { CliInstallation } from '@/komponen/landing/CliInstallation';
import { ComparisonTable } from '@/komponen/landing/ComparisonTable';
import { NativeShowcase } from '@/komponen/landing/NativeShowcase';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';
import { haptic } from '@lembaran/core/Indera';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/60 border-b border-[var(--separator)]/10">
                <div className="flex items-center gap-3 select-none">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                        L
                    </div>
                    <span className="text-lg font-extrabold tracking-tight">Lembaran</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        <Link href="/changelog" className="hover:text-blue-500 transition-colors">Riwayat</Link>
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" className="hover:text-blue-500 transition-colors">GitHub</a>
                        <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                    </nav>
                    <div className="w-px h-5 bg-[var(--separator)]/20 mx-2 hidden md:block"></div>
                    <ThemeToggle />
                    <Link
                        href="/arsip"
                        onClick={() => haptic.medium()}
                        className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-bold text-[13px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                    >
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="pt-32">
                {/* Hero Section */}
                <section className="px-6 py-12 md:py-24 text-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[11px] font-black uppercase tracking-[0.2em]">
                            <Sparkles size={14} />
                            <span>Aksara Personal yang Berdikari</span>
                        </div>

                        <h1 className="text-6xl md:text-[100px] font-black tracking-tighter mb-8 leading-[0.85] text-[var(--text-primary)]">
                            Privasi Absolut. <br />
                            <span className="text-blue-500">Performa Instan.</span>
                        </h1>

                        <p className="text-[18px] md:text-[22px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
                            Lembaran adalah brankas arsip digital lokal-first dengan enkripsi militer dan kecerdasan buatan on-device.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/arsip"
                                onClick={() => haptic.heavy()}
                                className="w-full sm:w-auto px-10 py-5 bg-[var(--text-primary)] text-[var(--background)] rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/5"
                            >
                                Mulai Menulis <ArrowRight size={22} />
                            </Link>
                            <Link
                                href="/bantuan"
                                className="w-full sm:w-auto px-10 py-5 bg-[var(--surface)] border border-[var(--separator)]/20 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[var(--background)] active:scale-95 transition-all shadow-sm"
                            >
                                <Book size={20} /> Pelajari
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Features Highlights */}
                <section className="px-6 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <Shield className="text-blue-500 mb-6" size={32} />
                        <h3 className="text-2xl font-bold mb-3 tracking-tight">Zero-Knowledge</h3>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">Seluruh data dienkripsi dengan AES-256-GCM dan Argon2id langsung di perangkat Anda.</p>
                     </div>
                     <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <Zap className="text-orange-500 mb-6" size={32} />
                        <h3 className="text-2xl font-bold mb-3 tracking-tight">Bolt Performance</h3>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">Pencarian instan dan pengelolaan ribuan catatan tanpa lag berkat optimasi IndexedDB.</p>
                     </div>
                     <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <Terminal className="text-purple-500 mb-6" size={32} />
                        <h3 className="text-2xl font-bold mb-3 tracking-tight">Developer TUI</h3>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">Akses dan kelola arsip Anda langsung dari terminal dengan CLI puitis v2.6.0.</p>
                     </div>
                </section>

                {/* CLI Section */}
                <section className="py-24 bg-[var(--surface)]/30 border-y border-[var(--separator)]/10">
                    <div className="text-center mb-16 px-6">
                        <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Instalasi Terminal</h2>
                        <p className="text-[17px] text-[var(--text-secondary)] font-medium">Bawa Lembaran ke lingkungan pengembangan Anda.</p>
                    </div>
                    <div className="max-w-4xl mx-auto px-6">
                        <CliInstallation />
                    </div>
                </section>

                {/* Comparison Table */}
                <div className="py-20">
                    <ComparisonTable />
                </div>

                {/* Native Showcase */}
                <section id="native" className="pb-32">
                    <NativeShowcase />
                </section>
            </main>

            {/* Footer */}
            <footer className="p-12 border-t border-[var(--separator)]/10 bg-[var(--surface)]/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[var(--text-muted)]">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/20" />
                            <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">Lembaran v2.6.0</span>
                        </div>
                        <p className="text-xs font-medium">Dibuat dengan Jiwa oleh Lembaga Arsip Digital.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 uppercase tracking-[0.2em] text-[10px] font-black">
                        <Link href="/privasi" className="hover:text-blue-500 transition-colors">Privasi</Link>
                        <Link href="/ketentuan" className="hover:text-blue-500 transition-colors">Ketentuan</Link>
                        <Link href="/changelog" className="hover:text-blue-500 transition-colors">Changelog</Link>
                        <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
                            <Globe size={20} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
