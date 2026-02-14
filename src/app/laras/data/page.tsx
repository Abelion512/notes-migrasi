'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Trash2, Database, FileText, Package } from 'lucide-react';
import { Arsip } from '@/aksara/Arsip';
import { haptic } from '@/aksara/Indera';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function DataManagementPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportJSON = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const dataStr = JSON.stringify(notes, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            saveAs(blob, `abelion-backup-${new Date().toISOString().split('T')[0]}.json`);
            haptic.success();
        } catch (e) {
            console.error(e);
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportMarkdownZip = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const zip = new JSZip();

            for (const note of notes) {
                const decrypted = await Arsip.decryptNote(note);
                const stripHtml = (html: string) => {
                    if (typeof window === 'undefined') return "";
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    return doc.body.textContent || "";
                };

                let fileContent = `# ${note.title || 'Tanpa Judul'}\n\n`;
                fileContent += `Dibuat: ${note.createdAt}\n`;
                fileContent += `Diperbarui: ${note.updatedAt}\n`;
                if (note.isCredentials) {
                    fileContent += `\n--- KREDENSIAL ---\n`;
                    fileContent += `Username: ${decrypted.kredensial?.username || '-'}\n`;
                    fileContent += `URL: ${decrypted.kredensial?.url || '-'}\n`;
                    fileContent += `------------------\n\n`;
                }
                fileContent += `\n${stripHtml(decrypted.content)}`;

                const safeTitle = (note.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-');
                zip.file(`${safeTitle}.md`, fileContent);
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `abelion-portable-export-${new Date().getTime()}.zip`);
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
            // In a real app we'd clear IndexedDB
            alert('Fitur penghapusan total akan segera hadir.');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight text-[var(--text-primary)]">Data & Arsip</h1>

            <div className="mb-6">
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
                            <span className="font-medium text-[17px]">Ekspor Backup (JSON Terenkripsi)</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Portabilitas Data</p>
                <div className="ios-list-group">
                    <button
                        onClick={handleExportMarkdownZip}
                        disabled={isExporting}
                        className="ios-list-item w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                <Package size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Ekspor Portabel (.ZIP Markdown)</span>
                        </div>
                    </button>
                </div>
                <p className="px-4 text-[10px] text-[var(--text-muted)]">Berguna untuk memindahkan catatan ke aplikasi lain (Obsidian, Notion, dll).</p>
            </div>

            <div className="mb-6">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Zona Bahaya</p>
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
            </div>

            <div className="mt-auto px-4 flex gap-3 text-[var(--text-secondary)] opacity-60 italic">
                <Database size={16} className="shrink-0 mt-1" />
                <p className="text-[13px] leading-snug">
                    Data Anda disimpan sepenuhnya di dalam peramban (IndexedDB). Kami menyarankan untuk melakukan ekspor berkala.
                </p>
            </div>
        </div>
    );
}
