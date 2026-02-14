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
    const isVaultLocked = usePundi(state => state.isVaultLocked);
    const secretMode = usePundi(state => state.settings.secretMode);
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

        // Note: Gmail camouflage handles its own title in PenyamaranGmail component.
        // This effect handles the title for non-gmail locked states or unlocked state.
        if (isVaultLocked) {
            if (secretMode !== 'gmail') {
                document.title = 'Abelion - Terkunci';
            }
        } else {
            document.title = 'Abelion Notes';
        }
    }, [isVaultLocked, secretMode, isMounted]);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    if (isVaultLocked) {
        return <LayarKunciBrankas />;
    }

    return <>{children}</>;
};
