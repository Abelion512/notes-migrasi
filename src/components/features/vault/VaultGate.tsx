'use client';

import React, { useEffect, useState } from 'react';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { VaultLockScreen } from './VaultLockScreen';

interface VaultGateProps {
    children: React.ReactNode;
}

export const VaultGate = ({ children }: VaultGateProps) => {
    const { isVaultLocked } = useAbelionStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsMounted(true), 0);
    }, []);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    // If encryption is disabled globally, bypass the gate
    // (Optional: depending on strictness requirements. For now, we respect the store state)
    // if (!settings.encryptionEnabled) return <>{children}</>;

    if (isVaultLocked) {
        return <VaultLockScreen />;
    }

    return <>{children}</>;
};
