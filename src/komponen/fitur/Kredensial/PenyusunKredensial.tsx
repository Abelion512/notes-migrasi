'use client';

import React, { useState } from 'react';
import {
    User, Lock, Link as LinkIcon, Eye, EyeOff, Copy, Check
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

    const updateField = (field: keyof KredensialData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handleCopy = (text: string | undefined, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        haptic.success();

        // Security: Clear clipboard after 30 seconds
        setTimeout(() => {
            navigator.clipboard.writeText("");
            setCopiedField(null);
            console.log('[Security] Clipboard auto-cleared');
        }, 30000);

        setTimeout(() => setCopiedField(null), 2000);
    };

    const inputClass = "w-full bg-transparent border-none focus:outline-none text-[15px] py-2 placeholder:opacity-30";

    return (
        <div className="ios-list-group border border-[var(--separator)]/20 shadow-sm overflow-hidden mb-6">
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
    );
};
