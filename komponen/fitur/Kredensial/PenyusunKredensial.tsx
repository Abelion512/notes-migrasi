'use client';

import React, { useState } from 'react';
import {
    User, Lock, Link as LinkIcon, Eye, EyeOff, Copy, Check, Sparkles, Wand2, RefreshCw, Settings2
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

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
    const [showPassGen, setShowPassGen] = useState(false);
    const [genLength, setGenLength] = useState(16);

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

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        const randomValues = new Uint32Array(genLength);
        window.crypto.getRandomValues(randomValues);
        let result = "";
        for (let i = 0; i < genLength; i++) {
            result += chars.charAt(randomValues[i] % chars.length);
        }
        updateField('password', result);
        setShowPassword(true);
        haptic.medium();
    };

    const handleSmartPaste = async () => {
        setIsPasting(true);
        haptic.medium();
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            const newData: KredensialData = { ...data };

            const userMatch = text.match(/(?:username|user|email|id|pengguna):\s*([^\n\r,]+)/i);
            const passMatch = text.match(/(?:password|pass|sandi|pwd):\s*([^\n\r,]+)/i);
            const urlMatch = text.match(/(?:url|link|site|tautan):\s*([^\n\r\s,]+)/i);

            if (userMatch) newData.username = userMatch[1].trim();
            if (passMatch) newData.password = passMatch[1].trim();
            if (urlMatch) newData.url = urlMatch[1].trim();

            if (!userMatch && !passMatch) {
                if (text.includes(':') && !text.includes('://') && text.split(':').length === 2) {
                    const [u, p] = text.split(':');
                    newData.username = u.trim();
                    newData.password = p.trim();
                } else if (text.includes('\n')) {
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length >= 2) {
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
            }

            if (!newData.url && (text.startsWith('http') || (text.includes('.') && !text.includes(' ')))) {
                newData.url = text.trim();
            }
            if (!newData.username && text.includes('@') && !text.includes(' ')) {
                newData.username = text.trim();
            }

            onChange(newData);
            haptic.success();
        } catch (err) {
            console.error('Smart Paste failed', err);
        } finally {
            setTimeout(() => setIsPasting(false), 500);
        }
    };

    const inputClass = "flex-1 bg-transparent border-none focus:outline-none text-[13px] sm:text-[14px] py-1 placeholder:opacity-30 min-w-0";

    return (
        <div className="space-y-2 mb-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50 flex items-center gap-1.5">
                    <Sparkles size={10} /> Kredensial
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPassGen(!showPassGen)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${showPassGen ? 'bg-blue-500 text-white border-blue-500' : 'border-blue-500/20 text-blue-500 hover:bg-blue-500/5'} transition-all`}
                    >
                        <Settings2 size={10} />
                        Pembangkit
                    </button>
                    <button
                        onClick={handleSmartPaste}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-500/20 text-blue-500 hover:bg-blue-500/5 transition-all ${isPasting ? 'animate-pulse' : ''}`}
                    >
                        <Wand2 size={10} />
                        Tempel Pintar
                    </button>
                </div>
            </div>

            {showPassGen && (
                <div className="mx-1 p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[9px] font-black uppercase text-blue-500/60">Panjang Sandi: {genLength}</span>
                        <input
                            type="range" min="8" max="32" value={genLength}
                            onChange={(e) => setGenLength(parseInt(e.target.value))}
                            className="w-full h-1 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <button
                        onClick={generatePassword}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center gap-2"
                    >
                        <RefreshCw size={12} /> Acak
                    </button>
                </div>
            )}

            <div className="ios-list-group border border-[var(--separator)]/20 shadow-sm overflow-hidden w-full mb-0">
                <div className="flex items-center px-3 gap-2 sm:gap-3 group">
                    <User size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity flex-shrink-0" />
                    <input
                        type="text"
                        value={data.username || ''}
                        onChange={(e) => updateField('username', e.target.value)}
                        placeholder="Nama Pengguna / Email"
                        className={inputClass}
                    />
                    <button
                        onClick={() => handleCopy(data.username, 'user')}
                        className="p-1.5 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500 flex-shrink-0"
                    >
                        {copiedField === 'user' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
                <div className="ios-separator"></div>

                <div className="flex items-center px-3 gap-2 sm:gap-3 group">
                    <Lock size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity flex-shrink-0" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={data.password || ''}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Kata Sandi"
                        className={inputClass}
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => { setShowPassword(!showPassword); haptic.light(); }}
                            className="p-1.5 opacity-20 hover:opacity-100 transition-opacity"
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                            onClick={() => handleCopy(data.password, 'pass')}
                            className="p-1.5 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500"
                        >
                            {copiedField === 'pass' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
                <div className="ios-separator"></div>

                <div className="flex items-center px-3 gap-2 sm:gap-3 group">
                    <LinkIcon size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity flex-shrink-0" />
                    <input
                        type="text"
                        value={data.url || ''}
                        onChange={(e) => updateField('url', e.target.value)}
                        placeholder="URL Layanan / Tautan"
                        className={inputClass}
                    />
                    <button
                        onClick={() => handleCopy(data.url, 'url')}
                        className="p-1.5 opacity-20 hover:opacity-100 active:opacity-40 transition-opacity text-blue-500 flex-shrink-0"
                    >
                        {copiedField === 'url' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
