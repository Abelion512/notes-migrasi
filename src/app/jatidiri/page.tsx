'use client';

import React, { useEffect, useState } from 'react';
import { VaultRepository } from '@/lib/storage/VaultRepository';

export default function ProfilePage() {
    const [stats, setStats] = useState({ notes: 0, folders: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await VaultRepository.getStats();
                setStats(data);
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-24 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-6">Jatidiri</h1>

            {/* Profile Card */}
            <div className="glass-card p-6 flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 mb-4 shadow-lg flex items-center justify-center text-4xl text-white font-bold">
                    A
                </div>
                <h2 className="text-xl font-bold">Abelion User</h2>
                <p className="text-[var(--text-secondary)] text-sm">Pengelana Pikiran</p>

                <div className="flex gap-4 mt-6 w-full">
                    <div className="flex-1 bg-[var(--background)]/50 rounded-xl p-3">
                        <div className="text-2xl font-bold text-[var(--primary)]">{stats.notes}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Catatan</div>
                    </div>
                    <div className="flex-1 bg-[var(--background)]/50 rounded-xl p-3">
                        <div className="text-2xl font-bold text-purple-500">{stats.folders}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Folder</div>
                    </div>
                </div>
            </div>

            {/* Activity Chart Mock */}
            <div className="glass-card p-6 mb-6">
                <h3 className="font-semibold mb-4">Aktivitas Mingguan</h3>
                <div className="h-32 flex items-end justify-between gap-2">
                    {[40, 70, 30, 85, 50, 60, 90].map((h, i) => (
                        <div key={i} className="w-full bg-[var(--primary)]/20 rounded-t-sm relative group">
                            <div
                                style={{ height: `${h}%` }}
                                className="absolute bottom-0 w-full bg-[var(--primary)] rounded-t-sm transition-all duration-500"
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[var(--text-secondary)] uppercase">
                    <span>Sen</span><span>Min</span>
                </div>
            </div>
        </div>
    );
}
