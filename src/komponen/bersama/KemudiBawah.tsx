'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Settings, Plus, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/aksara/Indera';

const NAV_ITEMS = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: Search, label: 'Cari', path: '/cari' },
    { icon: Plus, label: 'Tambah', path: '/tambah', isFab: true },
    { icon: User, label: 'Jatidiri', path: '/jatidiri' },
    { icon: Settings, label: 'Laras', path: '/laras' },
];

export const KemudiBawah = () => {
    const pathname = usePathname();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 flex flex-col items-center z-50 pointer-events-none">
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-2 px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                    >
                        <WifiOff size={10} />
                        MODE LURING
                    </motion.div>
                )}
            </AnimatePresence>

            <nav
                aria-label="Navigasi Utama"
                className="glass-card flex items-center justify-around gap-2 px-6 py-3 min-w-[320px] pointer-events-auto rounded-full shadow-lg border border-white/20"
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                onClick={() => haptic.medium()}
                                aria-label="Tambah Catatan Baru"
                                className="rounded-full shadow-md active:scale-90 transition-transform"
                            >
                                <div
                                    className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white"
                                >
                                    <Icon size={24} />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => !isActive && haptic.light()}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className="relative p-2 active:opacity-60 transition-opacity group"
                        >
                            <Icon
                                size={24}
                                className={`transition-colors duration-300 ${isActive ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
                            />
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
