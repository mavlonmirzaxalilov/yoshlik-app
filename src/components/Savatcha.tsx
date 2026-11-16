"use client";

import { api, telegramWebApp } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, MapPin, Minus, Plus, ShoppingBag, Utensils } from "lucide-react";
import { OLISH_USULLARI, somFormat, tolovUsullari, type OlishUsuli, type TolovUsuli } from "@/lib/turlar";
import { useSavatcha } from "@/components/SavatchaProvider";
import TaomRasmi from "@/components/TaomRasmi";
import { Karta, maydon, tugmaAsosiy } from "@/components/ui";

type Manzil = { id: number; matn: string };
type Nuqta = { lat: number; lng: number };
type YetkazishHisob = { mumkin: true; km: number; narx: number } | { mumkin: false; km: number | null; sabab: string };

export default function Savatcha() {
  const router = useRouter();
  const { qatorlar, soniniOzgartir, tozala, tiklandi } = useSavatcha();
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
  const [raqamKerak, setRaqamKerak] = useState(false);

  const taomlarSumma = qatorlar.reduce((s, q) => s + q.taom.narx * q.soni, 0);
  const chegirma = promo ? Math.floor((taomlarSumma * promo.foiz) / 100) : 0;
  const yetkazishNarxi = usul === "YETKAZISH" && yetkazish?.mumkin ? yetkazish.narx : 0;
  const jami = taomlarSumma - chegirma + yetkazishNarxi;
  const tugaganlar = qatorlar.filter((q) => q.taom.tugadi);

  // Kirgan mijozning saqlangan manzillari (kirmagan bo'lsa bo'sh qoladi)
  useEffect(() => {
    if (usul !== "YETKAZISH") return;
    api("/api/men/manzillar")
      .then((r) => (r.ok ? r.json() : []))
      .then(setManzillar)
      .catch(() => setManzillar([]));
  }, [usul]);

  // Yetkazish narxi joylashuv va summa o'zgarganda qayta hisoblanadi (minimal summa summaga bog'liq)
  useEffect(() => {
    if (usul !== "YETKAZISH" || !nuqta) return;
    api("/api/yetkazish/narx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuqta, summa: taomlarSumma }),
    })
      .then((r) => r.json())
      .then(setYetkazish)
      .catch(() => setYetkazish(null));
  }, [usul, nuqta, taomlarSumma]);

  // Telegram ichida raqami yo'q mijoz (menyu tugmasidan to'g'ridan-to'g'ri kirgan) — raqam so'raladi
  useEffect(() => {
    if (!telegramWebApp()) return;
    api("/api/men")
      .then((r) => r.json())
      .then((d) => setRaqamKerak(Boolean(d.mijoz) && !d.mijoz.telefon))
      .catch(() => {});
  }, []);

  const raqamUlash = () => {
    telegramWebApp()?.requestContact?.(async (ok) => {
      if (!ok) return;
      // Raqam bot webhook orqali keladi — bir necha soniya ichida tekshiramiz
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const d = await api("/api/men").then((r) => r.json());
        if (d.mijoz?.telefon) return setRaqamKerak(false);
      }
    });
  };

  // Naqd faqat yetkazishda — usul o'zgarsa to'lov usuli tekshiriladi
  const usulniTanla = (u: OlishUsuli) => {
    setUsul(u);
    if (!tolovUsullari(u).some((t) => t.qiymat === tolovUsuli)) setTolovUsuli("CLICK");
  };

  const joylashuvYubor = () => {
    setJoylashuvXato(null);
    // Telegram ichida — Telegram'ning o'z joylashuv so'rovi (Bot API 8.0+), bo'lmasa brauzer geolokatsiyasi
    const lm = telegramWebApp()?.LocationManager;
    if (lm) {
      const ol = () =>
        lm.getLocation((d) =>
          d ? setNuqta({ lat: d.latitude, lng: d.longitude }) : setJoylashuvXato("Joylashuvga ruxsat berilmadi"),
        );
      return lm.isInited ? ol() : lm.init(ol);
    }
    if (!navigator.geolocation) return setJoylashuvXato("Brauzer joylashuvni bera olmaydi");
    navigator.geolocation.getCurrentPosition(
      (p) => setNuqta({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setJoylashuvXato("Joylashuvga ruxsat berilmadi"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const promoQolla = async () => {
    setPromoXato(null);
    const javob = await api("/api/promokod/tekshir", {
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
      const javob = await api("/api/zakazlar", {
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
        router.push("/kirish?qaytish=/savat");
        return;
      }
      if (!javob.ok) throw new Error(data.xato ?? "Zakaz yuborilmadi");
      tozala();
      router.push(data.tolovUrl ?? `/zakaz/${data.id}`);
    } catch (e) {
      setXato(e instanceof Error ? e.message : "Zakaz yuborilmadi");
      setYuborilmoqda(false);
    }
  };

  const USUL_IKONA = { ZAL: Utensils, OLIB_KETISH: ShoppingBag, YETKAZISH: Bike } as const;
  const tanlov = (faol: boolean) =>
    `flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium ${
      faol ? "border-asosiy bg-shaftoli text-asosiy-toq" : "border-stone-200 bg-white text-stone-700"
    }`;
  const qator = "flex justify-between";
  const bolimSarlavha = "mb-3 font-bold";

  const yetkazishTayyor = usul !== "YETKAZISH" || (yetkazish?.mumkin && manzil.trim().length >= 5);

  if (!tiklandi) return <p className="text-xira">Yuklanmoqda...</p>;

  if (qatorlar.length === 0) {
    return (
      <Karta className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-shaftoli text-asosiy-toq">
          <ShoppingBag size={28} />
        </span>
        <p className="text-xira">Savat bo&apos;sh — menyudan taom qo&apos;shing.</p>
        <Link href="/" className="font-semibold text-asosiy">
          Menyuga o&apos;tish
        </Link>
      </Karta>
    );
  }

  return (
    <div className="space-y-4">
      <Karta>
        <ul className="divide-y divide-stone-100">
          {qatorlar.map((q) => (
            <li key={q.taom.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <TaomRasmi taom={q.taom} />
              <div className="min-w-0 flex-1">
                <div className={`truncate font-semibold ${q.taom.tugadi ? "text-stone-400 line-through" : ""}`}>
                  {q.taom.nom}
                </div>
                {q.taom.tugadi ? (
                  <div className="text-xs font-medium text-qizil">tugadi</div>
                ) : (
                  <div className="font-bold text-asosiy">{somFormat(q.taom.narx * q.soni)}</div>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-stone-100 p-1">
                <button
                  onClick={() => soniniOzgartir(q.taom, -1)}
                  aria-label={`${q.taom.nom} sonini kamaytirish`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white"
                >
                  <Minus size={16} />
                </button>
                <span className="w-5 text-center font-semibold">{q.soni}</span>
                <button
                  onClick={() => soniniOzgartir(q.taom, 1)}
                  aria-label={`${q.taom.nom} sonini oshirish`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-asosiy text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Karta>

      <Karta>
        <fieldset>
          <legend className={bolimSarlavha}>Olish usuli</legend>
          <div className="grid grid-cols-3 gap-2">
            {OLISH_USULLARI.map((u) => {
              const Ikona = USUL_IKONA[u.qiymat];
              return (
                <label key={u.qiymat} className={tanlov(usul === u.qiymat)}>
                  <input
                    type="radio"
                    name="usul"
                    value={u.qiymat}
                    checked={usul === u.qiymat}
                    onChange={() => usulniTanla(u.qiymat)}
                    className="sr-only"
                  />
                  <Ikona size={16} className="shrink-0" />
                  {u.qiymat === "YETKAZISH" ? "Yetkazish" : u.nom}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-xira">
            {usul === "YETKAZISH" ? "Yetkazish vaqti" : "Olish vaqti"}
          </span>
          <input type="time" value={vaqt} onChange={(e) => setVaqt(e.target.value)} className={maydon} />
        </label>

        {usul === "YETKAZISH" && (
          <div className="mt-4 space-y-2">
            <span className="block text-sm font-medium text-xira">Yetkazish manzili</span>
            {manzillar.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {manzillar.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setManzil(m.matn)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm ${
                      manzil === m.matn ? "border-asosiy bg-shaftoli text-asosiy-toq" : "border-stone-200"
                    }`}
                  >
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
              className="flex items-center gap-1.5 rounded-xl border border-asosiy px-3 py-2 text-sm font-medium text-asosiy-toq hover:bg-shaftoli"
            >
              <MapPin size={16} /> {nuqta ? "Joylashuvni yangilash" : "Joylashuvimni yuborish"}
            </button>
            {joylashuvXato && <p className="text-sm text-qizil">{joylashuvXato}</p>}
            {yetkazish && !yetkazish.mumkin && <p className="text-sm text-qizil">{yetkazish.sabab}</p>}
            {yetkazish?.mumkin && (
              <p className="text-sm text-xira">
                Masofa {yetkazish.km} km · yetkazish {somFormat(yetkazish.narx)}
              </p>
            )}
          </div>
        )}
      </Karta>

      <Karta>
        <fieldset>
          <legend className={bolimSarlavha}>To&apos;lov</legend>
          <div className="grid grid-cols-3 gap-2">
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
                {t.qiymat === "NAQD" ? "Naqd" : t.nom}
              </label>
            ))}
          </div>
          {tolovUsuli === "NAQD" && <p className="mt-2 text-sm text-xira">Kuryerga naqd to&apos;lanadi</p>}
        </fieldset>

        <div className="mt-4">
          {promo ? (
            <p className="text-sm font-medium text-yashil">
              Promokod {promo.kod}: −{promo.foiz}%{" "}
              <button type="button" onClick={() => setPromo(null)} className="ml-1 font-normal text-xira underline">
                olib tashlash
              </button>
            </p>
          ) : (
            <div className="flex gap-2">
              <input value={promokod} onChange={(e) => setPromokod(e.target.value)} className={maydon} placeholder="Promokod" />
              <button
                type="button"
                onClick={promoQolla}
                className="shrink-0 rounded-xl border border-stone-300 px-4 text-sm font-medium"
              >
                Qo&apos;llash
              </button>
            </div>
          )}
          {promoXato && <p className="mt-1 text-sm text-qizil">{promoXato}</p>}
        </div>
      </Karta>

      <Karta className="border-shaftoli-chegara bg-shaftoli/60">
        <div className="space-y-1.5 text-sm">
          <div className={qator}>
            <span className="text-xira">Taomlar</span>
            <span>{somFormat(taomlarSumma)}</span>
          </div>
          {chegirma > 0 && (
            <div className={`${qator} text-yashil`}>
              <span>Chegirma</span>
              <span>−{somFormat(chegirma)}</span>
            </div>
          )}
          {usul === "YETKAZISH" && (
            <div className={qator}>
              <span className="text-xira">Yetkazish</span>
              <span>{yetkazish?.mumkin ? somFormat(yetkazishNarxi) : "—"}</span>
            </div>
          )}
          <div className={`${qator} border-t border-shaftoli-chegara pt-2 text-lg font-bold`}>
            <span>Jami</span>
            <span data-testid="jami" className="text-asosiy">
              {somFormat(jami)}
            </span>
          </div>
        </div>
      </Karta>

      {tugaganlar.length > 0 && <p className="text-qizil">Tugagan taomlarni savatdan olib tashlang.</p>}
      {xato && <p className="text-qizil">{xato}</p>}

      {raqamKerak && (
        <div className="rounded-karta bg-amber-50 p-4 text-sm text-amber-900">
          Zakaz berish uchun telefon raqamingizni ulashing.
          <button
            type="button"
            onClick={raqamUlash}
            className="mt-2 block w-full rounded-xl border border-amber-600 py-2.5 font-medium"
          >
            📱 Raqamni ulashish
          </button>
        </div>
      )}

      <button
        onClick={zakazBer}
        disabled={yuborilmoqda || raqamKerak || !vaqt || !yetkazishTayyor || tugaganlar.length > 0}
        className={tugmaAsosiy}
      >
        {yuborilmoqda
          ? "Yuborilmoqda..."
          : tolovUsuli === "NAQD"
            ? "Zakaz berish"
            : `To'lashga o'tish — ${somFormat(jami)}`}
      </button>
      {!vaqt && <p className="text-center text-sm text-xira">Avval vaqtni tanlang</p>}
    </div>
  );
}
