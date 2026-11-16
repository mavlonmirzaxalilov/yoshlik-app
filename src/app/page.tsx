"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { useSavatcha } from "@/components/SavatchaProvider";
import TaomDetali from "@/components/TaomDetali";
import TaomRasmi from "@/components/TaomRasmi";
import { Sarlavha } from "@/components/ui";
import { somFormat, type Kategoriya, type Taom } from "@/lib/turlar";

export default function MenyuSahifasi() {
  const { soniniOzgartir, jamiSoni, jamiSumma, qatorlar } = useSavatcha();
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [tanlangan, setTanlangan] = useState<number | null>(null); // null = Hammasi
  const [taomlar, setTaomlar] = useState<Taom[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [ochiqTaom, setOchiqTaom] = useState<number | null>(null);

  useEffect(() => {
    api("/api/kategoriyalar")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setKategoriyalar)
      .catch(() => setXato("Menyuni yuklab bo'lmadi"));
  }, []);

  useEffect(() => {
    const url = tanlangan ? `/api/taomlar?kategoriya=${tanlangan}` : "/api/taomlar";
    api(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTaomlar)
      .catch(() => setXato("Menyuni yuklab bo'lmadi"));
  }, [tanlangan]);

  // Taomlar kategoriya bo'yicha guruhlanadi (API allaqachon tartiblab beradi)
  const guruhlar = useMemo(() => {
    const natija: { kategoriya: Taom["kategoriya"]; taomlar: Taom[] }[] = [];
    for (const taom of taomlar ?? []) {
      const oxirgi = natija.at(-1);
      if (oxirgi && oxirgi.kategoriya?.id === taom.kategoriya?.id) oxirgi.taomlar.push(taom);
      else natija.push({ kategoriya: taom.kategoriya, taomlar: [taom] });
    }
    return natija;
  }, [taomlar]);

  const yopish = useCallback(() => setOchiqTaom(null), []);
  const savatdagiSoni = (id: number) => qatorlar.find((q) => q.taom.id === id)?.soni ?? 0;

  const chip = (faol: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
      faol ? "bg-asosiy text-white" : "border border-stone-200 bg-white text-stone-700"
    }`;

  return (
    <>
      <Sarlavha sarlavha="Yoshlik">
        <p className="mt-1 text-center text-sm text-white/90">Navbatsiz zakaz — tanlang, vaqtni belgilang, oling</p>
      </Sarlavha>

      <main className="mx-auto w-full max-w-xl px-4 pb-40 pt-4">
        <nav aria-label="Kategoriyalar" className="scroll-yashirin -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
          <button onClick={() => setTanlangan(null)} className={chip(tanlangan === null)}>
            Hammasi
          </button>
          {kategoriyalar.map((k) => (
            <button key={k.id} onClick={() => setTanlangan(k.id)} className={chip(tanlangan === k.id)}>
              {k.belgi} {k.nom}
            </button>
          ))}
        </nav>

        {xato && <p className="text-qizil">{xato}</p>}
        {!taomlar && !xato && <p className="text-xira">Yuklanmoqda...</p>}

        {guruhlar.map((g) => (
          <section key={g.kategoriya?.id ?? 0} className="mb-6">
            <h2 className="mb-3 text-lg font-bold">
              {g.kategoriya?.belgi} {g.kategoriya?.nom}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {g.taomlar.map((taom) => {
                const soni = savatdagiSoni(taom.id);
                return (
                  <li
                    key={taom.id}
                    className="flex items-center gap-3 rounded-karta border border-stone-200/80 bg-white p-3 shadow-karta"
                  >
                    <button
                      onClick={() => setOchiqTaom(taom.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <TaomRasmi taom={taom} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{taom.nom}</span>
                        {taom.hajm && <span className="block text-sm text-xira">{taom.hajm}</span>}
                        <span className="block font-bold text-asosiy">{somFormat(taom.narx)}</span>
                      </span>
                    </button>
                    <button
                      onClick={() => soniniOzgartir(taom, 1)}
                      disabled={taom.tugadi}
                      aria-label={`${taom.nom} — savatchaga qo'shish`}
                      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-asosiy text-white hover:bg-asosiy-toq disabled:bg-stone-300"
                    >
                      <Plus size={20} strokeWidth={2.4} />
                      {soni > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold">
                          {soni}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      {/* Savatcha bo'sh bo'lmasa — pastki menyu ustida panel */}
      {jamiSoni > 0 && (
        <Link
          href="/savat"
          className="fixed inset-x-4 bottom-[76px] z-30 mx-auto flex max-w-[calc(36rem-2rem)] items-center justify-between rounded-2xl bg-asosiy px-4 py-3 text-white shadow-lg"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingCart size={20} /> Savat · {jamiSoni} ta
          </span>
          <span className="font-bold">{somFormat(jamiSumma)}</span>
        </Link>
      )}

      {ochiqTaom !== null && (
        <TaomDetali taomId={ochiqTaom} yopish={yopish} qoshish={(taom) => soniniOzgartir(taom, 1)} />
      )}
    </>
  );
}
