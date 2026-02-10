'use client';

import Link from 'next/link';
import { Moon, Shield, Database, Info, ChevronRight, Lock } from 'lucide-react';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { Brankas } from '@/lib/storage/brankas';

export default function SettingsPage() {
    const { setVaultLocked } = useAbelionStore();

    const handleLock = () => {
        Brankas.clearKey();
        setVaultLocked(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Laras</h1>

            <div className="ios-list-group shadow-sm">
                <Link href="/laras/tampilan" className="ios-list-item group">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                            <Moon size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[17px]">Tampilan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)]">Otomatis</span>
                        <ChevronRight size={16} className="text-[var(--separator)]" />
                    </div>
                </Link>
                <div className="ios-separator"></div>
                <Link href="/laras/keamanan" className="ios-list-item group">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-sm">
                            <Shield size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[17px]">Keamanan Vault</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--separator)]" />
                </Link>
            </div>

            <div className="ios-list-group shadow-sm">
                <Link href="/laras/data" className="ios-list-item group">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                            <Database size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[17px]">Data & Penyimpanan</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--separator)]" />
                </Link>
                <div className="ios-separator"></div>
                <div className="ios-list-item group">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-gray-400 flex items-center justify-center text-white shadow-sm">
                            <Info size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[17px]">Tentang Abelion</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--separator)]" />
                </div>
            </div>

            <button
                onClick={handleLock}
                className="ios-list-group w-full py-4 text-red-500 font-semibold text-lg active:bg-red-500/5 transition-colors border-none"
            >
                Kunci Vault Sekarang
            </button>

            <p className="text-center text-[12px] text-[var(--text-muted)] mt-10 leading-relaxed font-medium uppercase tracking-widest opacity-60">
                Abelion Notes v2.0 <br />
                Penyusun Fragmen Memori
            </p>
        </div>
    );
}
