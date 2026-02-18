import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import Link from 'next/link';
import { ChevronLeft, Maximize2, Minimize2, Clock, Sparkles, Shield, Terminal } from 'lucide-react';

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
        <div className='flex-1 flex flex-col min-h-screen bg-[var(--background)]'>
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/60 border-b border-[var(--separator)]/5">
                <Link href='/' className='flex items-center gap-2 text-[var(--primary)] active:opacity-40 w-fit p-1'>
                    <ChevronLeft size={24} />
                    <span className='font-bold text-[17px] tracking-tight'>Beranda</span>
                </Link>

                <Link
                    href={isFull ? '/changelog' : '/changelog?view=full'}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--surface)] border border-[var(--separator)]/20 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] active:scale-95 transition-all shadow-sm"
                >
                    {isFull ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isFull ? 'Ringkasan' : 'Detail Lengkap'}
                </Link>
            </header>

            <main className="max-w-4xl mx-auto w-full pt-32 pb-32 px-6">
                <div className="mb-12">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Clock size={12} />
                        <span>Timeline Evolusi</span>
                    </div>
                    <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight mb-4'>Riwayat Perubahan.</h1>
                    <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed">
                        Transparansi adalah inti dari keamanan. Berikut adalah catatan pengembangan Lembaran menuju kesempurnaan.
                    </p>
                </div>

                {!isFull ? (
                    <div className="space-y-6">
                        {/* v2.6.1 */}
                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm group hover:shadow-xl hover:border-blue-500/20 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <Sparkles size={18} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Rilis Terbaru</span>
                                </div>
                                <span className="text-[12px] font-bold opacity-40">18 Feb 2026</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">v2.6.1 — Premium UI & Docs</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 mt-0.5"><Shield size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold">Overhaul Dokumentasi Premium</span>
                                        <span className="text-[13px] text-[var(--text-secondary)] font-medium">Struktur baru dengan sidebar dan panduan teknis mendalam.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 mt-0.5"><Sparkles size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold">Animasi Transisi Tema Sirkular</span>
                                        <span className="text-[13px] text-[var(--text-secondary)] font-medium">Transisi visual mewah yang meluas dari posisi klik tombol tema.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 mt-0.5"><Terminal size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold">Optimasi Keterbacaan UX</span>
                                        <span className="text-[13px] text-[var(--text-secondary)] font-medium">Pembaruan tipografi dan spasi pada landing page untuk kenyamanan baca.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* v2.6.0 */}
                        <div className="p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10 opacity-70">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Legacy</span>
                                <span className="text-[11px] font-bold opacity-30">18 Feb 2026</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">v2.6.0 — Guardian Suite</h2>
                            <p className="text-[14px] text-[var(--text-secondary)] font-medium">Penerapan GuardDuty, Audit Log, dan integrasi Biometrik awal.</p>
                        </div>

                        <div className="text-center pt-12">
                            <Link href="/changelog?view=full" className="text-blue-500 text-[12px] font-black uppercase tracking-[0.2em] hover:underline">
                                Lihat Seluruh Arsip Perubahan Sejak v1.0
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className='prose dark:prose-invert prose-sm max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[var(--surface)] p-10 rounded-[3rem] border border-[var(--separator)]/10'>
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                )}
            </main>
        </div>
    );
}
