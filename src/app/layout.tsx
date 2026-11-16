import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import PastkiMenyu from "@/components/PastkiMenyu";
import { SavatchaProvider } from "@/components/SavatchaProvider";
import TelegramInit from "@/components/TelegramInit";

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
      // Telegram SDK <html>ga --tg-viewport-* uslublarini React'dan oldin qo'shadi
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Telegram Mini App SDK — sahifa kodidan oldin yuklanadi, initData birinchi so'rovdayoq tayyor bo'ladi */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramInit />
        <SavatchaProvider>
          {children}
          <Suspense fallback={null}>
            <PastkiMenyu />
          </Suspense>
        </SavatchaProvider>
      </body>
    </html>
  );
}
