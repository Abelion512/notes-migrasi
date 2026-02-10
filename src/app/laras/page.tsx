import Link from 'next/link';
import { Moon, Shield, Database, Info, ChevronRight, LogOut } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-24 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-6">Laras</h1>

            <div className="ios-list-group mb-6">
                <Link href="/laras/tampilan" className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500 text-white"><Moon size={18} /></div>
                        <span className="font-medium">Tampilan</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="text-sm">Otomatis</span>
                        <ChevronRight size={16} />
                    </div>
                </Link>
                <div className="ios-separator"></div>
                <Link href="/laras/keamanan" className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-green-500 text-white"><Shield size={18} /></div>
                        <span className="font-medium">Keamanan Vault</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
            </div>

            <div className="ios-list-group mb-6">
                <Link href="/laras/data" className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-500 text-white"><Database size={18} /></div>
                        <span className="font-medium">Data & Penyimpanan</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </Link>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-gray-500 text-white"><Info size={18} /></div>
                        <span className="font-medium">Tentang Abelion</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </div>
            </div>

            <button className="w-full py-3 text-red-500 font-medium bg-[var(--glass-bg)] border border-[var(--separator)] rounded-xl backdrop-blur-md active:bg-red-500/10 transition-colors">
                Kunci Vault Sekarang
            </button>

            <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
                Abelion Notes v2.0 (Glass OS) <br />
                Build 2026.02.10
            </p>
        </div>
    );
}
