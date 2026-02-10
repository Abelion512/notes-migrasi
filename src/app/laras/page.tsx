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

            <div className="ios-list-group">
                <Link href="/laras/tampilan" className="ios-list-item">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white">
                            <Moon size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[15px]">Tampilan</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="text-sm">Otomatis</span>
                        <ChevronRight size={16} />
                    </div>
                </Link>
                <div className="ios-separator"></div>
                <Link href="/laras/keamanan" className="ios-list-item">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center text-white">
                            <Shield size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[15px]">Keamanan Vault</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
            </div>

            <div className="ios-list-group">
                <Link href="/laras/data" className="ios-list-item">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center text-white">
                            <Database size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[15px]">Data & Penyimpanan</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-md bg-gray-400 flex items-center justify-center text-white">
                            <Info size={18} fill="currentColor" />
                        </div>
                        <span className="font-medium text-[15px]">Tentang Abelion</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleLock}
                    className="ios-button bg-red-500/10 text-red-600 active:opacity-40"
                >
                    <Lock size={18} />
                    <span>Kunci Vault Sekarang</span>
                </button>
            </div>

            <p className="text-center text-[11px] text-[var(--text-secondary)] mt-8 leading-relaxed opacity-50">
                Abelion Notes v2.0 (Glass OS) <br />
                Penyusun Fragmen Memori Digital
            </p>
        </div>
    );
}
