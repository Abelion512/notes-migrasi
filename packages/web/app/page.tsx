'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Github, Book, History, Download,
    Globe, Zap, Shield, Sparkles
} from 'lucide-react';
import { CliInstallation } from '@/komponen/landing/CliInstallation';
import { ComparisonTable } from '@/komponen/landing/ComparisonTable';
import { NativeShowcase } from '@/komponen/landing/NativeShowcase';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-500">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                        L
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Lembaran</span>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-gray-500">
                        <Link href="/changelog" className="hover:text-blue-500 transition-colors">Changelog</Link>
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" className="hover:text-blue-500 transition-colors">GitHub</a>
                        <Link href="/bantuan/publik" className="hover:text-blue-500 transition-colors">Docs</Link>
                    </nav>
                    <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
                    <ThemeToggle />
                    <Link href="/arsip" className="px-5 py-2.5 bg-blue-500 text-white rounded-full font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="pt-32">
                {/* Hero Section */}
                <section className="px-6 py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} />
                            <span>Kecerdasan Personal Lokal-First</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
                            Aksara yang <br />
                            <span className="text-blue-500">Berdikari.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Brankas aksara personal yang mengutamakan
                            privasi absolut, performa instan, dan kecerdasan buatan on-device.
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

                {/* CLI Section */}
                <section className="py-24 bg-white/[0.02] border-y border-white/5">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4 uppercase">Instalasi CLI</h2>
                        <p className="text-gray-500 font-medium">Akses Lembaran langsung dari terminal favorit Anda.</p>
                    </div>
                    <CliInstallation />
                </section>

                {/* Comparison Table */}
                <ComparisonTable />

                {/* Native Showcase */}
                <section id="native">
                    <NativeShowcase />
                </section>
            </main>

            {/* Footer */}
            <footer className="p-12 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gray-500/20" />
                        <span>© 2025 Lembaran Open Source.</span>
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
