'use client';

import React, { useEffect, useState } from "react";
import KemudiBawah from "@/komponen/KemudiBawah";
import { useAbelionStore } from "@/aksara/Pundi";

interface BingkaiUtamaProps {
  children: React.ReactNode;
}

export default function BingkaiUtama({ children }: BingkaiUtamaProps) {
  const { pengaturan } = useAbelionStore();
  const gaya = pengaturan.gaya || 'ios';
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`app-container gaya-${gaya} min-h-screen pb-[env(safe-area-inset-bottom)]`}>
      <div id="reading-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="pb-32">
        {children}
      </main>

      <KemudiBawah />

      {gaya === 'nusantara' && (
        <div className="nusantara-overlay pointer-events-none fixed inset-0 z-[-1] opacity-20">
          {/* Aset Nusantara seperti Batik bisa ditambahkan di sini */}
        </div>
      )}
    </div>
  );
}
