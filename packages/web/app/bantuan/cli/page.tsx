import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { Download, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

const BlokKode = ({ kode }: { kode: string }) => (
    <div className="bg-black text-white p-6 rounded-2xl font-mono text-xs flex items-center justify-between border border-white/10 group">
        <code>{kode}</code>
    </div>
);

export default function CliPage() {
    return (
        <DocPage
            title="Antarmuka CLI"
            description="Lembaran menyediakan antarmuka terminal yang kuat untuk alur kerja pengembangan yang efisien dan otomatisasi."
        >
            <div className="space-y-16">
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <Download size={24} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Instalasi</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                            <h3 className="text-xl font-black mb-4">Menggunakan Bun (Rekomendasi)</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium">Instalasi global langsung dari repositori GitHub:</p>
                            <BlokKode kode="bun install -g Abelion512/lembaran" />
                        </div>
                        <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm">
                            <h3 className="text-xl font-black mb-4">Menggunakan NPM</h3>
                            <BlokKode kode="npm install -g Abelion512/lembaran" />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                            <TerminalIcon size={24} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Menjalankan CLI</h2>
                    </div>
                    <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
                        Setelah terpasang, Anda dapat memanggil Lembaran menggunakan perintah <code className="text-blue-500 font-black">lembaran</code> di terminal Anda.
                    </p>
                    <div className="p-10 rounded-[3rem] bg-black text-white border border-white/5">
                        <div className="flex items-center gap-4 mb-6 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="font-mono text-sm space-y-2">
                            <p className="text-gray-500"># Masuk ke mode interaktif (TUI)</p>
                            <p><span className="text-blue-500">❯</span> lembaran mulai</p>
                            <br />
                            <p className="text-gray-500"># Atau gunakan perintah langsung</p>
                            <p><span className="text-blue-500">❯</span> lembaran pantau</p>
                        </div>
                    </div>
                </section>

                <section className="p-10 rounded-[3rem] bg-[var(--surface)] border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles size={120} />
                    </div>
                    <h3 className="text-xl font-black mb-4">Aksara Shell Prompt</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        Saat menjalankan <code className="text-blue-500">lembaran mulai</code>, Anda akan masuk ke sub-shell khusus dengan prompt <code className="text-blue-500 font-black">aksara ❯</code>. Di sini, Anda dapat mengetik perintah seperti <code className="font-black">mulai</code>, <code className="font-black">pantau</code>, atau <code className="font-black">jelajah</code> secara langsung tanpa awalan &apos;lembaran&apos;.
                    </p>
                </section>
            </div>
        </DocPage>
    );
}
