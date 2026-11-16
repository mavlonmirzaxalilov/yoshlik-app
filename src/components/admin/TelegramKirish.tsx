"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";

type Sorov = { id: string; sir: string; havola: string; qr: string };
type Holat = "YUKLANMOQDA" | "KUTISH" | "BOTDA" | "MUDDAT" | "EMAS" | "XATO";

const SORASH_MS = 2_000;

// Kompyuterda bot orqali kirish: sahifa so'rov ochadi, xodim Telegram'da botni ochib (tugma yoki QR)
// raqamini ulashadi va "Kirishni tasdiqlash"ni bosadi. Sahifa har 2 soniyada so'raydi va o'zi kiradi.
export default function TelegramKirish() {
  const router = useRouter();
  const [sorov, setSorov] = useState<Sorov | null>(null);
  const [holat, setHolat] = useState<Holat>("YUKLANMOQDA");
  const yangi = useCallback(async () => {
    setHolat("YUKLANMOQDA");
    setSorov(null);
    try {
      const javob = await fetch("/api/auth/bot-kirish", { method: "POST" });
      if (!javob.ok) throw new Error();
      const d = await javob.json();
      const qr = await QRCode.toDataURL(d.havola, { margin: 1, width: 220, color: { dark: "#1e2a4a" } });
      setSorov({ id: d.id, sir: d.sir, havola: d.havola, qr });
      setHolat("KUTISH");
    } catch {
      setHolat("XATO");
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(yangi);
  }, [yangi]);

  // Holatni so'rab turamiz (yakuniy holatgacha)
  useEffect(() => {
    if (!sorov) return;
    let toxtadi = false;
    let band = false;
    const taymer = setInterval(async () => {
      if (band || toxtadi) return;
      band = true;
      try {
        const javob = await fetch("/api/auth/bot-kirish/holat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sorov.id, sir: sorov.sir }),
        });
        if (toxtadi) return;
        if (javob.status === 404) {
          toxtadi = true;
          return setHolat("MUDDAT");
        }
        if (!javob.ok) return; // vaqtinchalik xato — keyingi safar
        const d = await javob.json();
        if (d.holat === "KIRDI") {
          toxtadi = true;
          return router.replace(d.rol === "KASSIR" ? "/admin/kassa" : "/admin");
        }
        if (d.holat === "MUDDAT" || d.holat === "EMAS") toxtadi = true;
        setHolat(d.holat);
      } catch {
        // tarmoq uzilishi — keyingi urinishda qayta so'raymiz
      } finally {
        band = false;
        if (toxtadi) clearInterval(taymer);
      }
    }, SORASH_MS);
    return () => {
      toxtadi = true;
      clearInterval(taymer);
    };
  }, [sorov, router]);

  return (
    <div className="mt-6 space-y-4">
      {holat === "YUKLANMOQDA" && <p className="text-sm text-stone-500">Yuklanmoqda...</p>}

      {sorov && (holat === "KUTISH" || holat === "BOTDA") && (
        <>
          <a
            href={sorov.havola}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 font-semibold text-white hover:opacity-90"
          >
            <TelegramBelgi /> Telegram bot orqali kirish
          </a>

          <div className="rounded-2xl border border-stone-200 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, optimallashtirish kerak emas */}
            <img src={sorov.qr} alt="Botga kirish QR kodi" width={180} height={180} className="mx-auto" />
            <p className="mt-2 text-xs text-stone-500">yoki telefon kamerasi bilan skanerlang</p>
          </div>

          <ol className="space-y-1 rounded-2xl bg-faol-och p-4 text-left text-sm text-panel">
            <li>
              <b>1.</b> Botda <b>Start</b>ni bosing
            </li>
            <li>
              <b>2.</b> So&apos;ralsa, <b>📱 Raqamni ulashish</b>
            </li>
            <li>
              <b>3.</b> <b>✅ Kirishni tasdiqlash</b> tugmasini bosing
            </li>
          </ol>

          <p className="flex items-center justify-center gap-2 text-sm text-stone-500">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-faol border-t-transparent" />
            {holat === "BOTDA" ? "Botda tasdiqlanishi kutilmoqda..." : "Botda kirish kutilmoqda..."}
          </p>
        </>
      )}

      {holat === "EMAS" && (
        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-lg font-bold text-red-700">⛔️ Siz admin emassiz</p>
          <p className="mt-1 text-sm text-red-700">
            Telefon raqamingiz xodimlar ro&apos;yxatida yo&apos;q. Kafe administratoriga murojaat qiling.
          </p>
          <button onClick={yangi} className="mt-3 text-sm font-medium text-faol">
            Boshqa akkaunt bilan kirish
          </button>
        </div>
      )}

      {(holat === "MUDDAT" || holat === "XATO") && (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            {holat === "MUDDAT" ? "Kirish havolasining muddati tugadi." : "Kirish so'rovini ochib bo'lmadi."}
          </p>
          <button onClick={yangi} className="w-full rounded-xl bg-faol py-3 font-semibold text-white">
            Qaytadan urinish
          </button>
        </div>
      )}

      {process.env.NODE_ENV !== "production" && (
        <Link href="/kirish?qaytish=/admin" className="block text-sm font-medium text-faol">
          Lokal test: telefon + kod orqali kirish
        </Link>
      )}
    </div>
  );
}

function TelegramBelgi() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M21.94 4.3 18.7 19.58c-.24 1.08-.88 1.34-1.78.84l-4.93-3.63-2.38 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.14-8.26c.4-.35-.09-.55-.62-.2L6.2 13.2l-4.86-1.52c-1.06-.33-1.08-1.06.22-1.57L20.55 2.8c.88-.32 1.65.21 1.39 1.5Z" />
    </svg>
  );
}
