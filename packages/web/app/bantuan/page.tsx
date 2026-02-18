'use client';

import React from 'react';
import { Book, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BantuanIntroPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <Book size={12} />
                <span>Dokumentasi Resmi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Memulai.</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed font-medium">
                Lembaran adalah platform kedaulatan data personal. Panduan ini akan membantu Anda menyiapkan brankas digital yang aman dalam hitungan menit.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-16">
                <div className="p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={20} />
                        Langkah 1: Setup Brankas
                    </h3>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-6">
                        Buka halaman Arsip dan masukkan kata sandi utama. Kata sandi ini digunakan untuk menurunkan kunci enkripsi Argon2id secara lokal.
                    </p>
                    <Link href="/arsip" className="text-blue-500 font-bold text-sm flex items-center gap-1 hover:underline">
                        Buka Arsip Sekarang <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={20} />
                        Langkah 2: Simpan Kunci Kertas
                    </h3>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-6">
                        Anda akan menerima 12 kata rahasia. Ini adalah kunci pemulihan Anda. Simpan secara fisik (cetak atau tulis tangan) karena tidak ada fitur "Lupa Password" di arsitektur Zero-Knowledge.
                    </p>
                </div>
            </div>

            <section className="mt-20">
                <h2 className="text-2xl font-bold mb-6 tracking-tight">Filosofi Desain</h2>
                <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium mb-4">
                    Kami percaya bahwa data Anda adalah bagian dari identitas Anda. Lembaran dirancang untuk memberikan pengalaman menulis yang tenang (Calm Technology) tanpa gangguan iklan, pelacakan, atau campur tangan pihak ketiga.
                </p>
            </section>
        </div>
    );
}
