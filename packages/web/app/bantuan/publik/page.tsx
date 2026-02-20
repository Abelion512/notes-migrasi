import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';

export default function BantuanPublikPage() {
    return (
        <DocPage
            title="Mulai Berdikari"
            description="Panduan cepat untuk memahami ekosistem Lembaran dan menguasai kedaulatan data Anda dalam hitungan menit."
        >
            <DocRenderer slug="publik" />
        </DocPage>
    );
}
