'use client';

import React from 'react';
import { Search } from 'lucide-react';

export default function SearchPage() {
    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--background)] px-5 pt-14 pb-24">
            <h1 className="text-3xl font-bold mb-6">Pencarian</h1>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Cari catatan, tag, atau folder"
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--separator)]/10 backdrop-blur-md rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all placeholder:text-[var(--text-secondary)]"
                />
            </div>

            {/* Empty State / Suggestions */}
            <div className="text-center mt-20 opacity-50">
                <Search className="w-12 h-12 mx-auto mb-3 text-[var(--text-secondary)]" />
                <p className="text-sm">Ketik untuk mulai mencari memori...</p>
            </div>
        </div>
    );
}
