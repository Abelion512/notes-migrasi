import { PenyamarIdentitas } from "@/komponen/bersama/PenyamarIdentitas";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/gaya/Utama.css";
import { PengaturSuasana } from "@/komponen/bersama/PengaturSuasana";
import { PenyaringRute } from "@/komponen/bersama/PenyaringRute";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Lembaran",
    description: "Secure, Local-First, Premium Notes App",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Lembaran",
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
        <html lang="id" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-black overflow-x-hidden`}>
                <main className="min-h-screen w-full flex">
                    <PenyamarIdentitas />
                    <PengaturSuasana />
                    <PenyaringRute>
                        {children}
                    </PenyaringRute>
                </main>
            </body>
        </html>
    );
}
