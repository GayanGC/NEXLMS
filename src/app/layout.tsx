import type { Metadata } from "next";
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
  title: "NexLMS – The Complete Hybrid Engine for Sri Lanka's Tuition Classes",
  description:
    "NexLMS powers Sri Lanka's top A/L tuition classes and institutes with bulletproof anti-piracy video, QR attendance, automated billing, and hybrid live streaming.",
  keywords: [
    "LMS Sri Lanka",
    "Tuition class software",
    "Hybrid tuition platform",
    "Online class management",
    "A/L tuition LMS",
    "NexLMS",
  ],
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
