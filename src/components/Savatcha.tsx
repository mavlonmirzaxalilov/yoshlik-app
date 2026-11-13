"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OLISH_USULLARI, somFormat, vaqtKerak, type OlishUsuli, type Taom } from "@/lib/turlar";
import { savatchaniYoz } from "@/lib/sessiyaKlient";

export type SavatchaQatori = { taom: Taom; soni: number };

type Props = {
  qatorlar: SavatchaQatori[];
  soniniOzgartir: (taom: Taom, farq: number) => void;
};

export default function Savatcha({ qatorlar, soniniOzgartir }: Props) {
  const router = useRouter();
  const [usul, setUsul] = useState<OlishUsuli>("OLIB_KETISH");
  const [vaqt, setVaqt] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  const jami = qatorlar.reduce((s, q) => s + q.taom.narx * q.soni, 0);

  const zakazBer = async () => {
    setYuborilmoqda(true);
    setXato(null);
    try {
      const javob = await fetch("/api/zakazlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qatorlar: qatorlar.map((q) => ({ taomId: q.taom.id, soni: q.soni })),
          olishUsuli: usul,
          olishVaqti: vaqtKerak(usul) ? vaqt : undefined,
        }),
      });
      const data = await javob.json();
      if (javob.status === 401) {
        // Savatcha localStorage'da saqlangan — kirgandan keyin menyuga qaytib tiklanadi.
        // Sahifa holati qaytishda saqlanadi, shuning uchun tugmani qayta faollashtiramiz.
        setYuborilmoqda(false);
        router.push("/kirish?qaytish=/");
        return;
      }
      if (!javob.ok) throw new Error(data.xato ?? "Zakaz yuborilmadi");
      savatchaniYoz([]);
      router.push(`/zakaz/${data.id}`);
    } catch (e) {
      setXato(e instanceof Error ? e.message : "Zakaz yuborilmadi");
      setYuborilmoqda(false);
    }
  };

  return (
    <section className="mt-8 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Savatcha</h2>

      {qatorlar.length === 0 ? (
        <p className="text-stone-500">Savatcha bo&apos;sh — menyudan taom qo&apos;shing.</p>
      ) : (
        <>
          <ul className="divide-y divide-stone-100">
            {qatorlar.map((q) => (
              <li key={q.taom.id} className="flex items-center justify-between py-2">
                <span>{q.taom.nom}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => soniniOzgartir(q.taom, -1)}
                    aria-label={`${q.taom.nom} sonini kamaytirish`}
                    className="h-8 w-8 rounded-lg border border-stone-300"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{q.soni}</span>
                  <button
                    onClick={() => soniniOzgartir(q.taom, 1)}
                    aria-label={`${q.taom.nom} sonini oshirish`}
                    className="h-8 w-8 rounded-lg border border-stone-300"
                  >
                    +
                  </button>
                  <span className="w-28 text-right text-stone-700">{somFormat(q.taom.narx * q.soni)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Jami</span>
            <span data-testid="jami">{somFormat(jami)}</span>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 font-medium">Olish usuli</legend>
            <div className="flex flex-wrap gap-2">
              {OLISH_USULLARI.map((u) => (
                <label
                  key={u.qiymat}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    usul === u.qiymat ? "border-emerald-600 bg-emerald-50" : "border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="usul"
                    value={u.qiymat}
                    checked={usul === u.qiymat}
                    onChange={() => setUsul(u.qiymat)}
                    className="sr-only"
                  />
                  {u.nom}
                </label>
              ))}
            </div>
          </fieldset>

          {vaqtKerak(usul) && (
            <label className="mt-4 block">
              <span className="mb-1 block font-medium">Olish vaqti</span>
              <input
                type="time"
                value={vaqt}
                onChange={(e) => setVaqt(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
          )}

          {xato && <p className="mt-3 text-red-600">{xato}</p>}

          <button
            onClick={zakazBer}
            disabled={yuborilmoqda}
            className="mt-5 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {yuborilmoqda ? "Yuborilmoqda..." : "Zakaz berish"}
          </button>
        </>
      )}
    </section>
  );
}
