"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type WidgetUser = Record<string, string | number>;

// Telegram Login Widget. Ishlashi uchun BotFather'da /setdomain -> sayt domeni o'rnatilgan bo'lishi kerak.
export default function TelegramKirish() {
  const router = useRouter();
  const params = useSearchParams();
  const quti = useRef<HTMLDivElement>(null);
  const [xato, setXato] = useState<string | null>(
    params.get("xato") === "xodim-emas" ? "Bu akkaunt xodimlar ro'yxatida yo'q" : null,
  );
  const [bot, setBot] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sozlamalar")
      .then((r) => r.json())
      .then((d) => setBot(d.bot));
  }, []);

  useEffect(() => {
    if (!bot || !quti.current) return;
    (window as unknown as { yoshlikTelegramKirish: (u: WidgetUser) => void }).yoshlikTelegramKirish = async (u) => {
      setXato(null);
      const javob = await fetch("/api/auth/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
      const data = await javob.json();
      if (!javob.ok) return setXato(data.xato ?? "Kirib bo'lmadi");
      router.replace(data.rol === "KASSIR" ? "/admin/kassa" : "/admin");
    };
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", bot);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "12");
    s.setAttribute("data-onauth", "yoshlikTelegramKirish(user)");
    s.setAttribute("data-request-access", "write");
    const el = quti.current;
    el.innerHTML = "";
    el.appendChild(s);
    return () => {
      el.innerHTML = "";
    };
  }, [bot, router]);

  return (
    <div className="mt-6 space-y-4">
      <div ref={quti} className="flex min-h-12 justify-center" />
      {xato && <p className="text-sm text-qizil">{xato}</p>}
      <p className="text-xs text-stone-500">
        Birinchi marta: botda /start bosib, telefon raqamingizni ulashing. Raqamingiz xodimlar ro&apos;yxatida
        bo&apos;lishi kerak.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <Link href="/kirish?qaytish=/admin" className="block text-sm font-medium text-faol">
          Lokal test: telefon + kod orqali kirish
        </Link>
      )}
    </div>
  );
}
