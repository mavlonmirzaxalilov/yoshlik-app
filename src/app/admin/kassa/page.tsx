"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Minus, Plus, ReceiptText, ShoppingBag, Trash2, Utensils, X } from "lucide-react";
import { api } from "@/lib/api";
import { somFormat, type Kategoriya, type Taom } from "@/lib/turlar";
import { useAdmin } from "@/components/admin/AdminKontekst";

type Qator = { taom: Taom; soni: number };

export default function KassaSahifasi() {
  const { qidiruv } = useAdmin();
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [taomlar, setTaomlar] = useState<Taom[]>([]);
  const [tanlangan, setTanlangan] = useState<number | null>(null);
  const [qatorlar, setQatorlar] = useState<Qator[]>([]);
  const [usul, setUsul] = useState<"ZAL" | "OLIB_KETISH">("ZAL");
  const [tolov, setTolov] = useState<"NAQD" | "KARTA">("NAQD");
  const [olingan, setOlingan] = useState("");
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<string | null>(null);
  const [natija, setNatija] = useState<{ raqam: number; jami: number; qaytim: number | null } | null>(null);
  const [panelOchiq, setPanelOchiq] = useState(false); // telefonda buyurtma paneli

  const yukla = () =>
    Promise.all([api("/api/kategoriyalar").then((r) => r.json()), api("/api/taomlar").then((r) => r.json())]).then(
      ([k, t]) => {
        setKategoriyalar(k);
        setTaomlar(t);
      },
    );
  useEffect(() => {
    yukla();
  }, []);

  const korinadigan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return taomlar.filter((t) => (tanlangan ? t.kategoriyaId === tanlangan : true) && (!q || t.nom.toLowerCase().includes(q)));
  }, [taomlar, tanlangan, qidiruv]);

  const ozgartir = (taom: Taom, farq: number) =>
    setQatorlar((old) => {
      const bor = old.find((q) => q.taom.id === taom.id);
      if (!bor) return farq > 0 ? [...old, { taom, soni: farq }] : old;
      return old.map((q) => (q.taom.id === taom.id ? { ...q, soni: q.soni + farq } : q)).filter((q) => q.soni > 0);
    });

  const jami = qatorlar.reduce((s, q) => s + q.taom.narx * q.soni, 0);
  const jamiSoni = qatorlar.reduce((s, q) => s + q.soni, 0);
  const olinganSon = Number(olingan.replace(/\D/g, "")) || 0;
  const qaytim = tolov === "NAQD" && olinganSon ? olinganSon - jami : null;

  const tolash = async () => {
    setBand(true);
    setXato(null);
    const javob = await api("/api/admin/kassa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qatorlar: qatorlar.map((q) => ({ taomId: q.taom.id, soni: q.soni })),
        olishUsuli: usul,
        tolovUsuli: tolov,
      }),
    });
    const data = await javob.json();
    setBand(false);
    if (!javob.ok) {
      setXato(data.xato ?? "Saqlab bo'lmadi");
      yukla(); // masalan, taom tugagan bo'lsa ro'yxat yangilansin
      return;
    }
    setNatija({ raqam: data.raqam, jami: data.jami, qaytim });
    setQatorlar([]);
    setOlingan("");
    setPanelOchiq(false);
  };

  const tanlov = (faol: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold ${
      faol ? "border-faol bg-faol-och text-faol" : "border-stone-200 bg-white text-stone-600"
    }`;

  const buyurtmaPaneli = (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <h2 className="text-lg font-bold text-panel">Buyurtma</h2>
        <span className="text-sm text-stone-500">{jamiSoni} ta</span>
        <button onClick={() => setPanelOchiq(false)} className="lg:hidden" aria-label="Yopish">
          <X size={20} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {qatorlar.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">Taomni bosing — buyurtmaga qo&apos;shiladi</p>
        )}
        <ul className="divide-y divide-stone-100">
          {qatorlar.map((q) => (
            <li key={q.taom.id} className="flex items-center gap-2 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-panel">{q.taom.nom}</div>
                <div className="text-xs text-stone-500">{somFormat(q.taom.narx)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => ozgartir(q.taom, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-fon" aria-label="Kamaytirish">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{q.soni}</span>
                <button onClick={() => ozgartir(q.taom, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-fon" aria-label="Oshirish">
                  <Plus size={14} />
                </button>
              </div>
              <span className="w-20 text-right text-sm font-semibold">{(q.taom.narx * q.soni).toLocaleString("ru-RU")}</span>
              <button onClick={() => ozgartir(q.taom, -q.soni)} className="p-1 text-red-500" aria-label="O'chirish">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 border-t border-stone-100 px-5 py-4">
        <div className="flex gap-2">
          <button onClick={() => setUsul("ZAL")} className={tanlov(usul === "ZAL")}>
            <Utensils size={16} /> Zalda
          </button>
          <button onClick={() => setUsul("OLIB_KETISH")} className={tanlov(usul === "OLIB_KETISH")}>
            <ShoppingBag size={16} /> Olib ketish
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTolov("NAQD")} className={tanlov(tolov === "NAQD")}>
            <Banknote size={16} /> Naqd
          </button>
          <button onClick={() => setTolov("KARTA")} className={tanlov(tolov === "KARTA")}>
            <CreditCard size={16} /> Karta
          </button>
        </div>
        {tolov === "NAQD" && (
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              value={olingan}
              onChange={(e) => setOlingan(e.target.value)}
              placeholder="Olingan pul"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol"
            />
            {qaytim !== null && (
              <span className={`shrink-0 text-sm font-semibold ${qaytim < 0 ? "text-red-600" : "text-tolov"}`}>
                {qaytim < 0 ? `Yetmaydi ${(-qaytim).toLocaleString("ru-RU")}` : `Qaytim ${qaytim.toLocaleString("ru-RU")}`}
              </span>
            )}
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-panel">Jami:</span>
          <span className="text-3xl font-extrabold text-panel">{jami.toLocaleString("ru-RU")}</span>
        </div>
        {xato && <p className="text-sm text-red-600">{xato}</p>}
        <button
          onClick={tolash}
          disabled={band || !qatorlar.length || (qaytim !== null && qaytim < 0)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-tolov py-4 text-lg font-bold text-white shadow-lg shadow-tolov/30 hover:bg-tolov-toq disabled:opacity-50"
        >
          <ReceiptText size={22} /> {band ? "Saqlanmoqda..." : "To'lov qilish"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="min-w-0">
        <div className="scroll-yashirin mb-4 flex gap-2 overflow-x-auto pb-1">
          {[{ id: null, nom: "Barchasi", belgi: "" }, ...kategoriyalar].map((k) => (
            <button
              key={k.id ?? "hammasi"}
              onClick={() => setTanlangan(k.id)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ${
                tanlangan === k.id ? "bg-faol text-white" : "bg-white text-stone-700 shadow-sm"
              }`}
            >
              {k.belgi} {k.nom}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {korinadigan.map((t) => {
            const soni = qatorlar.find((q) => q.taom.id === t.id)?.soni ?? 0;
            return (
              <li key={t.id}>
                <button
                  onClick={() => ozgartir(t, 1)}
                  disabled={t.tugadi}
                  className={`relative w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:shadow-md disabled:opacity-40 ${
                    soni ? "ring-2 ring-faol" : ""
                  }`}
                >
                  <div className="flex aspect-[4/3] items-center justify-center bg-admin-fon text-5xl">
                    {t.rasm ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.rasm} alt={t.nom} className="h-full w-full object-cover" />
                    ) : (
                      t.kategoriya?.belgi ?? "🍽️"
                    )}
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-semibold text-panel">{t.nom}</div>
                    <div className="text-sm font-bold text-stone-700">{t.narx.toLocaleString("ru-RU")}</div>
                  </div>
                  {t.tugadi && <span className="absolute left-2 top-2 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-bold text-white">Tugadi</span>}
                  {soni > 0 && (
                    <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-faol px-1.5 text-sm font-bold text-white">
                      {soni}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {!korinadigan.length && <p className="py-10 text-center text-stone-400">Taom topilmadi</p>}
      </section>

      <aside className="sticky top-20 hidden h-[calc(100vh-7rem)] lg:block">{buyurtmaPaneli}</aside>

      {/* Telefon/planshet: pastdagi panel */}
      {qatorlar.length > 0 && !panelOchiq && (
        <button
          onClick={() => setPanelOchiq(true)}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-2xl bg-tolov px-5 py-4 font-bold text-white shadow-xl lg:hidden"
        >
          <span>Buyurtma · {jamiSoni} ta</span>
          <span>{somFormat(jami)}</span>
        </button>
      )}
      {panelOchiq && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" onClick={() => setPanelOchiq(false)}>
          <div className="h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            {buyurtmaPaneli}
          </div>
        </div>
      )}

      {natija && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setNatija(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-tolov">To&apos;lov qabul qilindi</p>
            <p className="mt-2 text-6xl font-extrabold text-panel">#{natija.raqam}</p>
            <p className="mt-2 text-stone-600">{somFormat(natija.jami)}</p>
            {natija.qaytim !== null && natija.qaytim > 0 && (
              <p className="mt-1 text-lg font-bold text-tolov">Qaytim: {somFormat(natija.qaytim)}</p>
            )}
            <button onClick={() => setNatija(null)} className="mt-6 w-full rounded-2xl bg-faol py-3 font-bold text-white">
              Yangi buyurtma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
