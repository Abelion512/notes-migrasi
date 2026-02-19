'use client';

import React from 'react';
import Link from 'next/link';
import {
    Book, Shield, Zap,
    Database, Github,
    Command, Download, PlayCircle
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

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
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            haptic.light();
        }
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[var(--background)] border-r border-[var(--separator)]/10 p-8 overflow-y-auto no-scrollbar">
            <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black">L</div>
                <span className="font-black text-lg tracking-tighter uppercase">Lembaran Docs</span>
            </Link>

            <div className="space-y-8">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 ml-4">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all text-left group"
                                >
                                    <item.icon size={18} className="opacity-50 group-hover:opacity-100 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-8">
                <a
                    href="https://github.com/Abelion512/lembaran"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all"
                >
                    <Github size={16} />
                    <span>Kontribusi di GitHub</span>
                </a>
            </div>
        </aside>
    );
};
