'use client';

import React, { useEffect, useState } from 'react';
import { usePundi } from '@/aksara/Pundi';
import { VaultLockScreen } from './VaultLockScreen';
import { usePenjaga } from '@/aksara/Penjaga';
import { usePenyelaras } from '@/aksara/Penyelaras';

interface VaultGateProps {
    children: React.ReactNode;
}

export const VaultGate = ({ children }: VaultGateProps) => {
    const { isVaultLocked } = usePundi();
    const [isMounted, setIsMounted] = useState(false);

    // Sync vault status across tabs
    usePenyelaras();

    // Auto lock logic
    usePenjaga();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    if (isVaultLocked) {
        return <VaultLockScreen />;
    }

    return <>{children}</>;
};
