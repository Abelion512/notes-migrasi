'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 flex justify-center z-50 pointer-events-none">
            <nav className="glass-card flex items-center justify-around gap-2 px-6 py-3 min-w-[320px] pointer-events-auto rounded-full shadow-lg">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link key={item.label} href={item.path} className="rounded-full shadow-md active:opacity-80 transition-opacity">
                                <button
                                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white pointer-events-none"
                                >
                                    <Icon size={24} />
                                </button>
                            </Link>
                        );
                    }

                    return (
                        <Link key={item.path} href={item.path} className="relative p-2 active:opacity-60 transition-opacity group">
                            <Icon
                                size={24}
                                className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-[var(--text-secondary)]'}`}
                            />
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
