'use client';

import React, { useEffect, useState } from 'react';
import { usePundi } from '@/aksara/Pundi';
import { LayarKunciBrankas } from './LayarKunciBrankas';
import { usePenjaga } from '@/aksara/Penjaga';
import { usePenyelaras } from '@/aksara/Penyelaras';

interface VaultGateProps {
    children: React.ReactNode;
}

export const PintuBrankas = ({ children }: VaultGateProps) => {
    const { isVaultLocked, settings } = usePundi();
    const [isMounted, setIsMounted] = useState(false);

    // Sync vault status across tabs
    usePenyelaras();

    // Auto lock logic
    usePenjaga();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (isVaultLocked && settings.secretMode === 'gmail') {
            document.title = 'Gmail - Login';
            // Optional: change favicon link if needed
        } else {
            document.title = 'Abelion Notes';
        }
    }, [isVaultLocked, settings.secretMode, isMounted]);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    if (isVaultLocked) {
        return <LayarKunciBrankas />;
    }

    return <>{children}</>;
};
