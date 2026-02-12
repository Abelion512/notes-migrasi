'use client';

import { useEffect } from 'react';
import { usePundi } from '@/aksara/Pundi';
import { Brankas } from '@/aksara/Brankas';

export const usePenyelaras = () => {
    const isVaultLocked = usePundi(s => s.isVaultLocked);
    const setVaultLocked = usePundi(s => s.setVaultLocked);

    useEffect(() => {
        const channel = new BroadcastChannel('abelion-vault-sync');

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'VAULT_LOCK_STATUS') {
                const newStatus = event.data.locked;
                if (newStatus !== isVaultLocked) {
                    if (newStatus) {
                        Brankas.clearKey();
                    }
                    setVaultLocked(newStatus);
                }
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [isVaultLocked, setVaultLocked]);

    // Kita panggil ini saat status berubah di tab ini
    useEffect(() => {
        const channel = new BroadcastChannel('abelion-vault-sync');
        channel.postMessage({ type: 'VAULT_LOCK_STATUS', locked: isVaultLocked });
        channel.close();
    }, [isVaultLocked]);
};
