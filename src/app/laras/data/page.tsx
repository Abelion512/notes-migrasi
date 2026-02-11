'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Trash2, Database, AlertTriangle } from 'lucide-react';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';

export default function DataManagementPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportJSON = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const dataStr = JSON.stringify(notes, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            const exportFileDefaultName = `abelion-export-${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            haptic.success();
        } catch (e) {
            console.error(e);
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleWipeData = async () => {
        haptic.heavy();
        if (confirm('⚠️ PERINGATAN: Ini akan menghapus SELURUH catatan dan pengaturan Anda secara permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
            // Logic to clear IndexedDB would go here, but for now we just show a message or clear the main stores
            alert('Fitur penghapusan total akan segera hadir di versi stabil.');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight">Data & Arsip</h1>

            <div className="ios-list-group mb-6">
                <button
                    onClick={handleExportJSON}
                    disabled={isExporting}
                    className="ios-list-item w-full"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Download size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Ekspor Cadangan (JSON)</span>
                    </div>
                </button>
            </div>

            <div className="ios-list-group">
                <button
                    onClick={handleWipeData}
                    className="ios-list-item w-full text-red-500"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-red-500 text-white flex items-center justify-center shadow-sm">
                            <Trash2 size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Hapus Seluruh Data</span>
                    </div>
                </button>
            </div>

            <div className="mt-8 px-4 flex gap-3 text-[var(--text-secondary)] opacity-60 italic">
                <Database size={16} className="shrink-0 mt-1" />
                <p className="text-[13px] leading-snug">
                    Data Anda disimpan sepenuhnya di dalam peramban (IndexedDB). Kami menyarankan untuk melakukan ekspor berkala untuk menjaga keamanan memori Anda.
                </p>
            </div>
        </div>
    );
}
