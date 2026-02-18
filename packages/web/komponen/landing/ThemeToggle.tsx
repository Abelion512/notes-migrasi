'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { haptic } from '@lembaran/core/Indera';

export const ThemeToggle = () => {
    const { settings, updateSettings } = usePundi();

    const toggleTheme = () => {
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
            className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
            title={`Mode: ${settings.theme}`}
        >
            <Icon size={20} />
        </button>
    );
};
