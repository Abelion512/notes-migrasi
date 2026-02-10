'use client';

import React, { useState, useEffect } from 'react';
import { useAbelionStore } from '@/lib/hooks/useAbelionStore';
import { Brankas } from '@/lib/storage/brankas';
import { VaultRepository } from '@/lib/storage/VaultRepository';
import { Lock, Unlock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const VaultLockScreen = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const { setVaultLocked } = useAbelionStore();

    useEffect(() => {
        const checkVaultStatus = async () => {
            try {
                const initialized = await VaultRepository.isVaultInitialized();
                setIsSetupMode(!initialized);
            } catch (e) {
                console.error('Failed to check vault status', e);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkVaultStatus();
    }, []);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setError(false);

        try {
            if (isSetupMode) {
                if (password !== confirmPassword) {
                    setError(true);
                    setIsLoading(false);
                    return; // Should show specific error message for mismatch
                }
                await VaultRepository.setupVault(password);
                setVaultLocked(false);
            } else {
                const isValid = await VaultRepository.unlockVault(password);
                if (isValid) {
                    setVaultLocked(false);
                } else {
                    setError(true);
                }
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="fixed inset-0 z-[100] bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 relative"
            >
                <div className="w-24 h-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4 mx-auto ring-4 ring-[var(--primary)]/5">
                    {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Unlock size={40} />
                        </motion.div>
                    ) : (
                        isSetupMode ? <KeyRound size={40} /> : <Lock size={40} />
                    )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    {isSetupMode ? 'Buat Kunci Vault' : 'Abelion Vault'}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">
                    {isSetupMode
                        ? 'Tetapkan kata sandi utama untuk mengamankan arsip Anda.'
                        : 'Arsip Anda terlindungi secara end-to-end dengan enkripsi AES-GCM 256-bit.'}
                </p>
            </motion.div>

            <motion.form
                onSubmit={handleUnlock}
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="w-full max-w-xs relative flex flex-col gap-3"
            >
                <div className="relative">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSetupMode ? "Kata Sandi Baru" : "Masukkan Kata Sandi Utama"}
                        className="w-full px-5 py-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none shadow-sm text-center tracking-widest text-lg"
                        autoFocus
                    />
                    {/* Show unlock button only if not setup mode (or make it handle both, but layout is cleaner if button is below for setup) */}
                    {!isSetupMode && (
                        <button
                            type="submit"
                            disabled={!password || isLoading}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-[var(--primary)] text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>

                {isSetupMode && (
                    <div className="relative animate-in fade-in slide-in-from-top-2">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Konfirmasi Kata Sandi"
                            className={`w-full px-5 py-4 rounded-xl bg-[var(--glass-bg)] border focus:ring-2 focus:outline-none shadow-sm text-center tracking-widest text-lg ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--glass-border)] focus:ring-[var(--primary)]'}`}
                        />
                        <button
                            type="submit"
                            disabled={!password || !confirmPassword || isLoading}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-[var(--primary)] text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </motion.form>

            {error && isSetupMode && (
                <p className="text-red-500 text-xs mt-2">Kata sandi tidak cocok.</p>
            )}

            <div className="mt-12 flex items-center gap-2 text-[var(--text-secondary)] opacity-60 text-xs">
                <ShieldCheck size={14} />
                <span>Zero-Knowledge Architecture</span>
            </div>
        </div>
    );
};
