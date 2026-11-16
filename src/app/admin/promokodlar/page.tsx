"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

type Promokod = { id: number; kod: string; foiz: number; muddati: string | null; maxIshlatish: number | null; ishlatildi: number; faol: boolean };
const maydon = "rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol";
const kun = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date(iso));

export default function PromokodlarSahifasi() {
  const [ro, setRo] = useState<Promokod[] | null>(null);
  const [yangi, setYangi] = useState({ kod: "", foiz: "10", muddati: "", maxIshlatish: "" });
  const [xato, setXato] = useState<string | null>(null);

  const yukla = useCallback(() => {
    api("/api/admin/promokodlar").then((r) => r.json()).then(setRo);
  }, []);
  useEffect(() => {
    yukla();
  }, [yukla]);

  const sorov = async (url: string, method: string, body?: object) => {
    setXato(null);
    const r = await api(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setXato(d.xato ?? "Xatolik");
      return false;
    }
    yukla();
    return true;
  };

  const qosh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await sorov("/api/admin/promokodlar", "POST", { ...yangi, foiz: Number(yangi.foiz) }))
      setYangi({ kod: "", foiz: "10", muddati: "", maxIshlatish: "" });
  };

  const holat = (p: Promokod) => {
    if (!p.faol) return { matn: "O'chirilgan", rang: "bg-stone-100 text-stone-500" };
    if (p.muddati && new Date(p.muddati) < new Date()) return { matn: "Muddati o'tgan", rang: "bg-amber-100 text-amber-700" };
    if (p.maxIshlatish !== null && p.ishlatildi >= p.maxIshlatish) return { matn: "Limit tugagan", rang: "bg-amber-100 text-amber-700" };
    return { matn: "Faol", rang: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-4">
      <form onSubmit={qosh} className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-stone-500">Kod</span>
          <input value={yangi.kod} onChange={(e) => setYangi({ ...yangi, kod: e.target.value.toUpperCase() })} placeholder="YOSHLIK10" className={`${maydon} w-full`} />
        </label>
        <label className="w-24">
          <span className="mb-1 block text-xs text-stone-500">Chegirma %</span>
          <input inputMode="numeric" value={yangi.foiz} onChange={(e) => setYangi({ ...yangi, foiz: e.target.value })} className={`${maydon} w-full`} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-stone-500">Muddati (ixtiyoriy)</span>
          <input type="date" value={yangi.muddati} onChange={(e) => setYangi({ ...yangi, muddati: e.target.value })} className={maydon} />
        </label>
        <label className="w-32">
          <span className="mb-1 block text-xs text-stone-500">Limit (ixtiyoriy)</span>
          <input inputMode="numeric" value={yangi.maxIshlatish} onChange={(e) => setYangi({ ...yangi, maxIshlatish: e.target.value })} placeholder="masalan 100" className={`${maydon} w-full`} />
        </label>
        <button className="flex items-center gap-1 rounded-xl bg-tolov px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Yaratish
        </button>
      </form>
      {xato && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{xato}</p>}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-admin-fon text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-2">Kod</th>
              <th className="px-4 py-2">Chegirma</th>
              <th className="px-4 py-2">Ishlatildi</th>
              <th className="px-4 py-2">Muddati</th>
              <th className="px-4 py-2">Holat</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ro?.map((p) => {
              const h = holat(p);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono font-bold text-panel">{p.kod}</td>
                  <td className="px-4 py-2">{p.foiz}%</td>
                  <td className="px-4 py-2">{p.ishlatildi}{p.maxIshlatish !== null && ` / ${p.maxIshlatish}`}</td>
                  <td className="px-4 py-2">{p.muddati ? kun(p.muddati) : "—"}</td>
                  <td className="px-4 py-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${h.rang}`}>{h.matn}</span></td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button onClick={() => sorov(`/api/admin/promokodlar/${p.id}`, "PATCH", { faol: !p.faol })} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs">
                      {p.faol ? "O'chirish" : "Yoqish"}
                    </button>
                    <button onClick={() => confirm(`${p.kod} o'chirilsinmi?`) && sorov(`/api/admin/promokodlar/${p.id}`, "DELETE")} className="p-2 text-red-500" aria-label="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ro?.length === 0 && <p className="p-6 text-center text-sm text-stone-400">Promokod yo&apos;q</p>}
      </div>
    </div>
  );
}
