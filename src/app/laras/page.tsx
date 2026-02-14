'use client';

import Link from 'next/link';
import { haptic } from '@/aksara/Indera';
import { Moon, Shield, Database, Info, ChevronRight, LogOut, User } from 'lucide-react';
import { usePundi } from '@/aksara/Pundi';
import { Brankas } from '@/aksara/Brankas';

export default function SettingsPage() {
    const setVaultLocked = usePundi(s => s.setVaultLocked);

    const handleLock = () => {
        haptic.heavy();
        Brankas.clearKey();
        setVaultLocked(true);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)] pb-32">
            <header className="snappy-header">
                <h1 className="text-xl font-extrabold tracking-tight">Setelan</h1>
            </header>

            <div className="max-w-2xl mx-auto w-full px-5 py-6">
                <div className="ios-list-group">
                    <Link href="/jatidiri" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <User size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[17px]">Profil Anda</span>
                                <span className="text-[11px] text-[var(--text-muted)]">XP, Level, dan Jatidiri</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[var(--text-muted)]" />
                    </Link>
                </div>

                <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5 ml-4">Pengaturan Utama</h2>
                <div className="ios-list-group">
                    <Link href="/laras/tampilan" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                <Moon size={18} />
                            </div>
                            <span className="font-semibold">Tampilan</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <span className="text-sm">Otomatis</span>
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/laras/keamanan" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                                <Shield size={18} />
                            </div>
                            <span className="font-semibold">Keamanan Vault</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/laras/data" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                                <Database size={18} />
                            </div>
                            <span className="font-semibold">Data & Penyimpanan</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                </div>

                <div className="ios-list-group">
                    <button
                        onClick={handleLock}
                        className="w-full ios-list-item text-red-500 active:bg-red-500/5 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                                <LogOut size={18} />
                            </div>
                            <span className="font-bold">Kunci Vault Sekarang</span>
                        </div>
                    </button>
                </div>

                <div className="p-8 text-center opacity-40">
                    <div className="font-bold text-xs uppercase tracking-[0.2em] mb-1">Abelion Notes</div>
                    <div className="text-[10px] font-medium">Build 2026.02.12 • Version 2.1.0 (Snappy)</div>
                </div>
            </div>
        </div>
    );
}
