'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Settings, Plus } from 'lucide-react';

const NAV_ITEMS = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: Search, label: 'Cari', path: '/cari' },
    { icon: Plus, label: 'Tambah', path: '/tambah', isFab: true },
    { icon: User, label: 'Jatidiri', path: '/jatidiri' },
    { icon: Settings, label: 'Laras', path: '/laras' },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md pointer-events-none">
            <nav className="glass-card flex items-center justify-around gap-1 px-4 py-2 pointer-events-auto rounded-[2.5rem] shadow-2xl border-[0.5px] border-white/20">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                aria-label="Tambah Catatan Baru"
                                className="flex items-center justify-center bg-primary text-white w-12 h-12 rounded-full active:opacity-60 transition-opacity shadow-lg shadow-primary/20"
                            >
                                <Icon size={24} strokeWidth={2.5} />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            aria-label={item.label}
                            className="relative flex flex-col items-center justify-center p-3 active:opacity-40 transition-opacity"
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? 'text-primary' : 'text-[var(--text-secondary)]'}
                            />
                            <span className={`text-[9px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-[var(--text-secondary)]'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
