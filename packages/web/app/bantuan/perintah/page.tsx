import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { Command } from 'lucide-react';

export default function PerintahPage() {
    const PERINTAH = [
        { cmd: 'mulai', desc: 'Menjalankan Antarmuka Terminal Interaktif (TUI).', usage: 'lembaran mulai' },
        { cmd: 'pantau', desc: 'Memeriksa status sistem, integritas database, dan penggunaan ruang.', usage: 'lembaran pantau' },
        { cmd: 'jelajah', desc: 'Membuka penjelajah catatan dengan fitur pencarian fuzzy.', usage: 'lembaran jelajah' },
        { cmd: 'ukir <id>', desc: 'Mengedit catatan langsung melalui terminal menggunakan editor default.', usage: 'lembaran ukir 123' },
        { cmd: 'tanam', desc: 'Mengimpor catatan secara massal dari file terenkripsi.', usage: 'lembaran tanam' },
        { cmd: 'petik', desc: 'Mengekspor seluruh brankas ke format terenkripsi untuk cadangan.', usage: 'lembaran petik' },
        { cmd: 'status', desc: 'Menampilkan ringkasan statistik brankas.', usage: 'lembaran status' },
    ];

    return (
        <DocPage
            title="Daftar Perintah"
            description="Referensi lengkap perintah yang tersedia di CLI Lembaran untuk pengelolaan data yang efisien."
        >
            <div className="space-y-8">
                <div className="ios-list-group bg-[var(--surface)] border border-[var(--separator)]/10">
                    {PERINTAH.map((p, i) => (
                        <div key={p.cmd} className="p-8 border-b border-[var(--separator)]/10 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <code className="text-sm font-black text-blue-500 bg-blue-500/5 px-4 py-2 rounded-xl w-fit">
                                    {p.cmd}
                                </code>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                    Contoh: {p.usage}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--separator)]/10">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                        <Command size={20} className="text-gray-400" /> Tips Shorthand
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        Gunakan perintah <code className="text-blue-500 font-black">lembaran</code> diikuti dengan huruf pertama perintah untuk akses lebih cepat. Contoh: <code className="font-black">lembaran p</code> untuk <code className="font-black">pantau</code>.
                    </p>
                </div>
            </div>
        </DocPage>
    );
}
