'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Book, Shield, Terminal, Globe, HelpCircle,
    ChevronRight, Sparkles, Zap, Lock
} from 'lucide-react';

const MENU = [
    { title: 'Memulai', slug: '/bantuan', icon: Book },
    { title: 'Arsitektur Keamanan', slug: '/bantuan/keamanan', icon: Shield },
    { title: 'Panduan CLI', slug: '/bantuan/cli', icon: Terminal },
    { title: 'Integrasi Cloud', slug: '/bantuan/integrasi', icon: Globe },
    { title: 'Tanya Jawab', slug: '/bantuan/faq', icon: HelpCircle },
];

export const NavigasiBantuan = () => {
    const pathname = usePathname();

    return (
        <nav className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 ml-4">Dokumentasi</span>
                {MENU.map((item) => (
                    <Link
                        key={item.slug}
                        href={item.slug}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${pathname === item.slug ? 'bg-blue-500/10 text-blue-600 font-bold' : 'hover:bg-[var(--surface)] text-[var(--text-secondary)]'}`}
                    >
                        <item.icon size={18} className={pathname === item.slug ? 'text-blue-500' : 'opacity-40'} />
                        <span className="text-[14px] flex-1">{item.title}</span>
                        {pathname === item.slug && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </Link>
                ))}
            </div>

            <div className="mt-12 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Beta v2.6.1</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Sistem dokumentasi baru sedang dalam pengembangan aktif.
                </p>
            </div>
        </nav>
    );
};
