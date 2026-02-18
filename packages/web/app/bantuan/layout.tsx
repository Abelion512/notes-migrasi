'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NavigasiBantuan } from '@/komponen/fitur/Bantuan/NavigasiBantuan';
import { ThemeToggle } from '@/komponen/landing/ThemeToggle';

export default function BantuanLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)]">
            {/* Header Dokumentasi */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/60 border-b border-[var(--separator)]/5">
                <Link href="/" className="flex items-center gap-2 active:opacity-40 transition-opacity">
                    <ChevronLeft size={24} className="text-[var(--primary)]" />
                    <span className="font-bold text-[17px] tracking-tight">Beranda</span>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/arsip" className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                        Buka Arsip
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full pt-32 pb-32 px-6 gap-16">
                <NavigasiBantuan />
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
