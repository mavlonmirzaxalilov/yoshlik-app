"use client";

import { useEffect, useState } from "react";
import TaomRasmi from "@/components/TaomRasmi";
import { somFormat, type Taom } from "@/lib/turlar";

type Props = {
  taomId: number;
  yopish: () => void;
  qoshish: (taom: Taom) => void;
};

// Pastdan chiqadigan detal oynasi — alohida sahifa emas, savatcha holati saqlanadi.
export default function TaomDetali({ taomId, yopish, qoshish }: Props) {
  const [taom, setTaom] = useState<Taom | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/taomlar/${taomId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.xato ?? "Taom topilmadi");
        setTaom(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, [taomId]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && yopish();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [yopish]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={yopish}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={taom?.nom ?? "Taom"}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        {xato && <p className="text-red-600">{xato}</p>}
        {!taom && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}
        {taom && (
          <>
            <TaomRasmi taom={taom} katta />
            <p className="mt-4 text-sm text-stone-500">{taom.kategoriya?.nom}</p>
            <h2 className="text-xl font-bold">{taom.nom}</h2>
            {taom.hajm && <p className="mt-1 text-stone-700">Hajm: {taom.hajm}</p>}
            {taom.tavsif && <p className="mt-2 text-stone-600">{taom.tavsif}</p>}
            <p className="mt-3 text-lg font-semibold">{somFormat(taom.narx)}</p>
            {taom.tugadi ? (
              <p className="mt-4 rounded-lg bg-stone-100 py-3 text-center text-stone-600">Hozircha tugagan</p>
            ) : (
              <button
                onClick={() => {
                  qoshish(taom);
                  yopish();
                }}
                className="mt-4 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Savatchaga qo&apos;shish
              </button>
            )}
          </>
        )}
        <button onClick={yopish} className="mt-3 w-full py-2 text-stone-600">
          Yopish
        </button>
      </div>
    </div>
  );
}
