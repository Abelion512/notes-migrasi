'use client';

import { useEffect, useRef } from 'react';
import { usePundi } from '@lembaran/core/Pundi';

export const PengaturSuasana = () => {
    const themeSetting = usePundi(state => state.settings.theme);
    const prevTheme = useRef(themeSetting);

    useEffect(() => {
        const applyTheme = () => {
            let theme = themeSetting;

            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const doc = document.documentElement;

            if (prevTheme.current !== themeSetting) {
                doc.classList.add('theme-transitioning');
                setTimeout(() => doc.classList.remove('theme-transitioning'), 400);
            }

            doc.setAttribute('data-theme', theme);
            prevTheme.current = themeSetting;
        };

        applyTheme();

        if (themeSetting === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => applyTheme();
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [themeSetting]);

    return null;
};
