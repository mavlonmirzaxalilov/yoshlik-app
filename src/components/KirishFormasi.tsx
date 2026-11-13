"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sessiyaOzgardi } from "@/lib/sessiyaKlient";

// Faqat ichki yo'lga qaytariladi (boshqa saytga yo'naltirishning oldini olish)
const xavfsizYol = (yol: string | null) => (yol && yol.startsWith("/") && !yol.startsWith("//") ? yol : "/");

export default function KirishFormasi() {
  const router = useRouter();
  const qaytish = xavfsizYol(useSearchParams().get("qaytish"));
  const [telefon, setTelefon] = useState("");
  const [rozilik, setRozilik] = useState(false);
  const [kod, setKod] = useState("");
  const [bosqich, setBosqich] = useState<"telefon" | "kod">("telefon");
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  const yubor = async (url: string, body: object) => {
    setBand(true);
    setXato(null);
    try {
      const javob = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await javob.json();
      if (!javob.ok) throw new Error(data.xato ?? "Xatolik yuz berdi");
      return data;
    } catch (e) {
      setXato(e instanceof Error ? e.message : "Xatolik yuz berdi");
      return null;
    } finally {
      setBand(false);
    }
  };

  const kodSora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await yubor("/api/auth/kod", { telefon, rozilik })) setBosqich("kod");
  };

  const kodTekshir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await yubor("/api/auth/tekshir", { telefon, kod })) {
      sessiyaOzgardi();
      router.push(qaytish);
    }
  };

  const maydon = "w-full rounded-lg border border-stone-300 px-3 py-2";
  const tugma =
    "w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60";

  if (bosqich === "telefon") {
    return (
      <form onSubmit={kodSora} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block font-medium">Telefon raqami</span>
          <div className="flex items-center gap-2">
            <span className="text-stone-600">+998</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="90 123 45 67"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className={maydon}
              required
            />
          </div>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={rozilik}
            onChange={(e) => setRozilik(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>Telefon raqamim va zakazlarim saqlanishiga roziman</span>
        </label>
        {xato && <p className="text-red-600">{xato}</p>}
        <button type="submit" disabled={band || !rozilik} className={tugma}>
          {band ? "Yuborilmoqda..." : "Kod yuborish"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={kodTekshir} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <p className="text-stone-700">
        Kod <strong>+998 {telefon}</strong> raqamiga yuborildi.
      </p>
      <label className="block">
        <span className="mb-1 block font-medium">Kod</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          className={`${maydon} text-center text-xl tracking-widest`}
          required
        />
      </label>
      {xato && <p className="text-red-600">{xato}</p>}
      <button type="submit" disabled={band} className={tugma}>
        {band ? "Tekshirilmoqda..." : "Kirish"}
      </button>
      <button
        type="button"
        onClick={() => {
          setBosqich("telefon");
          setKod("");
          setXato(null);
        }}
        className="w-full py-2 text-sm text-stone-600"
      >
        Raqamni o&apos;zgartirish
      </button>
    </form>
  );
}
