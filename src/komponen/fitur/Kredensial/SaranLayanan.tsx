'use client';

import React from 'react';
import { MAP_LAYANAN, getIconForService } from '@/aksara/IkonLayanan';
import { motion, AnimatePresence } from 'framer-motion';

interface SaranLayananProps {
    input: string;
    onSelect: (name: string, domain: string) => void;
}

export const SaranLayanan = ({ input, onSelect }: SaranLayananProps) => {
    if (!input || input.length < 1) return null;

    const query = input.toLowerCase().trim();
    const matches = Object.entries(MAP_LAYANAN)
        .filter(([key]) => key.startsWith(query) || key.includes(query))
        .slice(0, 5);

    if (matches.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-[60] mt-1 glass-card overflow-hidden shadow-xl border border-blue-500/20"
        >
            <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
                {matches.map(([key, domain]) => (
                    <button
                        key={key}
                        onClick={() => onSelect(key, domain)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-500/10 text-left transition-colors active:bg-blue-500/20"
                    >
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {getIconForService(domain, 18)}
                        </div>
                        <span className="text-[14px] font-medium capitalize text-[var(--text-primary)]">{key}</span>
                        <span className="text-[10px] opacity-30 truncate ml-auto">{domain}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
