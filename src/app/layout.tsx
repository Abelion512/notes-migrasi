import type { Metadata } from "next";
import "./globals.css";
import NavigasiBawah from "@/komponen/NavigasiBawah";

export const metadata: Metadata = {
  title: "Abelion Notes",
  description: "Modern, gamified note-taking web app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <main className="pb-24">
          {children}
        </main>
        <NavigasiBawah />
      </body>
    </html>
  );
}
