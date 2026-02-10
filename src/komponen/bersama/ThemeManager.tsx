'use client';

import { useEffect } from 'react';
import { usePundi } from '@/aksara/Pundi';

export const ThemeManager = () => {
    const { settings } = usePundi();

    useEffect(() => {
        const applyTheme = () => {
            let theme = settings.theme;

            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            document.documentElement.setAttribute('data-theme', theme);
        };

        applyTheme();

        // Listen for system changes if set to auto
        if (settings.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => applyTheme();
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [settings.theme]);

    return null;
};
