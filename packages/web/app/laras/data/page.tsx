'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, Database, Package, Activity, Globe, Lock, Upload } from 'lucide-react';
import { Arsip } from '@lembaran/core/Arsip';
import { Brankas } from '@lembaran/core/Brankas';
import { haptic } from '@lembaran/core/Indera';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function DataManagementPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [stats, setStats] = useState({ notes: 0, folders: 0 });
    const [deadLinks, setDeadLinks] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Arsip.getStats().then(setStats);
    }, []);

    const handleExportEncrypted = async () => {
        haptic.medium();
        setIsExporting(true);
        try {
            const rawNotes = await Arsip.getAllNotes();
            const dataStr = JSON.stringify(rawNotes);
            const encryptedData = await Brankas.encryptPacked(dataStr);
            const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
            saveAs(blob, `lembaran-encrypted-vault-${new Date().toISOString().split('T')[0]}.lembaran`);
            haptic.success();
        } catch (e) {
            console.error(e);
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        haptic.medium();
        setIsExporting(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.md')) {
                    const content = await file.text();
                    await Arsip.saveNote({
                        id: '',
                        title: file.name.replace('.md', ''),
                        content: content,
                        folderId: null,
                        isPinned: false,
                        isFavorite: false,
                        tags: ['Imported', 'Markdown']
                    });
                }
            }
            alert(`Berhasil mengimpor ${files.length} file.`);
            Arsip.getStats().then(setStats);
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
        if (confirm('⚠️ PERINGATAN: Ini akan menghapus SELURUH catatan dan pengaturan Anda secara permanen.')) {
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
                </div>
            </div>

            <div className="mb-6">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Impor Data</p>
                <div className="ios-list-group">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExporting}
                        className="ios-list-item w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                <Upload size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Impor dari Markdown (.md)</span>
                        </div>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportMarkdown}
                        multiple
                        accept=".md"
                        className="hidden"
                    />
                </div>
            </div>

            <div className="mb-8">
                <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Cadangan Aman</p>
                <div className="ios-list-group">
                    <button
                        onClick={handleExportEncrypted}
                        disabled={isExporting}
                        className="ios-list-item w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-purple-500 text-white flex items-center justify-center shadow-sm">
                                <Lock size={18} />
                            </div>
                            <span className="font-medium text-[17px]">Ekspor Vault (.lembaran)</span>
                        </div>
                    </button>
                </div>
                <p className="px-4 text-[10px] text-[var(--text-muted)]">File backup ini terenkripsi penuh. Hanya bisa dibuka dengan password brankas Anda.</p>
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
