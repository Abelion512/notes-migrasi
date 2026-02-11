import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/gaya/Utama.css";
import { KemudiBawah } from "@/komponen/bersama/KemudiBawah";
import { PintuBrankas } from "@/komponen/fitur/Brankas/PintuBrankas";
import { PeralihanLembar } from "@/komponen/bersama/PeralihanLembar";
import { PengaturSuasana } from "@/komponen/bersama/PengaturSuasana";
import { PaletPerintah } from "@/komponen/bersama/PaletPerintah";

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
    maximumScale: 5,
    userScalable: true,
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
                    <PengaturSuasana /><PintuBrankas>
                        <PaletPerintah />
                        <PeralihanLembar>
                            {children}
                        </PeralihanLembar>
                        <KemudiBawah />
                    </PintuBrankas>
                </main>
            </body>
        </html>
    );
}
