'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MAP_LAYANAN, getIconForService } from '@/komponen/IkonLayanan';
import { motion } from 'framer-motion';

interface SaranLayananProps {
    input: string;
    onSelect: (name: string, domain: string) => void;
}

export const SaranLayanan = ({ input, onSelect }: SaranLayananProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const query = input ? input.toLowerCase().trim() : '';

    // Global filter: find matches by key or domain
    const matches = useMemo(() => {
        if (!query) return [];
        return Object.entries(MAP_LAYANAN)
            .filter(([key, domain]) => {
                return key.startsWith(query) ||
                       key.includes(query) ||
                       domain.includes(query);
            })
            .sort((a, b) => {
                // Priority 1: Exact key match
                if (a[0] === query) return -1;
                if (b[0] === query) return 1;

                // Priority 2: Starts with query
                const aStarts = a[0].startsWith(query);
                const bStarts = b[0].startsWith(query);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                return a[0].localeCompare(b[0]);
            })
            .slice(0, 8);
    }, [query]);

    // Reset index when query changes to avoid setState warning
    const [prevQuery, setPrevQuery] = useState(query);
    if (query !== prevQuery) {
        setSelectedIndex(0);
        setPrevQuery(query);
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (matches.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % matches.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + matches.length) % matches.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const [key, domain] = matches[selectedIndex];
                onSelect(key, domain);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [matches, selectedIndex, onSelect]);

    if (matches.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-[60] mt-1 glass-card !bg-opacity-100 overflow-hidden shadow-2xl border border-blue-500/30"
            style={{ backgroundColor: 'var(--surface)' }}
        >
            <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
                <div className="px-3 py-1.5 border-b border-[var(--separator)]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50">Saran Layanan</span>
                </div>
                {matches.map(([key, domain], index) => (
                    <button
                        key={key}
                        onClick={() => onSelect(key, domain)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-blue-500/20 ${index === selectedIndex ? 'bg-blue-500/15 border-l-4 border-blue-500' : 'hover:bg-blue-500/10'}`}
                    >
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {getIconForService(key, 20)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold capitalize text-[var(--text-primary)] truncate">{key}</span>
                            <span className="text-[10px] opacity-40 truncate">{domain}</span>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
