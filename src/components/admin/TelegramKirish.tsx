"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type WidgetUser = Record<string, string | number>;
type Holat = { tur: "kutish" } | { tur: "raqam" } | { tur: "emas" } | { tur: "xato"; matn: string };

const KUTISH_MS = 3_000;
const KUTISH_MAX = 100; // ~5 daqiqa

// Telegram Login Widget. BotFather'da /setdomain -> sayt domeni o'rnatilgan bo'lishi kerak.
// Raqam botda ulashilmagan bo'lsa: botga havola beriladi va sahifa o'zi qayta tekshirib turadi —
// raqam ulashilishi bilan admin sahifasi ochiladi yoki "Siz admin emassiz" chiqadi.
export default function TelegramKirish() {
  const router = useRouter();
  const params = useSearchParams();
  const quti = useRef<HTMLDivElement>(null);
  const [holat, setHolat] = useState<Holat>(
    params.get("xato") === "xodim-emas" ? { tur: "emas" } : { tur: "kutish" },
  );
  const [bot, setBot] = useState<string | null>(null);
  const oxirgi = useRef<WidgetUser | null>(null);
  const taymer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/sozlamalar")
      .then((r) => r.json())
      .then((d) => setBot(d.bot));
    return () => {
      if (taymer.current) clearTimeout(taymer.current);
    };
  }, []);

  useEffect(() => {
    if (!bot || !quti.current) return;

    const yubor = async (u: WidgetUser, urinish = 0) => {
      const javob = await fetch("/api/auth/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
      const data = await javob.json().catch(() => ({}));
      if (javob.ok) return router.replace(data.rol === "KASSIR" ? "/admin/kassa" : "/admin");
      if (data.kod === "XODIM_EMAS") return setHolat({ tur: "emas" });
      if (data.kod === "RAQAM_YOQ") {
        setHolat({ tur: "raqam" });
        // Raqam botda ulashilguncha shu ma'lumot bilan qayta tekshiramiz (imzo 1 kun amal qiladi)
        if (urinish < KUTISH_MAX) taymer.current = setTimeout(() => yubor(u, urinish + 1), KUTISH_MS);
        return;
      }
      setHolat({ tur: "xato", matn: data.xato ?? "Kirib bo'lmadi" });
    };

    (window as unknown as { yoshlikTelegramKirish: (u: WidgetUser) => void }).yoshlikTelegramKirish = (u) => {
      oxirgi.current = u;
      if (taymer.current) clearTimeout(taymer.current);
      setHolat({ tur: "kutish" });
      yubor(u);
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
      {holat.tur !== "raqam" && holat.tur !== "emas" && <div ref={quti} className="flex min-h-12 justify-center" />}

      {holat.tur === "raqam" && bot && (
        <div className="space-y-3 rounded-2xl bg-faol-och p-4 text-left">
          <p className="text-sm text-panel">
            <b>1.</b> Botni oching va <b>&quot;📱 Raqamni ulashish&quot;</b> tugmasini bosing.
          </p>
          <a
            href={`https://t.me/${bot}?start=admin`}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl bg-faol py-3 text-center font-semibold text-white"
          >
            Botda raqamni ulashish
          </a>
          <p className="flex items-center gap-2 text-sm text-panel">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-faol border-t-transparent" />
            <b>2.</b> Shu sahifa o&apos;zi tekshiryapti — raqam ulashilishi bilan kirasiz.
          </p>
        </div>
      )}

      {holat.tur === "emas" && (
        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-lg font-bold text-red-700">⛔️ Siz admin emassiz</p>
          <p className="mt-1 text-sm text-red-700">
            Telefon raqamingiz xodimlar ro&apos;yxatida yo&apos;q. Kafe administratoriga murojaat qiling.
          </p>
          <button onClick={() => setHolat({ tur: "kutish" })} className="mt-3 text-sm font-medium text-faol">
            Boshqa akkaunt bilan kirish
          </button>
        </div>
      )}

      {holat.tur === "xato" && <p className="text-sm text-qizil">{holat.matn}</p>}

      {holat.tur === "kutish" && (
        <p className="text-xs text-stone-500">Telegram orqali kiring. Raqamingiz xodimlar ro&apos;yxatida bo&apos;lishi kerak.</p>
      )}
      {process.env.NODE_ENV !== "production" && (
        <Link href="/kirish?qaytish=/admin" className="block text-sm font-medium text-faol">
          Lokal test: telefon + kod orqali kirish
        </Link>
      )}
    </div>
  );
}
