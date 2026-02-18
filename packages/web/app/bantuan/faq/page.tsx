'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FaqDocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <HelpCircle size={12} />
                <span>Bantuan</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Tanya Jawab.</h1>

            <div className="space-y-10">
                <div>
                    <h4 className="font-bold text-lg mb-3">Apa yang terjadi jika saya lupa kata sandi?</h4>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        Anda akan kehilangan akses ke data selamanya kecuali Anda memiliki <strong>Kunci Kertas</strong>. Lembaran tidak memiliki database terpusat yang menyimpan password Anda.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-3">Di mana file .lembaran-db.json disimpan?</h4>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        Secara default, file tersebut berada di folder root tempat Anda menjalankan perintah CLI. Anda dapat mengubah lokasinya menggunakan variabel lingkungan <code>DB_PATH</code>.
                    </p>
                </div>
            </div>
        </div>
    );
}
