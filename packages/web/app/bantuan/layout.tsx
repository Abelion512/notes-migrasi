import React from 'react';
import { SidebarBantuan } from '@/komponen/bersama/SidebarBantuan';

export default function DocLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full min-h-screen bg-[var(--background)]">
            <SidebarBantuan />
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}
