import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/gaya/Utama.css";
import { KemudiBawah } from "@/komponen/bersama/KemudiBawah";
import { PintuBrankas } from "@/komponen/fitur/Brankas/PintuBrankas";
import { PeralihanLembar } from "@/komponen/bersama/PeralihanLembar";
import { PengaturSuasana } from "@/komponen/bersama/PengaturSuasana";
import { PaletPerintah } from "@/komponen/bersama/PaletPerintah";
import { PencarianCepat } from "@/komponen/bersama/PencarianCepat";

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
            <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-black`}>
                <div className="min-h-screen flex items-center justify-center p-0 sm:p-4">
                    <main className="popup-container flex flex-col">
                        <PengaturSuasana />
                        <PintuBrankas>
                            <PaletPerintah />
                            <PencarianCepat />
                            <PeralihanLembar>
                                {children}
                            </PeralihanLembar>
                            <KemudiBawah />
                        </PintuBrankas>
                    </main>
                </div>
            </body>
        </html>
    );
}
