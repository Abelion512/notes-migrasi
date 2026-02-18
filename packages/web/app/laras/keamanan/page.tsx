'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, Key, Ghost, Timer, Zap } from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { usePundi } from '@lembaran/core/Pundi';

export default function SecurityManagementPage() {
    const { settings, updateSettings } = usePundi();

    const toggleSecretMode = () => {
        haptic.light();
        const nextMode = settings.secretMode === 'none' ? 'gmail' : 'none';
        updateSettings({ secretMode: nextMode });
    };

    const updateAutoLock = (val: number) => {
        haptic.light();
        updateSettings({ autoLockDelay: val });
    };

    const updateArgon = (val: 'standard' | 'strong' | 'paranoid') => {
        haptic.light();
        updateSettings({ argonStrength: val });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight">Keamanan</h1>

            <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Enkripsi & Brankas</h2>
            <div className="ios-list-group mb-10">
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Zap size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-[17px]">Kekuatan Argon2id</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Kekuatan kunci kriptografi</span>
                        </div>
                    </div>
                    <select
                        value={settings.argonStrength || 'standard'}
                        onChange={(e) => updateArgon(e.target.value as any)}
                        className="bg-transparent text-[var(--primary)] text-sm font-semibold outline-none text-right cursor-pointer"
                    >
                        <option value="standard">Standar</option>
                        <option value="strong">Kuat</option>
                        <option value="paranoid">Paranoid</option>
                    </select>
                </div>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-500 text-white flex items-center justify-center shadow-sm">
                            <Timer size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-[17px]">Kunci Otomatis</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Saat tab tidak aktif</span>
                        </div>
                    </div>
                    <select
                        value={settings.autoLockDelay || 1}
                        onChange={(e) => updateAutoLock(parseInt(e.target.value))}
                        className="bg-transparent text-[var(--primary)] text-sm font-semibold outline-none text-right cursor-pointer"
                    >
                        <option value={1}>1 Menit</option>
                        <option value={5}>5 Menit</option>
                        <option value={15}>15 Menit</option>
                        <option value={60}>1 Jam</option>
                    </select>
                </div>
            </div>

            <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Penyamaran</h2>
            <div className="ios-list-group mb-10">
                <button
                    onClick={toggleSecretMode}
                    className="w-full ios-list-item active:bg-[var(--surface-active)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-gray-600 text-white flex items-center justify-center shadow-sm">
                            <Ghost size={18} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-[17px]">Mode Rahasia</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Samarkan brankas sebagai Gmail</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-[var(--primary)] text-sm font-semibold">
                            {settings.secretMode === 'gmail' ? 'Aktif' : 'Mati'}
                        </span>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.secretMode === 'gmail' ? 'bg-green-500' : 'bg-[var(--separator)]'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.secretMode === 'gmail' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </button>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-3">
                    <Key size={14} />
                    Informasi Keamanan
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Arsip Anda dilindungi dengan enkripsi AES-256-GCM.
                    <br /><br />
                    <strong>Kekuatan Argon:</strong> Tingkat "Paranoid" memberikan perlindungan tertinggi terhadap serangan brute-force, namun membutuhkan waktu pemrosesan dan RAM lebih besar (256MB) saat membuka brankas.
                    <br /><br />
                    <strong>Kunci Otomatis:</strong> Brankas akan otomatis terkunci jika tab aplikasi tidak aktif dalam jangka waktu yang ditentukan untuk menjaga kerahasiaan data Anda.
                </p>
            </div>
        </div>
    );
}
