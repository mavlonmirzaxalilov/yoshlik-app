"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";

type Harajat = { id: number; sana: string; summa: number; turkum: string; izoh: string | null; xodim: { ism: string | null; telefon: string | null } | null };
type Forma = { id?: number; sana: string; summa: string; turkum: string; izoh: string };

const TURKUMLAR: Record<string, string> = {
  MAHSULOT: "Mahsulot xaridi",
  ISH_HAQI: "Ish haqi",
  KOMMUNAL: "Kommunal",
  IJARA: "Ijara",
  BOSHQA: "Boshqa",
};
const kun = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
const pul = (n: number) => n.toLocaleString("ru-RU");
const maydon = "w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol";

export default function HarajatlarSahifasi() {
  const [dan, setDan] = useState(() => kun(new Date(Date.now() - 29 * 86_400_000)));
  const [gacha, setGacha] = useState(() => kun());
  const [turkum, setTurkum] = useState("");
  const [ro, setRo] = useState<Harajat[] | null>(null);
  const [forma, setForma] = useState<Forma | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  const yukla = useCallback(() => {
    api(`/api/admin/harajatlar?dan=${dan}&gacha=${gacha}${turkum ? `&turkum=${turkum}` : ""}`)
      .then((r) => r.json())
      .then(setRo);
  }, [dan, gacha, turkum]);
  useEffect(() => {
    yukla();
  }, [yukla]);

  const saqla = async () => {
    if (!forma) return;
    setXato(null);
    const r = await api(forma.id ? `/api/admin/harajatlar/${forma.id}` : "/api/admin/harajatlar", {
      method: forma.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...forma, summa: Number(forma.summa.replace(/\D/g, "")) }),
    });
    const d = await r.json();
    if (!r.ok) return setXato(d.xato ?? "Saqlanmadi");
    setForma(null);
    yukla();
  };

  const ochir = async (h: Harajat) => {
    if (!confirm(`${pul(h.summa)} so'mlik harajat o'chirilsinmi?`)) return;
    await api(`/api/admin/harajatlar/${h.id}`, { method: "DELETE" });
    yukla();
  };

  const jami = ro?.reduce((s, h) => s + h.summa, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={dan} onChange={(e) => setDan(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
        <span className="text-stone-400">—</span>
        <input type="date" value={gacha} onChange={(e) => setGacha(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
        <select value={turkum} onChange={(e) => setTurkum(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
          <option value="">Barcha turkumlar</option>
          {Object.entries(TURKUMLAR).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => setForma({ sana: kun(), summa: "", turkum: "MAHSULOT", izoh: "" })}
          className="ml-auto flex items-center gap-1 rounded-xl bg-tolov px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Harajat qo&apos;shish
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-sm text-stone-500">Davr bo&apos;yicha jami harajat</div>
        <div className="text-3xl font-extrabold text-red-600">{pul(jami)} so&apos;m</div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-admin-fon text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-2">Sana</th>
              <th className="px-4 py-2">Turkum</th>
              <th className="px-4 py-2">Izoh</th>
              <th className="px-4 py-2 text-right">Summa</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ro?.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-2 whitespace-nowrap">{kun(new Date(h.sana))}</td>
                <td className="px-4 py-2">{TURKUMLAR[h.turkum]}</td>
                <td className="px-4 py-2 text-stone-600">{h.izoh}{h.xodim?.ism && <span className="text-xs text-stone-400"> · {h.xodim.ism}</span>}</td>
                <td className="px-4 py-2 text-right font-semibold">{pul(h.summa)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button onClick={() => setForma({ id: h.id, sana: kun(new Date(h.sana)), summa: String(h.summa), turkum: h.turkum, izoh: h.izoh ?? "" })} className="p-2 text-faol" aria-label="Tahrirlash">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => ochir(h)} className="p-2 text-red-500" aria-label="O'chirish">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ro?.length === 0 && <p className="p-6 text-center text-sm text-stone-400">Bu davrda harajat yo&apos;q</p>}
      </div>

      {forma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setForma(null)}>
          <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-panel">{forma.id ? "Harajatni tahrirlash" : "Yangi harajat"}</h2>
              <button onClick={() => setForma(null)} aria-label="Yopish"><X size={20} /></button>
            </div>
            <input type="date" value={forma.sana} onChange={(e) => setForma({ ...forma, sana: e.target.value })} className={maydon} />
            <input inputMode="numeric" value={forma.summa} onChange={(e) => setForma({ ...forma, summa: e.target.value })} placeholder="Summa (so'm)" className={maydon} />
            <select value={forma.turkum} onChange={(e) => setForma({ ...forma, turkum: e.target.value })} className={maydon}>
              {Object.entries(TURKUMLAR).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input value={forma.izoh} onChange={(e) => setForma({ ...forma, izoh: e.target.value })} placeholder="Izoh (ixtiyoriy)" className={maydon} />
            {xato && <p className="text-sm text-red-600">{xato}</p>}
            <button onClick={saqla} className="w-full rounded-xl bg-faol py-3 font-semibold text-white">Saqlash</button>
          </div>
        </div>
      )}
    </div>
  );
}
