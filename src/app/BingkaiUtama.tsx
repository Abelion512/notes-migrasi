'use client';

import React from "react";
import KemudiBawah from "@/komponen/KemudiBawah";
import { useAbelionStore } from "@/aksara/Pundi";

interface BingkaiUtamaProps {
  children: React.ReactNode;
}

export default function BingkaiUtama({ children }: BingkaiUtamaProps) {
  const { pengaturan } = useAbelionStore();
  const gaya = pengaturan.gaya || 'ios';

  return (
    <div className={`app-container gaya-${gaya}`}>
      <main className="pb-24">
        {children}
      </main>
      <KemudiBawah />

      {/* Infrastructure for Nusantara sound/background can be added here */}
      {gaya === 'nusantara' && (
        <div className="nusantara-overlay pointer-events-none fixed inset-0 z-[-1] opacity-20">
          {/* Example: Batik pattern or specific background */}
        </div>
      )}
    </div>
  );
}
