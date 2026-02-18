'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { haptic } from '@lembaran/core/Indera';

export const ThemeToggle = () => {
    const { settings, updateSettings } = usePundi();

    const toggleTheme = (e: React.MouseEvent) => {
        // Set coordinates for circular animation
        const x = e.clientX;
        const y = e.clientY;
        document.documentElement.style.setProperty('--click-x', `${x}px`);
        document.documentElement.style.setProperty('--click-y', `${y}px`);

        const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        updateSettings({ theme: nextTheme });
        haptic.light();
    };

    const Icon = settings.theme === 'light' ? Sun : settings.theme === 'dark' ? Moon : Laptop;

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[var(--surface)] border border-[var(--separator)]/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 shadow-sm"
            title={`Mode: ${settings.theme}`}
        >
            <Icon size={18} />
        </button>
    );
};
