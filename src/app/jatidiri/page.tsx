'use client';

import React, { useEffect, useState } from 'react';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { Note } from '@/types';

export default function ProfilePage() {
    const { profile } = useAbelionStore();
    const [stats, setStats] = useState({ notes: 0, folders: 0 });
    const [activity, setActivity] = useState<number[]>(Array(7).fill(0));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const s = await VaultRepository.getStats();
                setStats(s);

                const allNotes = await VaultRepository.getAllNotes();
                const counts = Array(7).fill(0);
                const now = new Date();

                allNotes.forEach(note => {
                    const date = new Date(note.updatedAt);
                    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
                    if (diffDays < 7) {
                        const day = date.getDay(); // 0 (Sun) to 6 (Sat)
                        // Adjust to Sen-Min (Mon-Sun)
                        const index = day === 0 ? 6 : day - 1;
                        counts[index]++;
                    }
                });

                // Scale for chart (max 100%)
                const max = Math.max(...counts, 1);
                setActivity(counts.map(c => (c / max) * 100));
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-screen px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Jatidiri</h1>

            <div className="glass-card p-8 flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 mb-5 shadow-2xl flex items-center justify-center text-4xl text-white font-bold ring-4 ring-white/10">
                    {profile.name[0]}
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium italic opacity-70">"{profile.bio}"</p>

                <div className="flex gap-3 mt-8 w-full">
                    <div className="flex-1 bg-white/5 dark:bg-black/20 rounded-2xl p-4 border border-white/5">
                        <div className="text-3xl font-bold text-primary mb-1">{stats.notes}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)]">Catatan</div>
                    </div>
                    <div className="flex-1 bg-white/5 dark:bg-black/20 rounded-2xl p-4 border border-white/5">
                        <div className="text-3xl font-bold text-indigo-500 mb-1">{stats.folders}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)]">Folder</div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-sm">Aktivitas Menulis</h3>
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">7 Hari Terakhir</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-2.5 px-2">
                    {activity.map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/10 rounded-full h-full relative overflow-hidden">
                            <div
                                style={{ height: `${Math.max(h, 5)}%` }}
                                className="absolute bottom-0 w-full bg-primary transition-all duration-1000 ease-out"
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter opacity-50 px-2">
                    <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                </div>
            </div>

            <div className="ios-list-group">
                <div className="ios-list-item">
                    <span className="font-medium text-sm">Pencapaian (XP)</span>
                    <span className="text-primary font-bold">{profile.xp} XP</span>
                </div>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <span className="font-medium text-sm">Level</span>
                    <span className="text-[var(--text-secondary)]">Arsiparis Muda (Lvl {profile.level})</span>
                </div>
            </div>
        </div>
    );
}
