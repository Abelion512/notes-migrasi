'use client';

import React from 'react';
import { Globe, Database, Cloud } from 'lucide-react';

export default function IntegrasiDocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <Globe size={12} />
                <span>Ekosistem</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Integrasi Cloud.</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed font-medium">
                Meskipun Lembaran bersifat local-first, kami menyediakan opsi sinkronisasi terenkripsi untuk akses antar perangkat.
            </p>

            <div className="p-8 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 mb-8">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                    <Cloud size={24} />
                    <h3 className="text-xl font-bold">Sinkronisasi Supabase</h3>
                </div>
                <p className="text-[15px] text-[var(--text-secondary)] font-medium leading-relaxed">
                    Kami mendukung sinkronisasi melalui Supabase. Data yang dikirim ke cloud tetap dalam keadaan terenkripsi penuh (E2EE). Kunci enkripsi tidak pernah meninggalkan perangkat Anda.
                </p>
            </div>
        </div>
    );
}
