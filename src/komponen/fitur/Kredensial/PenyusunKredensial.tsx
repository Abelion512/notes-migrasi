'use client';

import React, { useState } from 'react';
import {
    User, Lock, Link as LinkIcon, Eye, EyeOff, Copy, Check, Sparkles, Wand2
} from 'lucide-react';
import { haptic } from '@/aksara/Indera';

interface KredensialData {
    username?: string;
    password?: string;
    url?: string;
}

interface PenyusunKredensialProps {
    data: KredensialData;
    onChange: (data: KredensialData) => void;
}

export const PenyusunKredensial = ({ data, onChange }: PenyusunKredensialProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isPasting, setIsPasting] = useState(false);

    const updateField = (field: keyof KredensialData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handleCopy = (text: string | undefined, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        haptic.success();

        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSmartPaste = async () => {
        setIsPasting(true);
        haptic.medium();
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            const newData: KredensialData = { ...data };

            // Basic Smart Detection
            // Pattern 1: user:pass
            if (text.includes(':') && !text.includes('://') && text.split(':').length === 2) {
                const [u, p] = text.split(':');
                newData.username = u.trim();
                newData.password = p.trim();
            }
            // Pattern 2: Multiline
            else if (text.includes('\n')) {
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length >= 2) {
                    // If first line is URL-like
                    if (lines[0].includes('.') && (lines[0].includes('http') || !lines[0].includes(' '))) {
                        newData.url = lines[0];
                        newData.username = lines[1];
                        if (lines[2]) newData.password = lines[2];
                    } else {
                        newData.username = lines[0];
                        newData.password = lines[1];
                        if (lines[2]) newData.url = lines[2];
                    }
                }
            }
            // Pattern 3: URL only
            else if (text.startsWith('http') || (text.includes('.') && !text.includes(' '))) {
                newData.url = text;
            }
            // Pattern 4: Email only
            else if (text.includes('@')) {
                newData.username = text;
            }

            onChange(newData);
            haptic.success();
        } catch (err) {
            console.error('Smart Paste failed', err);
        } finally {
            setTimeout(() => setIsPasting(false), 500);
        }
    };

    const inputClass = "w-full bg-transparent border-none focus:outline-none text-[15px] py-1.5 placeholder:opacity-30";

    return (
        <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50 flex items-center gap-1.5">
                    <Sparkles size={12} /> Data Kredensial
                </span>
                <button
                    onClick={handleSmartPaste}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-500/20 text-blue-500 hover:bg-blue-500/5 transition-all ${isPasting ? 'animate-pulse' : ''}`}
                >
                    <Wand2 size={12} />
                    Tempel Pintar
                </button>
            </div>

            <div className="ios-list-group border border-[var(--separator)]/20 shadow-sm overflow-hidden">
                {/* Username */}
                <div className="flex items-center px-4 gap-3 group">
                    <User size={18} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        value={data.username || ''}
                        onChange={(e) => updateField('username', e.target.value)}
                        placeholder="Nama Pengguna / Email"
                        className={inputClass}
                    />
                    <button
                        onClick={() => handleCopy(data.username, 'user')}
                        className="p-2 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500"
                    >
                        {copiedField === 'user' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
                <div className="ios-separator"></div>

                {/* Password */}
                <div className="flex items-center px-4 gap-3 group">
                    <Lock size={18} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={data.password || ''}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Kata Sandi"
                        className={inputClass}
                    />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setShowPassword(!showPassword); haptic.light(); }}
                            className="p-2 opacity-20 hover:opacity-100 transition-opacity"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => handleCopy(data.password, 'pass')}
                            className="p-2 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500"
                        >
                            {copiedField === 'pass' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
                <div className="ios-separator"></div>

                {/* URL */}
                <div className="flex items-center px-4 gap-3 group">
                    <LinkIcon size={18} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        value={data.url || ''}
                        onChange={(e) => updateField('url', e.target.value)}
                        placeholder="URL Layanan / Tautan"
                        className={inputClass}
                    />
                    <button
                        onClick={() => handleCopy(data.url, 'url')}
                        className="p-2 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500"
                    >
                        {copiedField === 'url' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
