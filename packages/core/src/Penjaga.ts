'use client';

import { useEffect } from 'react';
import { usePundi } from './Pundi';
import { Brankas } from './Brankas';

export const usePenjaga = () => {
    const isVaultLocked = usePundi(s => s.isVaultLocked);
    const setVaultLocked = usePundi(s => s.setVaultLocked);
    const autoLockDelay = usePundi(s => s.settings.autoLockDelay);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !isVaultLocked) {
                // Auto-lock when tab is hidden
                // Use user-defined delay (convert minutes to ms)
                const delayMs = (autoLockDelay || 1) * 60000;

                const lockTimeout = setTimeout(() => {
                    Brankas.clearKey();
                    setVaultLocked(true);
                }, delayMs);

                const cancelLock = () => {
                    if (document.visibilityState === 'visible') {
                        clearTimeout(lockTimeout);
                        document.removeEventListener('visibilitychange', cancelLock);
                    }
                };
                document.addEventListener('visibilitychange', cancelLock);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isVaultLocked, setVaultLocked, autoLockDelay]);
};
