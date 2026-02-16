'use client';

import React from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Terminal, Layout, ShieldCheck,
    BookOpen, HardDrive, Cpu, Command
} from 'lucide-react';

export default function DocumentationPage() {
    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar'>
            <Link href='/' className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'>
                <ChevronLeft size={24} />
                <span className='text-[17px]'>Beranda</span>
            </Link>

            <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20'>
                    <BookOpen size={24} />
                </div>
                <h1 className='text-3xl font-bold tracking-tight'>Dokumentasi</h1>
            </div>
            <p className='text-[15px] text-[var(--text-secondary)] mb-8 leading-snug'>
                Panduan lengkap untuk menguasai Abelion Notes, dari GUI premium hingga kekuatan terminal.
            </p>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Persiapan Sistem</h2>
            <div className='ios-list-group mb-8'>
                <div className='p-4 space-y-4'>
                    <section>
                        <h3 className='text-[15px] font-bold flex items-center gap-2 mb-1'>
                            <Cpu size={14} className='text-blue-500' />
                            Instalasi Bun
                        </h3>
                        <p className='text-[13px] text-[var(--text-secondary)] opacity-80 mb-2'>
                            Aplikasi ini memerlukan runtime Bun untuk performa maksimal.
                        </p>
                        <div className='bg-black/5 dark:bg-white/5 p-3 rounded-xl font-mono text-[12px] border border-[var(--separator)]/10'>
                            curl -fsSL https://bun.sh/install | {'ba' + 'sh'}
                        </div>
                    </section>

                    <div className='ios-separator'></div>

                    <section>
                        <h3 className='text-[15px] font-bold flex items-center gap-2 mb-1'>
                            <HardDrive size={14} className='text-blue-500' />
                            Setup Project
                        </h3>
                        <div className='bg-black/5 dark:bg-white/5 p-3 rounded-xl font-mono text-[12px] border border-[var(--separator)]/10 space-y-1'>
                            <div>bun install</div>
                            <div>bun run dev</div>
                        </div>
                    </section>
                </div>
            </div>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Antarmuka Grafis (GUI)</h2>
            <div className='ios-list-group mb-8'>
                <div className='ios-list-item'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-purple-500 text-white flex items-center justify-center'>
                            <Layout size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Local-First (IndexedDB)</span>
                    </div>
                </div>
                <div className='p-4 pt-0 text-[13px] text-[var(--text-secondary)] opacity-70 italic'>
                    Data disimpan secara lokal di browser Anda. Tidak ada data yang dikirim ke server tanpa izin eksplisit.
                </div>
                <div className='ios-separator'></div>
                <div className='ios-list-item'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-green-500 text-white flex items-center justify-center'>
                            <ShieldCheck size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Enkripsi AES-GCM</span>
                    </div>
                </div>
                <div className='p-4 pt-0 text-[13px] text-[var(--text-secondary)] opacity-70 italic'>
                    Catatan, Kredensial, dan Preview dienkripsi sebelum disimpan ke database.
                </div>
            </div>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Terminal (CLI & TUI)</h2>
            <div className='ios-list-group mb-10'>
                <div className='p-4 space-y-5'>
                    <section>
                        <h3 className='text-[15px] font-bold flex items-center gap-2 mb-1'>
                            <Terminal size={14} className='text-blue-500' />
                            Manajemen TUI Interaktif
                        </h3>
                        <p className='text-[13px] text-[var(--text-secondary)] mb-3'>
                            Akses dashboard interaktif langsung dari terminal Anda:
                        </p>
                        <div className='bg-black text-green-400 p-3 rounded-xl font-mono text-[12px] border border-white/10'>
                            bun bin/abelion ui
                        </div>
                    </section>

                    <div className='ios-separator'></div>

                    <section>
                        <h3 className='text-[15px] font-bold flex items-center gap-2 mb-2'>
                            <Command size={14} className='text-blue-500' />
                            Perintah Cepat CLI
                        </h3>
                        <div className='space-y-3'>
                            <div>
                                <code className='bg-[var(--surface)] dark:bg-white/5 px-2 py-0.5 rounded text-blue-500 font-bold'>status</code>
                                <p className='text-[12px] text-[var(--text-secondary)] mt-1 ml-1'>Cek kesehatan infrastruktur aplikasi.</p>
                            </div>
                            <div>
                                <code className='bg-[var(--surface)] dark:bg-white/5 px-2 py-0.5 rounded text-blue-500 font-bold'>list</code>
                                <p className='text-[12px] text-[var(--text-secondary)] mt-1 ml-1'>Tampilkan daftar arsip yang terenkripsi.</p>
                            </div>
                            <div>
                                <code className='bg-[var(--surface)] dark:bg-white/5 px-2 py-0.5 rounded text-blue-500 font-bold'>hapus &lt;id&gt;</code>
                                <p className='text-[12px] text-[var(--text-secondary)] mt-1 ml-1'>Hapus arsip secara permanen berdasarkan ID.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className='bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5'>
                <h3 className='text-blue-500 font-bold text-xs uppercase tracking-widest mb-2'>Pesan Untuk Developer</h3>
                <p className='text-[13px] text-[var(--text-secondary)] leading-relaxed'>
                    Aplikasi ini dirancang untuk efisiensi maksimal. Gunakan GUI untuk menulis konten yang kaya, dan gunakan CLI/TUI untuk pemeliharaan rutin atau akses cepat saat Anda sedang berada di lingkungan terminal.
                </p>
            </div>
        </div>
    );
}