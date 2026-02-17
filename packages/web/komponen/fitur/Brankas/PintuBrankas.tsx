'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePundi } from '@lembaran/core/Pundi';
import { LayarKunciBrankas } from './LayarKunciBrankas';
import { usePenjaga } from '@lembaran/core/Penjaga';
import { usePenyelaras } from '@lembaran/core/Penyelaras';

interface VaultGateProps {
    children: React.ReactNode;
}

export const PintuBrankas = ({ children }: VaultGateProps) => {
    const isVaultLocked = usePundi(state => state.isVaultLocked);
    const secretMode = usePundi(state => state.settings.secretMode);
    const [isMounted, setIsMounted] = useState(false);
    const hasMounted = useRef(false);

    // Sync vault status across tabs
    usePenyelaras();

    // Auto lock logic
    usePenjaga();

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- mount detection for SSR hydration
            setIsMounted(true);
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Note: Gmail camouflage handles its own title in PenyamaranGmail component.
        // This effect handles the title for non-gmail locked states or unlocked state.
        if (isVaultLocked) {
            if (secretMode !== 'gmail') {
                document.title = 'Lembaran - Terkunci';
            }
        } else {
            document.title = 'Lembaran Notes';
        }
    }, [isVaultLocked, secretMode, isMounted]);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    if (isVaultLocked) {
        return <LayarKunciBrankas />;
    }

    return <>{children}</>;
};
