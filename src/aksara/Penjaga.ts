'use client';

import { useEffect } from 'react';
import { usePundi } from '@/aksara/Pundi';
import { Brankas } from '@/aksara/Brankas';

export const usePenjaga = () => {
    const isVaultLocked = usePundi(s => s.isVaultLocked);
    const setVaultLocked = usePundi(s => s.setVaultLocked);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !isVaultLocked) {
                // Auto-lock when tab is hidden (Optional: could add a delay)
                // For high security, we lock immediately or after 1 min
                const lockTimeout = setTimeout(() => {
                    Brankas.clearKey();
                    setVaultLocked(true);
                }, 60000); // 1 minute delay

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
    }, [isVaultLocked, setVaultLocked]);
};
