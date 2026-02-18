'use client';

import { useEffect, useRef } from 'react';
import { usePundi } from '@lembaran/core/Pundi';

export const PengaturSuasana = () => {
    const themeSetting = usePundi(state => state.settings.theme);
    const lastTheme = useRef(themeSetting);

    useEffect(() => {
        const applyTheme = () => {
            let theme = themeSetting;

            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const transitionTheme = () => {
                document.documentElement.setAttribute('data-theme', theme);
                lastTheme.current = themeSetting;
            };

            // Sentinel: Circular Theme Transition Animation
            // Using View Transitions API if available
            if (
                typeof document !== 'undefined' &&
                (document as any).startViewTransition &&
                lastTheme.current !== themeSetting
            ) {
                (document as any).startViewTransition(() => {
                    transitionTheme();
                });
            } else {
                transitionTheme();
            }
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
