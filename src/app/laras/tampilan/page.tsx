'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AppearancePage() {
    return (
        <div className="flex-1 flex flex-col h-screen px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Kembali</span>
            </Link>
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Tampilan</h1>
            <div className="ios-list-group">
                <div className="ios-list-item">
                    <span className="font-medium">Tema Otomatis</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] px-4">Tema akan menyesuaikan setelan sistem perangkat Anda.</p>
        </div>
    );
}
