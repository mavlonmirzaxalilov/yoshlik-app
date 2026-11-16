"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, telegramWebApp } from "@/lib/api";
import { sessiyaOzgardi } from "@/lib/sessiyaKlient";
import { Karta, Sarlavha, Tana, maydon, tugmaAsosiy, tugmaIkkinchi } from "@/components/ui";

export default function MalumotSahifasi() {
  const router = useRouter();
  const [telefon, setTelefon] = useState<string | null>(null);
  const [ism, setIsm] = useState("");
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [telegram, setTelegram] = useState(false);

  useEffect(() => {
    api("/api/men")
      .then((r) => r.json())
      .then((d) => {
        setTelegram(Boolean(telegramWebApp()));
        if (!d.mijoz) return router.replace("/kirish?qaytish=/profil/malumot");
        setTelefon(d.mijoz.telefon);
        setIsm(d.mijoz.ism ?? "");
      });
  }, [router]);

  const saqla = async (e: React.FormEvent) => {
    e.preventDefault();
    setXato(null);
    setXabar(null);
    const javob = await api("/api/men", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ism }),
    });
    const data = await javob.json();
    if (!javob.ok) return setXato(data.xato ?? "Saqlab bo'lmadi");
    setXabar("Ism saqlandi");
    sessiyaOzgardi();
  };

  const chiq = async () => {
    await api("/api/auth/chiqish", { method: "POST" });
    sessiyaOzgardi();
    router.push("/");
  };

  return (
    <>
      <Sarlavha sarlavha="Ism va telefon" />
      <Tana className="space-y-4">
        <Karta>
          <form onSubmit={saqla} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-xira">Ism</span>
              <input value={ism} onChange={(e) => setIsm(e.target.value)} className={maydon} placeholder="Ismingiz" />
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-xira">Telefon</span>
              <div className="rounded-xl bg-stone-100 px-3 py-2.5 text-stone-700">{telefon ?? "..."}</div>
              <p className="mt-1 text-xs text-xira">
                {telegram ? "Telefon Telegram orqali ulashilgan." : "Telefon kirishda tasdiqlangan."}
              </p>
            </div>
            {xato && <p className="text-sm text-qizil">{xato}</p>}
            {xabar && <p className="text-sm text-yashil">{xabar}</p>}
            <button type="submit" className={tugmaAsosiy}>
              Saqlash
            </button>
          </form>
        </Karta>
        {/* Telegram ichida chiqish ma'nosiz — akkaunt Telegram'ga bog'langan */}
        {!telegram && (
          <button onClick={chiq} className={tugmaIkkinchi}>
            Chiqish
          </button>
        )}
      </Tana>
    </>
  );
}
