"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Guruh = Record<string, { soni: number; summa: number }>;
type Hisobot = {
  dan: string;
  gacha: string;
  soni: number;
  savdo: number;
  ortachaChek: number;
  bekorlar: number;
  olishUsuli: Guruh;
  tolovTuri: Guruh;
  manba: Guruh;
  kunlik: Guruh;
  topTaomlar: { nom: string; soni: number; summa: number }[];
  harajat: { jami: number; turkum: Record<string, number> };
  foyda: number;
};

const NOM: Record<string, string> = {
  ZAL: "Zalda", OLIB_KETISH: "Olib ketish", YETKAZISH: "Yetkazish",
  CLICK: "Click", PAYME: "Payme", NAQD: "Naqd", KARTA: "Karta", KASSA: "Kassada", NOMALUM: "Noma'lum",
  ONLAYN: "Bot (onlayn)", KASSA_MANBA: "Kassa",
  MAHSULOT: "Mahsulot xaridi", ISH_HAQI: "Ish haqi", KOMMUNAL: "Kommunal", IJARA: "Ijara", BOSHQA: "Boshqa",
};
const pul = (n: number) => n.toLocaleString("ru-RU");
const bugun = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date());
const kunOldin = (kun: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date(Date.now() - kun * 86_400_000));

function Ustunlar({ sarlavha, data, nomlar = NOM }: { sarlavha: string; data: Guruh | Record<string, number>; nomlar?: Record<string, string> }) {
  const qatorlar = Object.entries(data).map(([k, v]) => ({ k, summa: typeof v === "number" ? v : v.summa, soni: typeof v === "number" ? null : v.soni }));
  const max = Math.max(1, ...qatorlar.map((q) => q.summa));
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-bold text-panel">{sarlavha}</h2>
      {!qatorlar.length && <p className="text-sm text-stone-400">Ma&apos;lumot yo&apos;q</p>}
      <ul className="space-y-3">
        {qatorlar.sort((a, b) => b.summa - a.summa).map((q) => (
          <li key={q.k}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-stone-700">{nomlar[q.k] ?? q.k}{q.soni !== null && <span className="text-stone-400"> · {q.soni} ta</span>}</span>
              <span className="font-semibold">{pul(q.summa)}</span>
            </div>
            <div className="h-2 rounded-full bg-admin-fon">
              <div className="h-2 rounded-full bg-faol" style={{ width: `${(q.summa / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HisobotSahifasi() {
  const [dan, setDan] = useState(bugun);
  const [gacha, setGacha] = useState(bugun);
  const [h, setH] = useState<Hisobot | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    api(`/api/admin/hisobot?dan=${dan}&gacha=${gacha}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.xato);
        setXato(null);
        setH(d);
      })
      .catch((e: Error) => setXato(e.message || "Yuklab bo'lmadi"));
  }, [dan, gacha]);

  const tez = (kun: number) => {
    setDan(kunOldin(kun));
    setGacha(bugun());
  };
  const kartalar = h && [
    { nom: "Savdo", qiymat: pul(h.savdo), rang: "text-panel" },
    { nom: "Zakazlar", qiymat: String(h.soni), rang: "text-panel" },
    { nom: "O'rtacha chek", qiymat: pul(h.ortachaChek), rang: "text-panel" },
    { nom: "Harajat", qiymat: pul(h.harajat.jami), rang: "text-red-600" },
    { nom: "Foyda", qiymat: pul(h.foyda), rang: h.foyda >= 0 ? "text-tolov" : "text-red-600" },
    { nom: "Bekor qilingan", qiymat: String(h.bekorlar), rang: "text-stone-600" },
  ];
  const kunlikKop = h && Object.keys(h.kunlik).length > 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={dan} onChange={(e) => setDan(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
        <span className="text-stone-400">—</span>
        <input type="date" value={gacha} onChange={(e) => setGacha(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
        {[["Bugun", 0], ["7 kun", 6], ["30 kun", 29]].map(([n, k]) => (
          <button key={n} onClick={() => tez(k as number)} className="rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-sm">
            {n}
          </button>
        ))}
      </div>
      {xato && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{xato}</p>}
      {!h && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}

      {h && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {kartalar!.map((k) => (
              <div key={k.nom} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-stone-500">{k.nom}</div>
                <div className={`mt-1 text-2xl font-extrabold ${k.rang}`}>{k.qiymat}</div>
              </div>
            ))}
          </div>

          {kunlikKop && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-panel">Kunlik savdo</h2>
              <div className="flex h-40 items-end gap-1 overflow-x-auto">
                {Object.entries(h.kunlik)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([kun, v], _i, arr) => {
                    const max = Math.max(...arr.map(([, x]) => x.summa));
                    return (
                      <div key={kun} className="flex min-w-6 flex-1 flex-col items-center gap-1" title={`${kun}: ${pul(v.summa)} (${v.soni} ta)`}>
                        <div className="w-full rounded-t-md bg-faol" style={{ height: `${Math.max(4, (v.summa / max) * 130)}px` }} />
                        <span className="text-[10px] text-stone-400">{kun.slice(8)}</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-panel">Eng ko&apos;p sotilgan taomlar</h2>
              {!h.topTaomlar.length && <p className="text-sm text-stone-400">Ma&apos;lumot yo&apos;q</p>}
              <ol className="space-y-2">
                {h.topTaomlar.map((t, i) => (
                  <li key={t.nom} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-faol-och font-bold text-faol">{i + 1}</span>
                    <span className="flex-1 font-medium">{t.nom}</span>
                    <span className="text-stone-500">{t.soni} ta</span>
                    <span className="w-24 text-right font-semibold">{pul(t.summa)}</span>
                  </li>
                ))}
              </ol>
            </section>
            <Ustunlar sarlavha="Olish usuli bo'yicha" data={h.olishUsuli} />
            <Ustunlar sarlavha="To'lov turi bo'yicha" data={h.tolovTuri} />
            <Ustunlar sarlavha="Manba: bot va kassa" data={h.manba} nomlar={{ ...NOM, KASSA: "Kassa" }} />
            <Ustunlar sarlavha="Harajatlar turkumi" data={h.harajat.turkum} />
          </div>
        </>
      )}
    </div>
  );
}
