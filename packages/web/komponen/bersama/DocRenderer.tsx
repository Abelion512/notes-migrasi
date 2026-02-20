import React from 'react';
import { marked } from 'marked';
import { bacaBerkas } from '@/lib/bacaBerkas';

interface DocRendererProps {
    slug: string;
}

export async function DocRenderer({ slug }: DocRendererProps) {
    const content = bacaBerkas(`docs/${slug}.md`);

    if (!content) {
        return (
            <div className="p-10 rounded-[3rem] bg-red-500/5 border border-red-500/10 text-red-500">
                <h2 className="text-xl font-black mb-2">Dokumentasi Tidak Ditemukan</h2>
                <p className="text-sm opacity-70">Berkas `docs/${slug}.md` tidak dapat dimuat. Pastikan berkas tersedia di root proyek.</p>
            </div>
        );
    }

    const htmlContent = await marked.parse(content);

    return (
        <div className="prose dark:prose-invert prose-blue max-w-none
            prose-headings:font-light prose-headings:tracking-[0.1em] prose-headings:uppercase
            prose-h1:text-4xl prose-h1:mb-12
            prose-p:text-lg prose-p:font-light prose-p:leading-relaxed prose-p:tracking-wide prose-p:text-[var(--text-secondary)]
            prose-li:font-light prose-li:tracking-wide
            prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg
            prose-pre:bg-black/50 prose-pre:backdrop-blur-md prose-pre:border prose-pre:border-white/5 prose-pre:rounded-[2rem] prose-pre:p-8
            prose-strong:text-[var(--text-primary)] prose-strong:font-bold
            ">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
}
