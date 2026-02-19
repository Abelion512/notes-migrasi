import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

async function getChangelog() {
    const paths = [
        path.join(process.cwd(), 'CHANGELOG.md'),
        path.join(process.cwd(), '..', '..', 'CHANGELOG.md'),
        path.join(process.cwd(), 'packages', 'web', 'CHANGELOG.md'),
    ];

    for (const filePath of paths) {
        try {
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                return marked(fileContent);
            }
        } catch (e) {
            continue;
        }
    }
    return '<p>Changelog tidak ditemukan.</p>';
}

export default async function ChangelogPage() {
    const htmlContent = await getChangelog();

    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-20 overflow-y-auto no-scrollbar'>
            <Link href='/tentang' className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'>
                <ChevronLeft size={24} />
                <span className='text-[17px]'>Tentang</span>
            </Link>

            <h1 className='text-3xl font-bold tracking-tight mb-6'>Riwayat Perubahan</h1>

            <div className='prose dark:prose-invert prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-6 prose-p:my-2 prose-li:my-0.5'>
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
}
