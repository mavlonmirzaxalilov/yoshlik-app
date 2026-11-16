"use client";

import { useEffect } from "react";
import { telegramWebApp } from "@/lib/api";

// Telegram ichida ochilganda: Mini App tayyorligini bildiradi va to'liq ekranga yoyiladi.
export default function TelegramInit() {
  useEffect(() => {
    const wa = telegramWebApp();
    if (!wa) return;
    wa.ready();
    wa.expand();
  }, []);
  return null;
}
