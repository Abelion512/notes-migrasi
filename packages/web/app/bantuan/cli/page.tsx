import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { DocRenderer } from '@/komponen/bersama/DocRenderer';

export default function CliPage() {
    return (
        <DocPage
            title="Antarmuka CLI"
            description="Lembaran menyediakan antarmuka terminal yang kuat untuk alur kerja pengembangan yang efisien dan otomatisasi."
        >
            <DocRenderer slug="cli" />
        </DocPage>
    );
}
