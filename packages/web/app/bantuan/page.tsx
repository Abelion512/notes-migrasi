'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Terminal, Layout, ShieldCheck,
    BookOpen, HardDrive, Cpu, Command, Copy, Check, Download, Play
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
            <div className='bg-black/5 dark:bg-white/5 p-3 pr-10 rounded-xl font-mono text-[12px] border border-[var(--separator)]/10 break-all'>
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
            <Link href='/laras' className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'>
                <ChevronLeft size={24} />
                <span className='text-[17px]'>Setelan</span>
            </Link>

            <div className='mb-8'>
                <h1 className='text-3xl font-bold tracking-tight mb-2'>Dokumentasi</h1>
                <p className='text-[15px] text-[var(--text-secondary)] leading-snug'>
                    Panduan singkat penggunaan CLI Lembaran.
                </p>
            </div>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Langkah 1: Instalasi CLI</h2>
            <div className='ios-list-group mb-8'>
                <div className='p-4'>
                    <div className='flex items-start gap-4 mb-4'>
                        <div className='p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0'>
                            <Download size={20} />
                        </div>
                        <div>
                            <h3 className='font-bold text-[15px] mb-1'>Opsi A: Download Binary (Mudah)</h3>
                            <p className='text-xs text-[var(--text-secondary)] mb-2'>
                                Tanpa perlu install Bun/Node.js. Cukup download file <code>lembaran.exe</code> dari halaman Rilis GitHub.
                            </p>
                            <Link
                                href="https://github.com/Abelion512/lembaran/releases"
                                target="_blank"
                                className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg active:opacity-80'
                            >
                                <Download size={14} /> Download .exe
                            </Link>
                        </div>
                    </div>

                    <div className='ios-separator my-4'></div>

                    <div className='flex items-start gap-4'>
                        <div className='p-2 bg-purple-500/10 text-purple-500 rounded-lg shrink-0'>
                            <Terminal size={20} />
                        </div>
                        <div>
                            <h3 className='font-bold text-[15px] mb-1'>Opsi B: Install via Terminal</h3>
                            <p className='text-xs text-[var(--text-secondary)] mb-2'>
                                Jika Anda developer dan sudah punya <code>bun</code>. Clone repo ini lalu jalankan:
                            </p>
                            <BlokKode kode='bun install -g .' />
                        </div>
                    </div>
                </div>
            </div>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Langkah 2: Menjalankan CLI</h2>
            <div className='ios-list-group mb-8'>
                <div className='p-4'>
                    <div className='flex items-start gap-4'>
                        <div className='p-2 bg-green-500/10 text-green-500 rounded-lg shrink-0'>
                            <Play size={20} />
                        </div>
                        <div>
                            <h3 className='font-bold text-[15px] mb-1'>Mulai Aplikasi</h3>
                            <p className='text-xs text-[var(--text-secondary)] mb-2'>
                                Buka terminal (PowerShell/CMD) di mana saja, lalu ketik:
                            </p>
                            <BlokKode kode='lembaran mulai' />
                            <p className='text-[11px] text-[var(--text-muted)] mt-2'>
                                💡 Tip: Gunakan tombol Panah ↑/↓ untuk memilih menu, dan ENTER untuk konfirmasi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className='text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4'>Referensi Perintah</h2>
            <div className='ios-list-group'>
                <div className='p-4 grid grid-cols-1 gap-3'>
                    <div className='flex items-center justify-between'>
                        <code className='text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded'>lembaran pantau</code>
                        <span className='text-xs text-[var(--text-secondary)]'>Cek status sistem</span>
                    </div>
                    <div className='ios-separator'></div>
                    <div className='flex items-center justify-between'>
                        <code className='text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded'>lembaran jelajah</code>
                        <span className='text-xs text-[var(--text-secondary)]'>Lihat daftar catatan</span>
                    </div>
                    <div className='ios-separator'></div>
                    <div className='flex items-center justify-between'>
                        <code className='text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded'>lembaran kuncung</code>
                        <span className='text-xs text-[var(--text-secondary)]'>Login / Buka Brankas</span>
                    </div>
                </div>
            </div>

            <div className='mt-8 text-center'>
                <Link href='https://github.com/Abelion512/lembaran' target='_blank' className='text-xs text-blue-500 font-medium hover:underline'>
                    Lihat Source Code di GitHub
                </Link>
            </div>
        </div>
    );
}