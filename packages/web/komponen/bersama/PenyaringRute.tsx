'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PintuBrankas } from '@/komponen/fitur/Brankas/PintuBrankas';
import { KemudiBawah } from '@/komponen/bersama/KemudiBawah';
import { PaletPerintah } from '@/komponen/bersama/PaletPerintah';
import { PencarianCepat } from '@/komponen/bersama/PencarianCepat';

export const PenyaringRute = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';
    const isPublicDocs = pathname.startsWith('/bantuan/publik');

    if (isLandingPage || isPublicDocs) {
        return <div className="flex-1 flex flex-col w-full">{children}</div>;
    }

    return (
        <PintuBrankas>
            <div className="flex-1 flex flex-col relative min-h-screen bg-[var(--background)]">
                <PaletPerintah />
                <PencarianCepat />
                <div className="flex-1 w-full min-w-0">
                    {children}
                </div>
                <KemudiBawah />
            </div>
        </PintuBrankas>
    );
};
