'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldAlert, History, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { InderaKeamanan, SecurityLog, haptic } from '@lembaran/core';
import { formatWaktuRelatif } from '@lembaran/core/Waktu';

export default function SecurityLogPage() {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLogs = async () => {
        setIsLoading(true);
        const data = await InderaKeamanan.ambilSemua();
        setLogs(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleClear = async () => {
        if (confirm('Bersihkan semua riwayat keamanan?')) {
            await InderaKeamanan.bersihkan();
            haptic.medium();
            loadLogs();
        }
    };

    const getIcon = (level: SecurityLog['level']) => {
        switch (level) {
            case 'error': return <ShieldAlert className="text-red-500" size={18} />;
            case 'warn': return <AlertTriangle className="text-orange-500" size={18} />;
            default: return <ShieldCheck className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <Link href="/laras/keamanan" className="flex items-center gap-1 text-[var(--primary)] active:opacity-40">
                    <ChevronLeft size={24} />
                    <span className="text-[17px]">Keamanan</span>
                </Link>
                {logs.length > 0 && (
                    <button onClick={handleClear} className="text-red-500 p-2 active:opacity-40">
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <h1 className="text-3xl font-bold mb-2 tracking-tight">Log Keamanan</h1>
            <p className="text-[13px] text-[var(--text-secondary)] mb-8 leading-snug">
                Riwayat aktivitas audit brankas Anda. Data ini hanya disimpan secara lokal.
            </p>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                    <History size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Belum Ada Riwayat</p>
                    <p className="text-[11px] mt-1">Semua aktivitas akan dicatat di sini.</p>
                </div>
            ) : (
                <div className="ios-list-group shadow-sm">
                    {logs.map((log, index) => (
                        <React.Fragment key={log.id}>
                            <div className="ios-list-item py-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="mt-1">
                                        {getIcon(log.level)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-[15px] ${log.level === 'error' ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                            {log.event}
                                        </span>
                                        <span className="text-[11px] text-[var(--text-secondary)] opacity-80 leading-snug break-all">
                                            {log.details || 'Tidak ada detail tambahan'}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                                            {formatWaktuRelatif(log.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {index < logs.length - 1 && <div className="ios-separator"></div>}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
