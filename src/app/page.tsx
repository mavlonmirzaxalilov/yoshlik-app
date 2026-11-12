"use client";

import { useEffect, useState } from "react";
import Savatcha, { type SavatchaQatori } from "@/components/Savatcha";
import { somFormat, type Taom } from "@/lib/turlar";

export default function MenyuSahifasi() {
  const [taomlar, setTaomlar] = useState<Taom[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [savatcha, setSavatcha] = useState<SavatchaQatori[]>([]);

  useEffect(() => {
    fetch("/api/taomlar")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTaomlar)
      .catch(() => setXato("Menyuni yuklab bo'lmadi"));
  }, []);

  const soniniOzgartir = (taom: Taom, farq: number) => {
    setSavatcha((oldingi) => {
      const mavjud = oldingi.find((q) => q.taom.id === taom.id);
      if (!mavjud) return farq > 0 ? [...oldingi, { taom, soni: farq }] : oldingi;
      return oldingi
        .map((q) => (q.taom.id === taom.id ? { ...q, soni: q.soni + farq } : q))
        .filter((q) => q.soni > 0);
    });
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Yoshlik</h1>
      <p className="mb-6 text-stone-600">Navbatsiz zakaz — tanlang, vaqtni belgilang, kassadan oling.</p>

      <h2 className="mb-3 text-lg font-semibold">Menyu</h2>
      {xato && <p className="text-red-600">{xato}</p>}
      {!taomlar && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {taomlar?.map((taom) => (
          <li key={taom.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <div className="font-medium">{taom.nom}</div>
              <div className="text-stone-600">{somFormat(taom.narx)}</div>
            </div>
            <button
              onClick={() => soniniOzgartir(taom, 1)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Savatchaga qo&apos;shish
            </button>
          </li>
        ))}
      </ul>

      <Savatcha qatorlar={savatcha} soniniOzgartir={soniniOzgartir} />
    </main>
  );
}
