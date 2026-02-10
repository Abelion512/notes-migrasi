import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { BottomNav } from "@/komponen/bersama/BottomNav";
import { VaultGate } from "@/komponen/fitur/vault/VaultGate";
import { PageTransition } from "@/komponen/bersama/PageTransition";
import { ThemeManager } from "@/komponen/bersama/ThemeManager";
import { CommandPalette } from "@/komponen/bersama/CommandPalette";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Abelion Notes",
    description: "Secure, Local-First, Premium Notes App",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Abelion",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body className={`${inter.variable} font-sans`}>
                <main className="relative min-h-screen flex flex-col bg-[var(--background)]">
                    <VaultGate>
                        <CommandPalette />
                        <PageTransition>
                            {children}
                        </PageTransition>
                        <BottomNav />
                    </VaultGate>
                </main>
            </body>
        </html>
    );
}
