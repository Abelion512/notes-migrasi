import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { VaultGate } from "@/components/features/vault/VaultGate";
import { PageTransition } from "@/components/shared/PageTransition";
import { ThemeManager } from "@/components/shared/ThemeManager";
import { CommandPalette } from "@/components/shared/CommandPalette";

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
