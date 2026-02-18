import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import Link from 'next/link';
import { ChevronLeft, Maximize2, Minimize2, Clock } from 'lucide-react';

async function getChangelog() {
    const filePath = path.resolve(process.cwd(), '../../CHANGELOG.md');
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return marked(fileContent);
    } catch (e) {
        return '<p>Changelog tidak ditemukan.</p>';
    }
}

export default async function ChangelogPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const view = (await searchParams).view;
    const isFull = view === 'full';
    const htmlContent = await getChangelog();

    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-20 overflow-y-auto no-scrollbar'>
            <header className="flex items-center justify-between mb-8 max-w-3xl mx-auto w-full">
                <Link href='/' className='flex items-center gap-1 text-[var(--primary)] active:opacity-40 w-fit'>
                    <ChevronLeft size={24} />
                    <span className='text-[17px] font-semibold'>Beranda</span>
                </Link>

                <Link
                    href={isFull ? '/changelog' : '/changelog?view=full'}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--separator)]/20 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] active:scale-95 transition-all"
                >
                    {isFull ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isFull ? 'Ringkasan' : 'Detail Lengkap'}
                </Link>
            </header>

            <div className="max-w-2xl mx-auto w-full">
                <h1 className='text-4xl font-black tracking-tighter mb-2'>Riwayat Perubahan</h1>
                <p className="text-[var(--text-secondary)] text-[15px] mb-12 font-medium">
                    Evolusi Lembaran dalam menjaga kedaulatan data Anda.
                </p>

                {!isFull ? (
                    <div className="space-y-4">
                        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Versi Terbaru</span>
                                <span className="text-[10px] font-bold text-[var(--text-muted)]">18 Feb 2026</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">v2.6.0 — Guardian Suite</h2>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <span>Penerapan "Lembaran GuardDuty" untuk audit log keamanan otomatis.</span>
                                </li>
                                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <span>Integrasi awal Biometrik (WebAuthn) untuk login TouchID/FaceID.</span>
                                </li>
                                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <span>Kustomisasi kekuatan Argon2id dan durasi kunci otomatis.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 opacity-60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Legacy</span>
                                <span className="text-[10px] font-bold text-[var(--text-muted)]">18 Feb 2026</span>
                            </div>
                            <h2 className="text-xl font-bold mb-1">v2.5.0 — Architecture Monorepo</h2>
                            <p className="text-[12px] text-[var(--text-secondary)]">Migrasi ke struktur monorepo dan landing page premium.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--separator)]/10 opacity-40">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Legacy</span>
                                <span className="text-[10px] font-bold text-[var(--text-muted)]">17 Feb 2026</span>
                            </div>
                            <h2 className="text-xl font-bold mb-1">v2.4.0 — CLI Puitis</h2>
                            <p className="text-[12px] text-[var(--text-secondary)]">Peluncuran antarmuka terminal yang lebih efisien.</p>
                        </div>

                        <div className="text-center pt-8">
                            <Link href="/changelog?view=full" className="text-blue-500 text-[11px] font-black uppercase tracking-widest hover:underline">
                                Lihat Seluruh Riwayat Sejak Awal
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className='prose dark:prose-invert prose-sm max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                )}
            </div>
        </div>
    );
}
