'use client';

import { useEffect } from 'react';
import { usePundi } from '@lembaran/core/Pundi';

export const PengaturSuasana = () => {
    const themeSetting = usePundi(state => state.settings.theme);

    useEffect(() => {
        const applyTheme = () => {
            let theme = themeSetting;

            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            document.documentElement.setAttribute('data-theme', theme);
        };

        applyTheme();

        // Listen for system changes if set to auto
        if (themeSetting === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => applyTheme();
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [themeSetting]);

    return null;
};
