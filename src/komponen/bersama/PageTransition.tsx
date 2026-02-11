'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React from 'react';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.02, x: -20 }}
                transition={{
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1],
                    opacity: { duration: 0.2 }
                }}
                className="page-transition-wrapper"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
