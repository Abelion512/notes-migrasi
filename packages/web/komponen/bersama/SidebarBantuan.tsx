'use client';

import React from 'react';
import Link from 'next/link';
import {
    Book, Shield, Zap,
    Database, Github,
    Command, Download, PlayCircle,
    ChevronRight, ExternalLink
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { usePathname } from 'next/navigation';

const SECTIONS = [
    {
        title: 'Pengenalan',
        items: [
            { id: 'overview', label: 'Ringkasan', icon: Book },
            { id: 'keamanan', label: 'Keamanan', icon: Shield },
            { id: 'performa', label: 'Performa', icon: Zap },
        ]
    },
    {
        title: 'Instalasi',
        items: [
            { id: 'cli-install', label: 'Pasang CLI', icon: Download },
            { id: 'cli-start', label: 'Mulai CLI', icon: PlayCircle },
        ]
    },
    {
        title: 'Referensi',
        items: [
            { id: 'perintah', label: 'Daftar Perintah', icon: Command },
            { id: 'struktur', label: 'Struktur Data', icon: Database },
        ]
    },
];

export const SidebarBantuan = () => {
    const pathname = usePathname();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            haptic.light();
        }
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[var(--background)] border-r border-[var(--separator)]/10 p-8 overflow-y-auto no-scrollbar z-40">
            <Link href="/" className="flex items-center gap-3 mb-12 group">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">L</div>
                <div className="flex flex-col">
                    <span className="font-black text-sm tracking-tighter uppercase leading-none">Lembaran</span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Documentation</span>
                </div>
            </Link>

            <div className="space-y-10">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-5 ml-4">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:bg-blue-500/5 hover:text-blue-500 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-12 space-y-3">
                <div className="p-5 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Versi Stabil</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black">v3.0.0</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>

                <a
                    href="https://github.com/Abelion512/lembaran"
                    target="_blank"
                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Github size={16} />
                        <span>GitHub</span>
                    </div>
                    <ExternalLink size={14} />
                </a>
            </div>
        </aside>
    );
};
