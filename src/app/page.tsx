"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Savatcha, { type SavatchaQatori } from "@/components/Savatcha";
import TaomDetali from "@/components/TaomDetali";
import TaomRasmi from "@/components/TaomRasmi";
import { somFormat, type Kategoriya, type Taom } from "@/lib/turlar";
import { savatchaniOqi, savatchaniYoz } from "@/lib/sessiyaKlient";

export default function MenyuSahifasi() {
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [tanlangan, setTanlangan] = useState<number | null>(null); // null = Hammasi
  const [taomlar, setTaomlar] = useState<Taom[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [savatcha, setSavatcha] = useState<SavatchaQatori[]>([]);
  const [ochiqTaom, setOchiqTaom] = useState<number | null>(null);
  const [tiklandi, setTiklandi] = useState(false);

  // Savatcha localStorage'dan tiklanadi (masalan, kirish sahifasidan qaytganda)
  useEffect(() => {
    const saqlangan = savatchaniOqi();
    const tiklash = saqlangan.length
      ? fetch("/api/taomlar")
          .then((r) => (r.ok ? r.json() : []))
          .then((hammasi: Taom[]) => {
            setSavatcha(
              saqlangan.flatMap((q) => {
                const taom = hammasi.find((t) => t.id === q.taomId && !t.tugadi);
                return taom ? [{ taom, soni: q.soni }] : [];
              }),
            );
          })
      : Promise.resolve();
    tiklash.finally(() => setTiklandi(true));
  }, []);

  useEffect(() => {
    if (tiklandi) savatchaniYoz(savatcha.map((q) => ({ taomId: q.taom.id, soni: q.soni })));
  }, [savatcha, tiklandi]);

  useEffect(() => {
    fetch("/api/kategoriyalar")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setKategoriyalar)
      .catch(() => setXato("Menyuni yuklab bo'lmadi"));
  }, []);

  useEffect(() => {
    const url = tanlangan ? `/api/taomlar?kategoriya=${tanlangan}` : "/api/taomlar";
    fetch(url)
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

  const soniniOzgartir = useCallback((taom: Taom, farq: number) => {
    setSavatcha((oldingi) => {
      const mavjud = oldingi.find((q) => q.taom.id === taom.id);
      if (!mavjud) return farq > 0 ? [...oldingi, { taom, soni: farq }] : oldingi;
      return oldingi
        .map((q) => (q.taom.id === taom.id ? { ...q, soni: q.soni + farq } : q))
        .filter((q) => q.soni > 0);
    });
  }, []);

  const yopish = useCallback(() => setOchiqTaom(null), []);

  const tugma = (faol: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm ${
      faol ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 bg-white"
    }`;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Yoshlik</h1>
      <p className="mb-4 text-stone-600">Navbatsiz zakaz — tanlang, vaqtni belgilang, kassadan oling.</p>

      <nav aria-label="Kategoriyalar" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <button onClick={() => setTanlangan(null)} className={tugma(tanlangan === null)}>
          Hammasi
        </button>
        {kategoriyalar.map((k) => (
          <button key={k.id} onClick={() => setTanlangan(k.id)} className={tugma(tanlangan === k.id)}>
            {k.belgi} {k.nom}
          </button>
        ))}
      </nav>

      {xato && <p className="text-red-600">{xato}</p>}
      {!taomlar && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}

      {guruhlar.map((g) => (
        <section key={g.kategoriya?.id ?? 0} className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">
            {g.kategoriya?.belgi} {g.kategoriya?.nom}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {g.taomlar.map((taom) => (
              <li key={taom.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <button
                  onClick={() => setOchiqTaom(taom.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <TaomRasmi taom={taom} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{taom.nom}</span>
                    {taom.hajm && <span className="block text-sm text-stone-500">{taom.hajm}</span>}
                    <span className="block text-stone-700">{somFormat(taom.narx)}</span>
                  </span>
                </button>
                <button
                  onClick={() => soniniOzgartir(taom, 1)}
                  disabled={taom.tugadi}
                  aria-label={`${taom.nom} — savatchaga qo'shish`}
                  className="h-10 w-10 shrink-0 rounded-lg bg-emerald-600 text-xl font-medium text-white hover:bg-emerald-700 disabled:bg-stone-300"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Savatcha qatorlar={savatcha} soniniOzgartir={soniniOzgartir} />

      {ochiqTaom !== null && (
        <TaomDetali taomId={ochiqTaom} yopish={yopish} qoshish={(taom) => soniniOzgartir(taom, 1)} />
      )}
    </main>
  );
}
