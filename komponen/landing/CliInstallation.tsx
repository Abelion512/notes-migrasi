'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

const COMMANDS = {
    curl: 'curl -fsSL https://lembaran.ai/install.sh | sh',
    npm: 'npm install -g lembaran',
    bun: 'bun add -g lembaran',
    brew: 'brew install lembaran512/tap/lembaran',
    paru: 'paru -S lembaran-bin'
};

export const CliInstallation = () => {
    const [activeTab, setActiveTab] = useState<keyof typeof COMMANDS>('curl');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Smart auto-detection
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('mac')) {
                setActiveTab('brew');
            } else if (ua.includes('linux')) {
                // Check if likely Arch (paru) or generic (curl)
                // For now just stick to curl as safest default, but could be smarter
                setActiveTab('curl');
            }
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(COMMANDS[activeTab]);
        setCopied(true);
        haptic.success();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 px-4">
            <div className="glass-card overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md">
                <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                    {Object.keys(COMMANDS).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as any); haptic.light(); }}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
                                />
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-8 relative group">
                    <div className="flex items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-sm sm:text-base overflow-x-auto no-scrollbar">
                        <Terminal size={18} className="text-blue-500 shrink-0" />
                        <span className="text-gray-200 whitespace-nowrap">{COMMANDS[activeTab]}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="absolute right-12 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>
                </div>
            </div>
            <p className="mt-4 text-gray-500 text-xs font-medium uppercase tracking-[0.2em]">
                Kompatibel dengan macOS, Linux, dan Windows (WSL)
            </p>
        </div>
    );
};
