import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';
import { ShieldCheck } from 'lucide-react';

export default function KeamananPage() {
    return (
        <DocPage
            title="Keamanan"
            description="Privasi Anda adalah prioritas utama kami. Lembaran dibangun dengan prinsip 'Zero Knowledge' dan enkripsi lokal yang tangguh."
        >
            <DocRenderer slug="keamanan" />

            <section className="mt-20 p-10 rounded-[3rem] bg-blue-500 text-white shadow-2xl shadow-blue-500/20">
                <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck size={32} />
                    <h2 className="text-2xl font-black uppercase">Standar Sentinel</h2>
                </div>
                <p className="text-blue-100 mb-8 font-medium leading-relaxed">
                    Setiap baris kode yang menangani data Anda telah melalui audit internal ketat untuk memastikan tidak ada kebocoran informasi ke luar perangkat Anda.
                </p>
            </section>
        </DocPage>
    );
}
