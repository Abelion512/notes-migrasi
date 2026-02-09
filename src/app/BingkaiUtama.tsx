'use client';

import React, { useEffect, useState } from "react";
import KemudiBawah from "@/komponen/KemudiBawah";
import SidebarUtama from "@/komponen/SidebarUtama";
import Komandan from "@/komponen/Komandan";
import { useAbelionStore } from "@/aksara/Pundi";
import { migrasiLocalStorageKeIndexedDB } from "@/aksara/migrasi";

interface BingkaiUtamaProps {
  children: React.ReactNode;
}

export default function BingkaiUtama({ children }: BingkaiUtamaProps) {
  const { pengaturan } = useAbelionStore();
  const gaya = pengaturan.gaya || 'ios';
  const tinted = pengaturan.tintedMode ? 'true' : 'false';
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', pengaturan.tema || 'system');
    document.documentElement.setAttribute('data-tinted', tinted);
  }, [pengaturan.tema, tinted]);

  useEffect(() => {
    // Jalankan migrasi dari localStorage ke IndexedDB jika perlu
    migrasiLocalStorageKeIndexedDB().then((migrated) => {
      if (migrated) {
        window.location.reload();
      }
    });
  }, []);

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
    <div className={`app-container gaya-${gaya} min-h-screen`} data-tinted={tinted}>
      <div id="reading-progress" style={{ width: `${scrollProgress}%` }} />

      <SidebarUtama />
      <Komandan />

      <main className="main-layout relative">
        <div className="mx-auto max-w-[800px] pb-32">
          {children}
        </div>

        {/* Only show bottom nav on mobile */}
        <div className="md:hidden">
          <KemudiBawah />
        </div>
      </main>

      {gaya === 'nusantara' && (
        <div className="nusantara-overlay pointer-events-none fixed inset-0 z-[-1] opacity-20">
          {/* Aset Nusantara seperti Batik bisa ditambahkan di sini */}
        </div>
      )}
    </div>
  );
}
