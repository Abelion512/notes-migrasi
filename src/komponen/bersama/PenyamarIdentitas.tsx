'use client';

import { useEffect } from 'react';
import { usePundi } from '@/aksara/Pundi';

export const PenyamarIdentitas = () => {
    const secretMode = usePundi(s => s.settings.secretMode);
    const isLocked = usePundi(s => s.isVaultLocked);

    useEffect(() => {
        const originalTitle = document.title;
        const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        const originalFavicon = favicon ? favicon.href : "";

        if (isLocked && secretMode === "gmail") {
            document.title = "Gmail - Inbox (1)";
            if (favicon) {
                favicon.href = "https://ssl.gstatic.com/ui/v1/icons/mail/images/2/favicon.ico";
            }
        } else {
            document.title = "Abelion Notes";
            if (favicon && originalFavicon) {
                favicon.href = "/favicon.ico";
            }
        }

        return () => {
            document.title = originalTitle;
            if (favicon && originalFavicon) {
                favicon.href = originalFavicon;
            }
        };
    }, [isLocked, secretMode]);

    return null;
};
