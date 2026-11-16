"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Phone, Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import { HOLAT_NOMLARI, keyingiHolat, type ZakazHolati } from "@/lib/holatlar";
import { tolovNomi, usulNomi, type Zakaz } from "@/lib/turlar";
import HolatBelgisi from "@/components/HolatBelgisi";
import { useAdmin } from "@/components/admin/AdminKontekst";

type AdminZakaz = Zakaz & {
  manba: "ONLAYN" | "KASSA";
  bekorSababi: string | null;
  mijoz: { ism: string | null; telefon: string | null } | null;
  xodim: { ism: string | null } | null;
  oshxonaChek: string | null;
  kassaChek: string | null;
};

const USTUNLAR: { nom: string; holatlar: ZakazHolati[] }[] = [
  { nom: "Yangi", holatlar: ["TOLANDI", "QABUL_QILINDI"] },
  { nom: "Tayyorlanmoqda", holatlar: ["TAYYORLANMOQDA"] },
  { nom: "Tayyor · Yo'lda", holatlar: ["TAYYOR", "YOLDA"] },
];

const bugun = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date());
const soat = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// Yangi zakaz kelganda qisqa signal (fayl kerak emas)
function signal() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {
    /* ovoz bo'lmasa ham ishlayveradi */
  }
}

export default function ZakazlarSahifasi() {
  const { men, qidiruv } = useAdmin();
  const [sana, setSana] = useState(bugun);
  const [usul, setUsul] = useState("");
  const [manba, setManba] = useState("");
  const [zakazlar, setZakazlar] = useState<AdminZakaz[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState<number | null>(null);
  const [bekor, setBekor] = useState<AdminZakaz | null>(null);
  const [sabab, setSabab] = useState("");
  const [yangiSoni, setYangiSoni] = useState(0);
  const korilgan = useRef<Set<number> | null>(null);

  const yukla = useCallback(async () => {
    const p = new URLSearchParams({ sana, ...(usul && { usul }), ...(manba && { manba }), ...(qidiruv.trim() && { q: qidiruv.trim() }) });
    const r = await api(`/api/admin/zakazlar?${p}`);
    const data = await r.json();
    if (!r.ok) return setXato(data.xato ?? "Yuklab bo'lmadi");
    setXato(null);
    const idlar = new Set<number>(data.map((z: AdminZakaz) => z.id));
    if (korilgan.current) {
      const yangi = data.filter((z: AdminZakaz) => !korilgan.current!.has(z.id)).length;
      if (yangi > 0) {
        setYangiSoni((s) => s + yangi);
        signal();
      }
    }
    korilgan.current = idlar;
    setZakazlar(data);
  }, [sana, usul, manba, qidiruv]);

  useEffect(() => {
    korilgan.current = null; // filtr o'zgarsa "yangi" hisoblanmasin
    Promise.resolve().then(yukla);
    const t = setInterval(yukla, 15_000);
    return () => clearInterval(t);
  }, [yukla]);

  const otkaz = async (z: AdminZakaz, holat: string) => {
    setBand(z.id);
    const r = await api(`/api/admin/zakazlar/${z.id}/holat`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holat }),
    });
    if (!r.ok) setXato(`#${z.raqam}: ${(await r.json()).xato ?? "xatolik"}`);
    await yukla();
    setBand(null);
  };

  const bekorQil = async () => {
    if (!bekor) return;
    setBand(bekor.id);
    const r = await api(`/api/admin/zakazlar/${bekor.id}/bekor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sabab }),
    });
    const d = await r.json();
    setBand(null);
    if (!r.ok) return setXato(d.xato ?? "Bekor qilib bo'lmadi");
    setBekor(null);
    setSabab("");
    yukla();
  };

  const chekQayta = async (z: AdminZakaz) => {
    setBand(z.id);
    const r = await api(`/api/admin/zakazlar/${z.id}/chek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tur: "ikkalasi" }),
    });
    if (!r.ok) setXato(`#${z.raqam}: ${(await r.json()).xato ?? "chek chiqmadi"}`);
    await yukla();
    setBand(null);
  };

  const bekorQilaOladi = men.rol === "ADMIN" || men.rol === "KASSIR";
  const yakunlangan = zakazlar?.filter((z) => z.holat === "BERILDI" || z.holat === "BEKOR") ?? [];
  const kutilmoqda = zakazlar?.filter((z) => z.holat === "TOLOV_KUTILMOQDA") ?? [];
  const select = "rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm";

  const karta = (z: AdminZakaz) => {
    const keyingi = keyingiHolat(z.holat, z.olishUsuli);
    return (
      <div key={z.id} className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-extrabold text-panel">#{z.raqam}</div>
            <div className="text-xs text-stone-500">
              {soat(z.yaratilgan)} · {z.manba === "KASSA" ? `Kassa${z.xodim?.ism ? ` (${z.xodim.ism})` : ""}` : "Bot"}
            </div>
          </div>
          <HolatBelgisi holat={z.holat} />
        </div>
        <div className="mt-2 text-sm font-medium text-panel">
          {usulNomi(z.olishUsuli)}
          {z.olishVaqti && <span className="ml-1 rounded-md bg-faol-och px-1.5 py-0.5 font-bold text-faol">{z.olishVaqti}</span>}
          <span className="text-stone-500"> · {tolovNomi(z.tolovUsuli)}</span>
        </div>
        {z.mijoz && (
          <div className="mt-1 flex items-center gap-1 text-sm text-stone-600">
            {z.mijoz.ism ?? "Mijoz"} ·
            <a href={`tel:${z.mijoz.telefon}`} className="inline-flex items-center gap-1 text-faol">
              <Phone size={13} /> {z.mijoz.telefon}
            </a>
          </div>
        )}
        {z.yetkazishManzil && <div className="mt-1 text-sm text-stone-600">📍 {z.yetkazishManzil}</div>}
        <ul className="mt-2 space-y-0.5 border-t border-stone-100 pt-2 text-sm">
          {z.qatorlar.map((q) => (
            <li key={q.id} className="flex justify-between">
              <span>{q.nom}</span>
              <span className="font-semibold">× {q.soni}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-panel">{z.jamiSumma.toLocaleString("ru-RU")}</span>
          {z.manba === "ONLAYN" && z.holat !== "TOLOV_KUTILMOQDA" && z.holat !== "BEKOR" && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Printer size={13} />
              {z.oshxonaChek && z.kassaChek ? "Chek chiqdi" : "Chek kutilmoqda"}
              {bekorQilaOladi && z.oshxonaChek && z.kassaChek && (
                <button onClick={() => chekQayta(z)} disabled={band === z.id} className="ml-1 font-medium text-faol">
                  Qayta
                </button>
              )}
            </span>
          )}
        </div>
        {z.bekorSababi && <p className="mt-1 text-xs text-red-600">Sabab: {z.bekorSababi}</p>}
        <div className="mt-3 flex gap-2">
          {keyingi && (
            <button
              onClick={() => otkaz(z, keyingi)}
              disabled={band === z.id}
              className="flex-1 rounded-xl bg-faol py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              → {HOLAT_NOMLARI[keyingi]}
            </button>
          )}
          {bekorQilaOladi && z.holat !== "BERILDI" && z.holat !== "BEKOR" && (
            <button onClick={() => setBekor(z)} className="rounded-xl border border-red-200 px-3 text-sm text-red-600">
              Bekor
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={sana} onChange={(e) => setSana(e.target.value)} className={select} />
        <select value={usul} onChange={(e) => setUsul(e.target.value)} className={select}>
          <option value="">Barcha usullar</option>
          <option value="ZAL">Zalda</option>
          <option value="OLIB_KETISH">Olib ketish</option>
          <option value="YETKAZISH">Yetkazish</option>
        </select>
        <select value={manba} onChange={(e) => setManba(e.target.value)} className={select}>
          <option value="">Bot va kassa</option>
          <option value="ONLAYN">Faqat bot</option>
          <option value="KASSA">Faqat kassa</option>
        </select>
        {yangiSoni > 0 && (
          <button onClick={() => setYangiSoni(0)} className="flex items-center gap-1 rounded-xl bg-tolov px-3 py-2 text-sm font-bold text-white">
            <Bell size={16} /> {yangiSoni} ta yangi zakaz
          </button>
        )}
        <span className="ml-auto text-xs text-stone-400">har 15 soniyada yangilanadi</span>
      </div>

      {xato && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{xato}</p>}
      {!zakazlar && <p className="text-stone-500">Yuklanmoqda...</p>}

      {zakazlar && (
        <div className="grid gap-4 md:grid-cols-3">
          {USTUNLAR.map((u) => {
            const ichida = zakazlar.filter((z) => u.holatlar.includes(z.holat)).reverse(); // eskisi tepada — navbat
            return (
              <section key={u.nom} className="min-w-0 rounded-2xl bg-white/50 p-3">
                <h2 className="mb-3 flex items-center justify-between px-1 font-bold text-panel">
                  {u.nom}
                  <span className="rounded-full bg-panel px-2.5 py-0.5 text-sm text-white">{ichida.length}</span>
                </h2>
                <div className="space-y-3">{ichida.map(karta)}</div>
                {!ichida.length && <p className="py-6 text-center text-sm text-stone-400">Bo&apos;sh</p>}
              </section>
            );
          })}
        </div>
      )}

      {kutilmoqda.length > 0 && (
        <p className="text-sm text-stone-500">
          To&apos;lov kutilayotgan zakazlar: {kutilmoqda.map((z) => `#${z.raqam}`).join(", ")} (15 daqiqada to&apos;lanmasa bekor bo&apos;ladi)
        </p>
      )}

      {yakunlangan.length > 0 && (
        <details className="rounded-2xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-bold text-panel">Yakunlangan va bekor qilingan ({yakunlangan.length})</summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{yakunlangan.map(karta)}</div>
        </details>
      )}

      {bekor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBekor(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-panel">Zakaz #{bekor.raqam} — bekor qilish</h2>
              <button onClick={() => setBekor(null)} aria-label="Yopish">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-stone-600">Sabab mijozga bot orqali yuboriladi. To&apos;langan bo&apos;lsa pul qaytariladi.</p>
            <textarea
              value={sabab}
              onChange={(e) => setSabab(e.target.value)}
              rows={3}
              placeholder="Masalan: taom tugadi, mijoz rad etdi..."
              className="mt-3 w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-faol"
            />
            <button
              onClick={bekorQil}
              disabled={band === bekor.id || sabab.trim().length < 3}
              className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
