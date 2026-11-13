"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OLISH_USULLARI, somFormat, tolovUsullari, type OlishUsuli, type Taom, type TolovUsuli } from "@/lib/turlar";
import { savatchaniYoz } from "@/lib/sessiyaKlient";

export type SavatchaQatori = { taom: Taom; soni: number };

type Props = {
  qatorlar: SavatchaQatori[];
  soniniOzgartir: (taom: Taom, farq: number) => void;
};

type Manzil = { id: number; matn: string };
type Nuqta = { lat: number; lng: number };
type YetkazishHisob = { mumkin: true; km: number; narx: number } | { mumkin: false; km: number | null; sabab: string };

export default function Savatcha({ qatorlar, soniniOzgartir }: Props) {
  const router = useRouter();
  const [usul, setUsul] = useState<OlishUsuli>("OLIB_KETISH");
  const [vaqt, setVaqt] = useState("");
  const [tolovUsuli, setTolovUsuli] = useState<TolovUsuli>("CLICK");
  const [manzillar, setManzillar] = useState<Manzil[]>([]);
  const [manzil, setManzil] = useState("");
  const [nuqta, setNuqta] = useState<Nuqta | null>(null);
  const [joylashuvXato, setJoylashuvXato] = useState<string | null>(null);
  const [yetkazish, setYetkazish] = useState<YetkazishHisob | null>(null);
  const [promokod, setPromokod] = useState("");
  const [promo, setPromo] = useState<{ kod: string; foiz: number } | null>(null);
  const [promoXato, setPromoXato] = useState<string | null>(null);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  const taomlarSumma = qatorlar.reduce((s, q) => s + q.taom.narx * q.soni, 0);
  const chegirma = promo ? Math.floor((taomlarSumma * promo.foiz) / 100) : 0;
  const yetkazishNarxi = usul === "YETKAZISH" && yetkazish?.mumkin ? yetkazish.narx : 0;
  const jami = taomlarSumma - chegirma + yetkazishNarxi;
  const tugaganlar = qatorlar.filter((q) => q.taom.tugadi);

  // Kirgan mijozning saqlangan manzillari (kirmagan bo'lsa bo'sh qoladi)
  useEffect(() => {
    if (usul !== "YETKAZISH") return;
    fetch("/api/men/manzillar")
      .then((r) => (r.ok ? r.json() : []))
      .then(setManzillar)
      .catch(() => setManzillar([]));
  }, [usul]);

  // Yetkazish narxi joylashuv va summa o'zgarganda qayta hisoblanadi (minimal summa summaga bog'liq)
  useEffect(() => {
    if (usul !== "YETKAZISH" || !nuqta) return;
    fetch("/api/yetkazish/narx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuqta, summa: taomlarSumma }),
    })
      .then((r) => r.json())
      .then(setYetkazish)
      .catch(() => setYetkazish(null));
  }, [usul, nuqta, taomlarSumma]);

  // Naqd faqat yetkazishda — usul o'zgarsa to'lov usuli tekshiriladi
  const usulniTanla = (u: OlishUsuli) => {
    setUsul(u);
    if (!tolovUsullari(u).some((t) => t.qiymat === tolovUsuli)) setTolovUsuli("CLICK");
  };

  const joylashuvYubor = () => {
    setJoylashuvXato(null);
    if (!navigator.geolocation) return setJoylashuvXato("Brauzer joylashuvni bera olmaydi");
    navigator.geolocation.getCurrentPosition(
      (p) => setNuqta({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setJoylashuvXato("Joylashuvga ruxsat berilmadi"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const promoQolla = async () => {
    setPromoXato(null);
    const javob = await fetch("/api/promokod/tekshir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kod: promokod, summa: taomlarSumma }),
    });
    const data = await javob.json();
    if (javob.status === 401) return setPromoXato("Promokod uchun avval tizimga kiring");
    if (!javob.ok) return setPromoXato(data.xato ?? "Promokod qabul qilinmadi");
    setPromo({ kod: promokod.trim().toUpperCase(), foiz: data.foiz });
  };

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
          olishVaqti: vaqt,
          tolovUsuli,
          promokod: promo?.kod,
          yetkazish: usul === "YETKAZISH" ? { manzil, ...nuqta } : undefined,
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
      router.push(data.tolovUrl ?? `/zakaz/${data.id}`);
    } catch (e) {
      setXato(e instanceof Error ? e.message : "Zakaz yuborilmadi");
      setYuborilmoqda(false);
    }
  };

  const tanlov = (faol: boolean) =>
    `cursor-pointer rounded-lg border px-3 py-2 text-sm ${faol ? "border-emerald-600 bg-emerald-50" : "border-stone-300"}`;
  const maydon = "w-full rounded-lg border border-stone-300 px-3 py-2";
  const qator = "flex justify-between";

  const yetkazishTayyor = usul !== "YETKAZISH" || (yetkazish?.mumkin && manzil.trim().length >= 5);

  return (
    <section className="mt-8 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Savatcha</h2>

      {qatorlar.length === 0 ? (
        <p className="text-stone-500">Savatcha bo&apos;sh — menyudan taom qo&apos;shing.</p>
      ) : (
        <>
          <ul className="divide-y divide-stone-100">
            {qatorlar.map((q) => (
              <li key={q.taom.id} className="flex items-center justify-between gap-2 py-2">
                <span className={q.taom.tugadi ? "text-stone-400 line-through" : ""}>
                  {q.taom.nom}
                  {q.taom.tugadi && <span className="ml-1 text-xs text-red-600 no-underline">tugadi</span>}
                </span>
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
                  <span className="w-24 text-right text-stone-700">{somFormat(q.taom.narx * q.soni)}</span>
                </div>
              </li>
            ))}
          </ul>

          <fieldset className="mt-5">
            <legend className="mb-2 font-medium">Olish usuli</legend>
            <div className="flex flex-wrap gap-2">
              {OLISH_USULLARI.map((u) => (
                <label key={u.qiymat} className={tanlov(usul === u.qiymat)}>
                  <input
                    type="radio"
                    name="usul"
                    value={u.qiymat}
                    checked={usul === u.qiymat}
                    onChange={() => usulniTanla(u.qiymat)}
                    className="sr-only"
                  />
                  {u.nom}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="mb-1 block font-medium">{usul === "YETKAZISH" ? "Yetkazish vaqti" : "Olish vaqti"}</span>
            <input
              type="time"
              value={vaqt}
              onChange={(e) => setVaqt(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>

          {usul === "YETKAZISH" && (
            <div className="mt-4 space-y-2">
              <span className="block font-medium">Yetkazish manzili</span>
              {manzillar.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {manzillar.map((m) => (
                    <button key={m.id} type="button" onClick={() => setManzil(m.matn)} className={tanlov(manzil === m.matn)}>
                      {m.matn}
                    </button>
                  ))}
                </div>
              )}
              <input
                value={manzil}
                onChange={(e) => setManzil(e.target.value)}
                className={maydon}
                placeholder="Ko'cha, uy, xonadon, mo'ljal"
              />
              <button
                type="button"
                onClick={joylashuvYubor}
                className="rounded-lg border border-emerald-600 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              >
                📍 {nuqta ? "Joylashuvni yangilash" : "Joylashuvimni yuborish"}
              </button>
              {joylashuvXato && <p className="text-sm text-red-600">{joylashuvXato}</p>}
              {yetkazish && !yetkazish.mumkin && <p className="text-sm text-red-600">{yetkazish.sabab}</p>}
              {yetkazish?.mumkin && (
                <p className="text-sm text-stone-600">
                  Masofa {yetkazish.km} km · yetkazish {somFormat(yetkazish.narx)}
                </p>
              )}
            </div>
          )}

          <fieldset className="mt-4">
            <legend className="mb-2 font-medium">To&apos;lov</legend>
            <div className="flex flex-wrap gap-2">
              {tolovUsullari(usul).map((t) => (
                <label key={t.qiymat} className={tanlov(tolovUsuli === t.qiymat)}>
                  <input
                    type="radio"
                    name="tolov"
                    value={t.qiymat}
                    checked={tolovUsuli === t.qiymat}
                    onChange={() => setTolovUsuli(t.qiymat)}
                    className="sr-only"
                  />
                  {t.nom}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4">
            {promo ? (
              <p className="text-sm text-emerald-700">
                Promokod {promo.kod}: −{promo.foiz}%{" "}
                <button type="button" onClick={() => setPromo(null)} className="ml-1 text-stone-500 underline">
                  olib tashlash
                </button>
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promokod}
                  onChange={(e) => setPromokod(e.target.value)}
                  className={maydon}
                  placeholder="Promokod"
                />
                <button type="button" onClick={promoQolla} className="rounded-lg border border-stone-300 px-3 text-sm">
                  Qo&apos;llash
                </button>
              </div>
            )}
            {promoXato && <p className="mt-1 text-sm text-red-600">{promoXato}</p>}
          </div>

          <div className="mt-4 space-y-1 border-t border-stone-200 pt-3 text-sm">
            <div className={qator}>
              <span>Taomlar</span>
              <span>{somFormat(taomlarSumma)}</span>
            </div>
            {chegirma > 0 && (
              <div className={`${qator} text-emerald-700`}>
                <span>Chegirma</span>
                <span>−{somFormat(chegirma)}</span>
              </div>
            )}
            {usul === "YETKAZISH" && (
              <div className={qator}>
                <span>Yetkazish</span>
                <span>{yetkazish?.mumkin ? somFormat(yetkazishNarxi) : "—"}</span>
              </div>
            )}
            <div className={`${qator} pt-1 text-base font-semibold`}>
              <span>Jami</span>
              <span data-testid="jami">{somFormat(jami)}</span>
            </div>
          </div>

          {tugaganlar.length > 0 && (
            <p className="mt-3 text-red-600">Tugagan taomlarni savatchadan olib tashlang.</p>
          )}
          {xato && <p className="mt-3 text-red-600">{xato}</p>}

          <button
            onClick={zakazBer}
            disabled={yuborilmoqda || !vaqt || !yetkazishTayyor || tugaganlar.length > 0}
            className="mt-5 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {yuborilmoqda
              ? "Yuborilmoqda..."
              : tolovUsuli === "NAQD"
                ? "Zakaz berish"
                : `To'lashga o'tish — ${somFormat(jami)}`}
          </button>
          {!vaqt && <p className="mt-2 text-center text-sm text-stone-500">Avval vaqtni tanlang</p>}
        </>
      )}
    </section>
  );
}
