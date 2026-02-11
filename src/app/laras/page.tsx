'use client';

import Link from 'next/link';
import { haptic } from '@/aksara/Indera';
import { Moon, Shield, Database, Info, ChevronRight } from 'lucide-react';
import { usePundi } from '@/aksara/Pundi';
import { Brankas } from '@/aksara/Brankas';

export default function SettingsPage() {
    const { setVaultLocked } = usePundi();

    const handleLock = () => {
        haptic.heavy();
        Brankas.clearKey();
        setVaultLocked(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Laras</h1>

            <div className="ios-list-group mb-6">
                <Link href="/laras/tampilan" className="ios-list-item" onClick={() => haptic.light()}>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Moon size={18} />
                        </div>
                        <span className="font-medium">Tampilan</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="text-sm">Otomatis</span>
                        <ChevronRight size={16} />
                    </div>
                </Link>
                <div className="ios-separator"></div>
                <Link href="/laras/keamanan" className="ios-list-item" onClick={() => haptic.light()}>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-green-500 text-white flex items-center justify-center shadow-sm">
                            <Shield size={18} />
                        </div>
                        <span className="font-medium">Keamanan Vault</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
            </div>

            <div className="ios-list-group mb-6">
                <Link href="/laras/data" className="ios-list-item" onClick={() => haptic.light()}>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-500 text-white flex items-center justify-center shadow-sm">
                            <Database size={18} />
                        </div>
                        <span className="font-medium">Data & Penyimpanan</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
                <div className="ios-separator"></div>
                <div className="ios-list-item cursor-pointer" onClick={() => haptic.light()}>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-gray-500 text-white flex items-center justify-center shadow-sm">
                            <Info size={18} />
                        </div>
                        <span className="font-medium">Tentang Abelion</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </div>
            </div>

            <button
                onClick={handleLock}
                className="w-full py-3.5 text-red-500 font-semibold bg-[var(--glass-bg)] border border-[var(--separator)] rounded-xl backdrop-blur-md active:opacity-70 transition-all shadow-sm"
            >
                Kunci Vault Sekarang
            </button>

            <p className="text-center text-xs text-[var(--text-secondary)] mt-8 opacity-60">
                Abelion Notes v2.0 (Glass OS) <br />
                Build 2026.02.11
            </p>
        </div>
    );
}
