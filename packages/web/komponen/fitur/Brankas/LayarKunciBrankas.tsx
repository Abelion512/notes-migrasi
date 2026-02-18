'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, ArrowRight, ShieldCheck, Copy, Check, ChevronLeft } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { generateMnemonic } from '@lembaran/core/KataSandi';
import { Arsip } from '@lembaran/core/Arsip';
import { PenyamaranGmail } from './PenyamaranGmail';

export const LayarKunciBrankas = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [paperKey, setPaperKey] = useState('');
    const [showPaperKey, setShowPaperKey] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | boolean>(false);
    const [copied, setCopied] = useState(false);

    const setVaultLocked = usePundi(s => s.setVaultLocked);
    const secretMode = usePundi(s => s.settings.secretMode);

    useEffect(() => {
        const checkVaultStatus = async () => {
            try {
                const initialized = await Arsip.isVaultInitialized();
                setIsSetupMode(!initialized);
                if (!initialized) {
                     // Secure mnemonic generation for setup
                    const words = generateMnemonic();
                    setPaperKey(words);
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
        if (password.length < 8) {
            setError("Minimal 8 karakter");
            return;
        }
        if (password !== confirmPassword) {
            setError("Kata sandi tidak cocok");
            return;
        }
        setShowPaperKey(true);
    };

    const finalizeSetup = async () => {
        setIsLoading(true);
        try {
            await Arsip.setupVault(password);
            setVaultLocked(false);
        } catch (err) {
            console.error(err);
            setError("Gagal menyiapkan brankas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlock = async (e: React.FormEvent, directPassword?: string) => {
        if (e) e.preventDefault();
        const pw = directPassword || password;
        if (!pw) return;

        setIsLoading(true);
        setError(false);

        try {
            const isValid = await Arsip.unlockVault(pw);
            if (isValid) {
                setVaultLocked(false);
            } else {
                // Sentinel: Rate limiting delay to slow down brute-force attacks
                await new Promise(resolve => setTimeout(resolve, 1000));
                setError("Kata sandi salah");
            }
        } catch (err) {
            console.error(err);
            setError("Gagal membuka brankas");
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
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (secretMode === 'gmail' && !isSetupMode) {
        return <PenyamaranGmail onUnlock={(pw) => handleUnlock({ preventDefault: () => {} } as unknown as React.FormEvent, pw)} isLoading={isLoading} error={error} />;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col p-6 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
                {!showPaperKey ? (
                    <motion.div
                        key="auth-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[var(--surface)] shadow-sm flex items-center justify-center text-[var(--primary)] mb-8">
                            {isLoading ? (
                                <Unlock size={36} className="animate-pulse" />
                            ) : (
                                isSetupMode ? <KeyRound size={36} /> : <Lock size={36} />
                            )}
                        </div>

                        <h1 className="text-3xl font-bold mb-2 tracking-tight">
                            {isSetupMode ? 'Amankan Arsip' : 'Lembaran Vault'}
                        </h1>
                        <p className="text-[var(--text-secondary)] text-[15px] mb-10 leading-snug px-4">
                            {isSetupMode
                                ? 'Tetapkan kata sandi utama untuk enkripsi Argon2id sisi klien.'
                                : 'Arsip Anda terenkripsi secara aman. Masukkan kata sandi untuk membukanya.'}
                        </p>

                        <form onSubmit={isSetupMode ? handleSetup : handleUnlock} className="w-full space-y-4">
                            <div className="ios-list-group shadow-sm">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                    placeholder={isSetupMode ? "Kata Sandi Baru" : "Kata Sandi Brankas"}
                                    className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-center text-lg font-medium placeholder:opacity-30"
                                    autoFocus
                                />
                                {isSetupMode && (
                                    <>
                                        <div className="ios-separator"></div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(false); }}
                                            placeholder="Ulangi Kata Sandi"
                                            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-center text-lg font-medium placeholder:opacity-30"
                                        />
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!password || (isSetupMode && !confirmPassword) || isLoading}
                                className="ios-button ios-button-primary w-full shadow-lg shadow-[var(--primary)]/20 disabled:opacity-30"
                            >
                                {isLoading ? 'Memproses...' : (isSetupMode ? 'Lanjutkan' : 'Buka Brankas')}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        {error && <p className="text-red-500 text-xs mt-6 font-semibold uppercase tracking-wider animate-bounce">{typeof error === "string" ? error : "Terjadi kesalahan"}</p>}

                        <div className="mt-12 flex items-center gap-2 text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-[0.2em]">
                            <ShieldCheck size={12} />
                            <span>Argon2id Secure Vault</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="paper-key"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col max-w-md mx-auto w-full pt-10"
                    >
                        <header className="flex items-center gap-2 mb-8">
                            <button onClick={() => setShowPaperKey(false)} className="text-[var(--primary)] active:opacity-40">
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-2xl font-bold tracking-tight">Kunci Kertas</h2>
                        </header>

                        <p className="text-[var(--text-secondary)] text-[15px] mb-8 leading-normal">
                            Jika Anda lupa kata sandi, 12 kata ini adalah <strong>satu-satunya</strong> cara untuk memulihkan data Anda. Simpan di tempat yang aman dan pribadi.
                        </p>

                        <div className="ios-list-group p-6 relative group mb-10 border border-[var(--separator)]/30">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                                {paperKey.split(' ').map((word, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-[var(--primary)] opacity-30 w-4">{i + 1}</span>
                                        <span className="text-[15px] font-mono font-bold tracking-tight">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 rounded-full bg-[var(--background)] active:opacity-40 transition-opacity"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[var(--text-secondary)]" />}
                            </button>
                        </div>

                        <div className="mt-auto pb-10">
                            <button onClick={finalizeSetup} className="ios-button ios-button-primary w-full shadow-lg shadow-[var(--primary)]/20">
                                Saya Sudah Menyimpannya
                            </button>
                            <p className="text-center text-[11px] text-[var(--text-muted)] mt-4 font-medium uppercase tracking-widest">
                                Konfirmasi Penyimpanan Rahasia
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
