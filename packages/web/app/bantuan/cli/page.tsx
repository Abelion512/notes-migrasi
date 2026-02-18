'use client';

import React from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const BlokKode = ({ kode }: { kode: string }) => {
    const [copied, setCopied] = React.useState(false);
    const salin = () => {
        navigator.clipboard.writeText(kode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='relative group my-4'>
            <div className='bg-black/5 dark:bg-white/5 p-4 pr-12 rounded-2xl font-mono text-[13px] border border-[var(--separator)]/10 break-all leading-relaxed'>
                <span className="text-blue-500 mr-2">$</span>{kode}
            </div>
            <button onClick={salin} className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[var(--surface)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity'>
                {copied ? <Check size={14} className='text-green-500' /> : <Copy size={14} className='opacity-40' />}
            </button>
        </div>
    );
};

export default function CliDocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <Terminal size={12} />
                <span>Power User</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Panduan CLI.</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed font-medium">
                Optimalkan produktivitas Anda dengan akses terminal langsung. CLI v2.6.1 mendukung manajemen penuh tanpa browser.
            </p>

            <section className="mb-12">
                <h3 className="text-xl font-bold mb-4">Instalasi</h3>
                <BlokKode kode="bun install -g @lembaran/cli" />
            </section>

            <section className="mb-12">
                <h3 className="text-xl font-bold mb-4">Daftar Perintah</h3>
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <code className="text-blue-500 font-bold block mb-2">pantau</code>
                        <p className="text-sm font-medium opacity-70">Menampilkan status sistem, versi, dan kesehatan database.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <code className="text-blue-500 font-bold block mb-2">jelajah</code>
                        <p className="text-sm font-medium opacity-70">Membuka antarmuka interaktif untuk membaca dan mengelola catatan.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10">
                        <code className="text-blue-500 font-bold block mb-2">kuncung</code>
                        <p className="text-sm font-medium opacity-70">Melakukan sinkronisasi token dan membuka antarmuka Web Dashboard.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
