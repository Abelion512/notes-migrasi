import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';
import { Zap } from 'lucide-react';

export default function PerformaPage() {
    return (
        <DocPage
            title="Performa"
            description="Pelajari arsitektur di balik kecepatan kilat Lembaran dalam mengelola ribuan data."
        >
            <DocRenderer slug="performa" />

            <section className="mt-20 p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                <div className="flex items-center gap-4 mb-6 text-yellow-500">
                    <Zap size={32} fill="currentColor" />
                    <h2 className="text-2xl font-black uppercase text-[var(--text-primary)]">Standar Bolt</h2>
                </div>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                    Kami menyebut arsitektur performa kami sebagai **Standar Bolt**. Fokus utama kami adalah menghilangkan latensi di setiap interaksi pengguna.
                </p>
            </section>
        </DocPage>
    );
}
