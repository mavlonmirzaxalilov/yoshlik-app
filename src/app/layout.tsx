import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Sarlavha from "@/components/Sarlavha";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yoshlik — onlayn zakaz",
  description: "Navbatsiz zakaz: menyudan tanlang, olish vaqtini belgilang",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<div className="h-12 border-b border-stone-200 bg-white" />}>
          <Sarlavha />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
