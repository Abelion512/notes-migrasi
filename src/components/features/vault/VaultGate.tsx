'use client';

import React, { useEffect, useState } from 'react';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { VaultLockScreen } from './VaultLockScreen';
import { useVaultAutoLock } from '@/lib/hooks/useVaultAutoLock';
import { useVaultSync } from '@/lib/hooks/useVaultSync';

interface VaultGateProps {
    children: React.ReactNode;
}

export const VaultGate = ({ children }: VaultGateProps) => {
    const { isVaultLocked } = useAbelionStore();
    const [isMounted, setIsMounted] = useState(false);

    // Sync vault status across tabs
    useVaultSync();

    // Auto lock logic
    useVaultAutoLock();

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
