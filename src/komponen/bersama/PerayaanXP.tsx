'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    targetX: number;
    duration: number;
}

export const PerayaanXP = ({ active }: { active: boolean }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (active) {
            const newParticles = Array.from({ length: 40 }).map((_, i) => {
                const x = Math.random() * 100;
                return {
                    id: i,
                    x,
                    y: Math.random() * 100,
                    color: ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759'][Math.floor(Math.random() * 5)],
                    targetX: x + (Math.random() * 20 - 10),
                    duration: 2 + Math.random()
                };
            });
            setTimeout(() => setParticles(newParticles), 0);
            const timer = setTimeout(() => setParticles([]), 3000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, y: '100vh', x: `${p.x}vw`, scale: 1 }}
                        animate={{
                            opacity: 0,
                            y: '-10vh',
                            x: `${p.targetX}vw`,
                            rotate: 360,
                            scale: 0.5
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: p.duration, ease: "easeOut" }}
                        className="absolute w-2 h-2 rounded-full shadow-lg"
                        style={{ backgroundColor: p.color }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
