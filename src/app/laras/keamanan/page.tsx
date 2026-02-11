'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, Key } from 'lucide-react';
import { haptic } from '@/aksara/Indera';

export default function SecurityManagementPage() {
    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight">Keamanan</h1>

            <div className="ios-list-group mb-8">
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-green-500 text-white flex items-center justify-center shadow-sm">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Enkripsi Argon2id</span>
                    </div>
                    <span className="text-[var(--text-secondary)] text-sm">Aktif</span>
                </div>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-500 text-white flex items-center justify-center shadow-sm">
                            <Lock size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Kunci Otomatis</span>
                    </div>
                    <span className="text-[var(--text-secondary)] text-sm">1 Menit</span>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-3">
                    <Key size={14} />
                    Informasi Brankas
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Arsip Anda dilindungi dengan enkripsi AES-256-GCM. Kata sandi diubah menjadi kunci kriptografi menggunakan algoritma Argon2id secara lokal di perangkat Anda.
                    <br /><br />
                    <strong>Penting:</strong> Abelion tidak pernah mengirimkan kata sandi atau data mentah Anda ke peladen mana pun.
                </p>
            </div>
        </div>
    );
}
