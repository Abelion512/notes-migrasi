import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { Lock, ShieldCheck, Key } from 'lucide-react';

export default function KeamananPage() {
    return (
        <DocPage
            title="Keamanan"
            description="Privasi Anda adalah prioritas utama kami. Lembaran dibangun dengan prinsip 'Zero Knowledge' dan enkripsi lokal yang tangguh."
        >
            <div className="space-y-12">
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Enkripsi AES-GCM 256</h2>
                    </div>
                    <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
                        Setiap data yang Anda simpan di Lembaran dienkripsi menggunakan standar militer AES-256 dalam mode GCM (Galois/Counter Mode).
                        Ini memberikan dua lapisan perlindungan: kerahasiaan data dan verifikasi integritas data.
                    </p>
                    <div className="ios-list-group border border-[var(--separator)]/10">
                        {[
                            { title: 'Data-at-Rest', desc: 'Semua file di penyimpanan lokal Anda terenkripsi secara default.' },
                            { title: 'In-Memory Encryption', desc: 'Data sensitif hanya didekripsi saat dibutuhkan di memori RAM.' },
                            { title: 'Brute Force Protection', desc: 'Pintu Brankas memiliki mekanisme delay untuk mencegah serangan kamus.' }
                        ].map(item => (
                            <div key={item.title} className="p-6 border-b border-[var(--separator)]/10 last:border-0">
                                <h4 className="font-black text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-[var(--text-secondary)] font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                        <ShieldCheck className="text-blue-500 mb-6" size={32} />
                        <h3 className="text-xl font-black mb-4">Integritas Data</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Kami menggunakan SHA-256 untuk memverifikasi setiap blok data. Jika ada satu bit pun yang berubah (akibat kerusakan disk atau manipulasi), Lembaran akan menolak memuat data tersebut demi keamanan Anda.
                        </p>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                        <Key className="text-purple-500 mb-6" size={32} />
                        <h3 className="text-xl font-black mb-4">Kedaulatan Kunci</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                            Kunci enkripsi diturunkan dari frasa sandi Anda menggunakan Argon2id. Kami tidak pernah menyimpan frasa sandi Anda di mana pun; Anda adalah satu-satunya pemegang kunci.
                        </p>
                    </div>
                </section>
            </div>
        </DocPage>
    );
}
