import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineGlobe — Discover World Cinema | One spin. One country. One movie.",
  description:
    "Spin the interactive 3D Earth, explore masterworks of global cinema originating across 50+ countries, find regional OTT streaming availability, and play Cine Quiz.",
  keywords: [
    "world cinema",
    "international movies",
    "movie recommendation",
    "3d globe",
    "cine quiz",
    "criterion",
    "foreign films",
  ],
  authors: [{ name: "CineGlobe" }],
  openGraph: {
    title: "CineGlobe — Discover World Cinema",
    description: "One spin. One country. One movie. Immersive 3D world cinema exploration.",
    url: "https://cineglobe.vercel.app",
    siteName: "CineGlobe",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070709",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070709] text-zinc-100 selection:bg-[#d4af37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
