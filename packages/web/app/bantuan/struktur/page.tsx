import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';

export default function StrukturPage() {
    return (
        <DocPage
            title="Struktur Data"
            description="Penjelasan mendalam tentang bagaimana data Anda disimpan, dienkripsi, dan divalidasi."
        >
            <DocRenderer slug="struktur" />
        </DocPage>
    );
}
