import type { Metadata } from "next";
import "./globals.css";
import BingkaiUtama from "./BingkaiUtama";
import IntroAnim from "@/komponen/IntroAnim";

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
        <IntroAnim />
        <BingkaiUtama>{children}</BingkaiUtama>
      </body>
    </html>
  );
}
