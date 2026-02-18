'use client';

import React from 'react';
import { Shield, Lock, Zap, FileSearch } from 'lucide-react';

export default function KeamananDocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <Shield size={12} />
                <span>Teknis Kriptografi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Arsitektur Keamanan.</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed font-medium">
                Kami menerapkan standar keamanan "Defense in Depth" (Pertahanan Berlapis) untuk menjamin data Anda tetap rahasia selamanya.
            </p>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lock className="text-blue-500" size={20} />
                        Enkripsi AES-256-GCM
                    </h3>
                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        Setiap catatan dienkripsi secara individual menggunakan AES-256 dalam mode GCM (Galois/Counter Mode). Mode ini tidak hanya mengacak data, tetapi juga memverifikasi bahwa data tidak pernah dimanipulasi (Authenticity).
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="text-orange-500" size={20} />
                        Argon2id Key Derivation
                    </h3>
                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        Kata sandi Anda tidak disimpan. Kami menggunakannya sebagai input ke fungsi Argon2id (pemenang Password Hashing Competition) dengan parameter memori yang dapat dikustomisasi untuk melawan serangan penambangan hardware secara efisien.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileSearch className="text-purple-500" size={20} />
                        Segel Digital (Integrity Check)
                    </h3>
                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        Sistem secara otomatis menghitung hash SHA-256 dari konten yang didekripsi. Jika data di IndexedDB dimodifikasi oleh entitas eksternal, Lembaran akan memberikan peringatan "Segel Rusak" saat Anda mencoba membukanya.
                    </p>
                </section>
            </div>
        </div>
    );
}
