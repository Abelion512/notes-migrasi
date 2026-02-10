'use client';

import React, { useState, useEffect } from 'react';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { Lock, Unlock, ArrowRight, ShieldCheck, KeyRound, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMnemonic } from '@/lib/utils/bip39';

export const VaultLockScreen = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [paperKey, setPaperKey] = useState('');
    const [showPaperKey, setShowPaperKey] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    const { setVaultLocked } = useAbelionStore();

    useEffect(() => {
        const checkVaultStatus = async () => {
            try {
                const initialized = await VaultRepository.isVaultInitialized();
                setIsSetupMode(!initialized);
                if (!initialized) {
                    setPaperKey(generateMnemonic());
                }
            } catch (e) {
                console.error('Failed to check vault status', e);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkVaultStatus();
    }, []);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(true);
            return;
        }
        setShowPaperKey(true);
    };

    const finalizeSetup = async () => {
        setIsLoading(true);
        try {
            await VaultRepository.setupVault(password);
            setVaultLocked(false);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setError(false);

        try {
            const isValid = await VaultRepository.unlockVault(password);
            if (isValid) {
                setVaultLocked(false);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paperKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (checkingStatus) {
        return (
            <div className="fixed inset-0 z-[100] bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary opacity-20"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center justify-center p-8 text-center">
            <AnimatePresence mode="wait">
                {!showPaperKey ? (
                    <motion.div
                        key="auth-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm flex flex-col items-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 ring-1 ring-primary/20">
                            {isLoading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <Unlock size={32} />
                                </motion.div>
                            ) : (
                                isSetupMode ? <KeyRound size={32} /> : <Lock size={32} />
                            )}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                            {isSetupMode ? 'Amankan Arsip' : 'Brankas Terkunci'}
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm mb-10 leading-relaxed px-4">
                            {isSetupMode
                                ? 'Tetapkan kata sandi utama untuk enkripsi Argon2id sisi klien.'
                                : 'Data Anda terenkripsi penuh. Masukkan kata sandi untuk mendekripsi.'}
                        </p>

                        <form onSubmit={isSetupMode ? handleSetup : handleUnlock} className="w-full space-y-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                placeholder={isSetupMode ? "Kata Sandi Baru" : "Kata Sandi Brankas"}
                                className="w-full px-6 py-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:ring-2 focus:ring-primary focus:outline-none text-center tracking-[0.3em] text-lg font-bold"
                                autoFocus
                            />

                            {isSetupMode && (
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(false); }}
                                    placeholder="Ulangi Kata Sandi"
                                    className={`w-full px-6 py-4 rounded-2xl bg-[var(--glass-bg)] border focus:ring-2 focus:outline-none text-center tracking-[0.3em] text-lg font-bold ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--glass-border)] focus:ring-primary'}`}
                                />
                            )}

                            <button
                                type="submit"
                                disabled={!password || (isSetupMode && !confirmPassword) || isLoading}
                                className="ios-button-primary mt-4 disabled:opacity-20"
                            >
                                {isLoading ? 'Memproses...' : (isSetupMode ? 'Lanjutkan' : 'Buka Brankas')}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        {error && !isSetupMode && <p className="text-red-500 text-xs mt-4 font-medium animate-pulse">Kata sandi salah.</p>}
                        {error && isSetupMode && <p className="text-red-500 text-xs mt-4 font-medium">Kata sandi tidak cocok.</p>}
                    </motion.div>
                ) : (
                    <motion.div
                        key="paper-key"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md flex flex-col items-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Simpan Kunci Kertas</h2>
                        <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
                            Jika Anda lupa kata sandi, 12 kata ini adalah <strong>satu-satunya</strong> cara untuk memulihkan data Anda. Simpan di tempat aman.
                        </p>

                        <div className="w-full p-6 bg-white dark:bg-black/40 rounded-3xl border border-[var(--glass-border)] mb-8 relative group">
                            <div className="grid grid-cols-3 gap-3">
                                {paperKey.split(' ').map((word, i) => (
                                    <div key={i} className="flex flex-col items-start">
                                        <span className="text-[8px] font-bold text-primary opacity-40 uppercase mb-0.5">{i + 1}</span>
                                        <span className="text-[13px] font-mono font-bold tracking-tight">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 rounded-xl bg-[var(--background)] active:opacity-40 transition-opacity"
                            >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>

                        <button onClick={finalizeSetup} className="ios-button-primary w-full">
                            Saya Sudah Menyimpannya
                        </button>

                        <button onClick={() => setShowPaperKey(false)} className="mt-4 text-sm font-medium text-[var(--text-secondary)] active:opacity-40">
                            Kembali
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showPaperKey && (
                <div className="mt-16 flex items-center gap-2 text-[var(--text-secondary)] opacity-30 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={12} />
                    <span>Argon2id Secure Vault</span>
                </div>
            )}
        </div>
    );
};
