'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroAnim() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const introKey = 'abelion-last-intro-timestamp';
    const lastIntro = localStorage.getItem(introKey);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (sessionStorage.getItem('skipIntro') || (lastIntro && (now - parseInt(lastIntro)) < oneHour)) {
      Promise.resolve().then(() => setIsVisible(false));
      return;
    }

    localStorage.setItem(introKey, now.toString());

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 25 + 15);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('skipIntro', '1');
          }, 400);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="intro-anim"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 bg-[var(--page-bg)] z-[9999] flex items-center justify-center"
        >
          <div className="progress-circle w-[120px] h-[120px] rounded-full bg-[var(--frosted)] backdrop-blur-[20px] border border-[var(--glass-outline)] flex items-center justify-center shadow-[var(--shadow-soft)] relative">
            <span id="progress-text" className="text-[18px] font-bold color-[var(--primary)]">{progress}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
