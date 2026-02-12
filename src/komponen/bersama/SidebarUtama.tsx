'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Search, PlusSquare, User, Settings,
    ShieldCheck, Database, LayoutGrid
} from 'lucide-react';
import { haptic } from '@/aksara/Indera';

export const SidebarUtama = () => {
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: 'Beranda', path: '/' },
        { icon: Search, label: 'Cari', path: '/cari' },
        { icon: PlusSquare, label: 'Tambah', path: '/tambah' },
        { icon: User, label: 'Jatidiri', path: '/jatidiri' },
        { icon: Settings, label: 'Laras', path: '/laras' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[var(--surface)] border-r border-[var(--separator)]/20 p-4">
            <div className="flex items-center gap-3 px-3 mb-10">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
                    <LayoutGrid size={18} />
                </div>
                <span className="font-bold text-lg tracking-tight">Abelion</span>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => haptic.light()}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                isActive
                                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--background)]'
                            }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'opacity-70'} />
                            <span className="font-medium text-[15px]">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-4 bg-[var(--background)] rounded-2xl border border-[var(--separator)]/10">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                    <ShieldCheck size={12} />
                    <span>Sentinel Active</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                    Data Anda terenkripsi secara lokal menggunakan Argon2id.
                </p>
            </div>
        </aside>
    );
};
