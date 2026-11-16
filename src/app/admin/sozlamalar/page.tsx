"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ChekPrinteri from "@/components/admin/ChekPrinteri";

type S = Record<string, string>;

const GURUHLAR: {
  nom: string;
  izoh?: string;
  maydonlar: { kalit: string; nom: string; misol: string }[];
}[] = [
  {
    nom: "Aloqa (Yordam sahifasi)",
    maydonlar: [
      {
        kalit: "KAFE_TELEFON",
        nom: "Kafe telefoni",
        misol: "+998 90 123 45 67",
      },
      {
        kalit: "KAFE_TELEGRAM",
        nom: "Admin Telegram username",
        misol: "yoshlik_admin",
      },
    ],
  },
  {
    nom: "Kafe joylashuvi",
    izoh: "Google yoki Yandex xaritada kafe nuqtasini bosing — koordinata chiqadi. Yetkazish masofasi shu nuqtadan hisoblanadi.",
    maydonlar: [
      { kalit: "KAFE_LAT", nom: "Kenglik (lat)", misol: "41.311081" },
      { kalit: "KAFE_LNG", nom: "Uzunlik (lng)", misol: "69.240562" },
    ],
  },
  {
    nom: "Yetkazish tarifi",
    izoh: "Narx = bazaviy + har boshlangan km × km narxi.",
    maydonlar: [
      { kalit: "YETKAZISH_BAZAVIY", nom: "Bazaviy narx (so'm)", misol: "5000" },
      { kalit: "YETKAZISH_KM_NARXI", nom: "Har km (so'm)", misol: "2000" },
      { kalit: "YETKAZISH_RADIUS_KM", nom: "Maksimal radius (km)", misol: "5" },
      {
        kalit: "YETKAZISH_MIN_SUMMA",
        nom: "Minimal zakaz (so'm)",
        misol: "30000",
      },
    ],
  },
];

export default function SozlamalarSahifasi() {
  const [s, setS] = useState<S | null>(null);
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    api("/api/admin/sozlamalar")
      .then((r) => r.json())
      .then(setS);
  }, []);

  const saqla = async (e: React.FormEvent) => {
    e.preventDefault();
    setXato(null);
    setXabar(null);
    const r = await api("/api/admin/sozlamalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const d = await r.json();
    if (!r.ok) return setXato(d.xato ?? "Saqlanmadi");
    setS(d);
    setXabar("Saqlandi — mijozlar ilovasida darhol kuchga kiradi");
  };

  if (!s) return <p className="text-stone-500">Yuklanmoqda...</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <form onSubmit={saqla} className="space-y-4">
        {GURUHLAR.map((g) => (
          <section key={g.nom} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-panel">{g.nom}</h2>
            {g.izoh && <p className="mt-1 text-xs text-stone-500">{g.izoh}</p>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {g.maydonlar.map((m) => (
                <label key={m.kalit}>
                  <span className="mb-1 block text-xs text-stone-500">
                    {m.nom}
                  </span>
                  <input
                    value={s[m.kalit] ?? ""}
                    onChange={(e) => setS({ ...s, [m.kalit]: e.target.value })}
                    placeholder={m.misol}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
        {xato && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {xato}
          </p>
        )}
        {xabar && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {xabar}
          </p>
        )}
        <button className="rounded-xl bg-faol px-6 py-3 font-semibold text-white">
          Saqlash
        </button>
      </form>
      <ChekPrinteri />
    </div>
  );
}
