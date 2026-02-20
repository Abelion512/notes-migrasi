import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';

export default function PerintahPage() {
    return (
        <DocPage
            title="Daftar Perintah"
            description="Referensi cepat untuk semua perintah CLI yang tersedia di ekosistem Lembaran."
        >
            <DocRenderer slug="perintah" />
        </DocPage>
    );
}
