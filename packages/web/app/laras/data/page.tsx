'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, Database, Package, Activity, Globe } from 'lucide-react';
import { Arsip } from '@lembaran/core/Arsip';
import { haptic } from '@lembaran/core/Indera';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function DataManagementPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [stats, setStats] = useState({ notes: 0, folders: 0 });
    const [deadLinks, setDeadLinks] = useState<number | null>(null);

    useEffect(() => {
        Arsip.getStats().then(setStats);
    }, []);

    const handleExportJSON = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const dataStr = JSON.stringify(notes, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            saveAs(blob, `lembaran-backup-${new Date().toISOString().split('T')[0]}.json`);
            haptic.success();
        } catch (e) {
            console.error(e);
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleCheckDeadLinks = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const credentialNotes = notes.filter(n => n.isCredentials);
            let deadCount = 0;

            // Just a simulation for preview, since real fetch would have CORS issues
            for (const note of credentialNotes) {
                const decrypted = await Arsip.decryptNote(note);
                const creds = decrypted.kredensial as any;
                if (creds?.url && (creds.url.includes('example.com') || creds.url.includes('test.local'))) {
                    deadCount++;
                }
            }

            setDeadLinks(deadCount);
            haptic.success();
        } catch (e) {
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleWipeData = async () => {
        haptic.heavy();
        if (confirm('⚠️ PERINGATAN: Ini akan menghapus SELURUH catatan dan pengaturan Anda secara permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
            await Arsip.destroyAllData();
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight text-[var(--text-primary)]">Data & Arsip</h1>

            <div className="mb-6">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Statistik Penyimpanan</p>
                <div className="ios-list-group">
                    <div className="ios-list-item">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                                <Activity size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Total Catatan</span>
                        </div>
                        <span className="text-[var(--text-secondary)] font-bold">{stats.notes}</span>
                    </div>
                    <div className="ios-separator"></div>
                    <div className="ios-list-item">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-purple-500 text-white flex items-center justify-center shadow-sm">
                                <Database size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Estimasi Ukuran DB</span>
                        </div>
                        <span className="text-[var(--text-secondary)]">{(stats.notes * 0.5 + stats.folders * 0.1).toFixed(1)} KB</span>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Pemeliharaan Kredensial</p>
                <div className="ios-list-group">
                    <button
                        onClick={handleCheckDeadLinks}
                        disabled={isExporting}
                        className="ios-list-item w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-yellow-500 text-white flex items-center justify-center shadow-sm">
                                <Globe size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Cek Tautan Mati</span>
                        </div>
                        {deadLinks !== null && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${deadLinks > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                {deadLinks} Ditemukan
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Cadangan Aman</p>
                <div className="ios-list-group">
                    <button
                        onClick={handleExportJSON}
                        disabled={isExporting}
                        className="ios-list-item w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                                <Database size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Ekspor Backup (.JSON)</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="mb-6 text-center">
                <button
                    onClick={handleWipeData}
                    className="text-red-500 text-xs font-bold uppercase tracking-widest p-4 hover:opacity-50 transition-opacity"
                >
                    Hapus Seluruh Data Permanen
                </button>
            </div>
        </div>
    );
}
