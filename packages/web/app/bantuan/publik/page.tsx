'use client';

import React from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Shield, Zap, Terminal, Globe,
    Book, History, Lock, Database, ArrowRight, Github
} from 'lucide-react';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';

export default function PublicDocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-500">
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--separator)]/10">
                <Link href="/" className="flex items-center gap-3 active:opacity-40 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-lg">L</div>
                    <span className="text-lg font-black tracking-tighter uppercase">Lembaran Docs</span>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/arsip" className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-xs hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-32 px-6 max-w-4xl mx-auto w-full">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Book size={12} />
                        <span>Panduan Pengguna</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Aksara yang <span className="text-blue-500">Berdikari.</span></h1>
                    <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
                        Selamat datang di dokumentasi resmi Lembaran. Pelajari bagaimana kami melindungi data Anda dengan enkripsi kelas militer namun tetap memberikan pengalaman menulis yang instan.
                    </p>
                </div>

                {/* Grid Fitur Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Keamanan Absolut</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Semua data dienkripsi menggunakan <strong>Argon2id</strong> untuk derivasi kunci dan <strong>AES-GCM 256-bit</strong> untuk penyimpanan. Data Anda tidak pernah meninggalkan perangkat dalam bentuk teks biasa.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Performa Instan</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Dibangun di atas <strong>Next.js 15+</strong> dan <strong>Bun</strong>. Dengan arsitektur local-first menggunakan IndexedDB, navigasi dan pencarian terjadi dalam milidetik.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                            <Terminal size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Ekosistem CLI</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Lembaran bukan hanya web app. Kami menyediakan CLI yang kuat untuk mengelola brankas Anda langsung dari terminal favorit.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Local-First, Cloud-Sync</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Nikmati kebebasan offline total. Sinkronisasi opsional tersedia menggunakan Supabase untuk memastikan data Anda aman di berbagai perangkat.
                        </p>
                    </div>
                </div>

                {/* Section Teknis */}
                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-black tracking-tight mb-6 uppercase flex items-center gap-3">
                            <Lock size={20} className="text-blue-500" /> Arsitektur Keamanan
                        </h2>
                        <div className="ios-list-group">
                            <div className="p-5">
                                <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium leading-relaxed">
                                    Lembaran menggunakan pendekatan <strong>Zero-Knowledge Architecture</strong>. Artinya, kami (pengembang) tidak memiliki akses ke kunci enkripsi atau data Anda.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <p className="text-sm font-bold">Argon2id Derivation: <span className="text-[var(--text-secondary)] font-medium">Mencegah serangan brute-force dengan memaksa penggunaan memori dan CPU yang signifikan pada sisi klien.</span></p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <p className="text-sm font-bold">AES-GCM 256: <span className="text-[var(--text-secondary)] font-medium">Algoritma standar industri yang menyediakan enkripsi data sekaligus verifikasi integritas.</span></p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <p className="text-sm font-bold">Digital Signatures: <span className="text-[var(--text-secondary)] font-medium">Setiap catatan memiliki 'segel digital' SHA-256 untuk mendeteksi manipulasi data.</span></p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black tracking-tight mb-6 uppercase flex items-center gap-3">
                            <Database size={20} className="text-blue-500" /> Struktur Data
                        </h2>
                        <div className="ios-list-group">
                            <div className="p-5">
                                <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium leading-relaxed">
                                    Lembaran menyimpan data secara terorganisir namun fleksibel. Anda bisa menyimpan catatan teks biasa, kredensial, hingga metadata terenkripsi.
                                </p>
                                <Link href="https://github.com/Abelion512/lembaran/blob/main/packages/core/src/Rumus.ts" target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline">
                                    Lihat Skema Data di GitHub <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-20 p-12 rounded-[3rem] bg-blue-500 text-white text-center shadow-2xl shadow-blue-500/40">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Siap untuk Berdikari?</h2>
                    <p className="mb-8 font-bold opacity-80 text-lg">Mulai bangun brankas aksara personal Anda hari ini.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/arsip" className="px-8 py-4 bg-white text-blue-500 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                            Set Up Vault <ArrowRight size={20} />
                        </Link>
                        <Link href="https://github.com/Abelion512/lembaran" target="_blank" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all">
                            <Github size={20} /> Kontribusi
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="p-12 text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                <p>© 2025 Lembaran Documentation Engine. Built for Sovereignty.</p>
            </footer>
        </div>
    );
}
