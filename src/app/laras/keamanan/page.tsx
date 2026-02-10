'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="flex-1 flex flex-col h-screen px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Kembali</span>
            </Link>
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Keamanan</h1>
            <div className="ios-list-group">
                <div className="ios-list-item">
                    <span className="font-medium text-[17px]">Kunci Otomatis</span>
                    <span className="text-[var(--text-secondary)]">1 Menit</span>
                </div>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <span className="font-medium text-[17px]">Ganti Kata Sandi</span>
                    <ChevronLeft size={16} className="rotate-180 opacity-30" />
                </div>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] px-4">Pengaturan keamanan brankas lokal Anda.</p>
        </div>
    );
}
