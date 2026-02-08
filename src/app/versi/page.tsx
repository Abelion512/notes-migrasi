'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, GitCommit } from 'lucide-react';
import KemudiBawah from '@/komponen/KemudiBawah';

export default function LamanVersi() {
    const changelog = [
        {
            version: '2.0.7',
            date: '8 Feb 2026',
            changes: [
                'Restorasi desain Glass OS Legacy (Pixel-Perfect).',
                'Implementasi Mood Tracking Mingguan.',
                'Peningkatan keamanan dengan Argon2id.',
                'Perbaikan performa scroll dan layout.',
            ]
        },
        {
            version: '2.0.6',
            date: '1 Feb 2026',
            changes: [
                'Migrasi ke Next.js 14 App Router.',
                'Integrasi database lokal dengan state management global.',
            ]
        }
    ];

    return (
        <>
            <div className="container mx-auto max-w-[800px] px-4 pt-8 pb-32">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/laras" className="p-2 rounded-full hover:bg-border-subtle transition-colors">
                        <ChevronLeft size={24} className="text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold">Catatan Rilis</h1>
                </header>

                <div className="space-y-8">
                    {changelog.map((log, index) => (
                        <div key={log.version} className="relative pl-8 border-l-2 border-border-subtle pb-8 last:pb-0">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-primary' : 'bg-border-subtle'}`} />

                            <div className="flex items-baseline gap-3 mb-2">
                                <h2 className="text-xl font-bold">v{log.version}</h2>
                                <span className="text-sm text-secondary">{log.date}</span>
                            </div>

                            <div className="section-card p-5">
                                <ul className="space-y-3">
                                    {log.changes.map((change, i) => (
                                        <li key={i} className="flex gap-3 text-sm">
                                            <GitCommit size={16} className="text-primary shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-secondary">
                        Dibangun dengan ❤️ oleh Tim Abelion
                        <br />
                        &copy; 2026 Public Domain
                    </p>
                </div>
            </div>
            <KemudiBawah />
        </>
    );
}
