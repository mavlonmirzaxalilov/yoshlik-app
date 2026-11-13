"use client";

import { useCallback, useEffect, useState } from "react";
import { HOLAT_NOMLARI, keyingiHolat } from "@/lib/holatlar";
import { somFormat, tolovNomi, usulNomi, type Zakaz } from "@/lib/turlar";
import HolatBelgisi from "@/components/HolatBelgisi";

type AdminZakaz = Zakaz & { mijoz: { ism: string | null; telefon: string | null } | null };

export default function AdminZakazlar() {
  const [zakazlar, setZakazlar] = useState<AdminZakaz[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState<number | null>(null);

  const yukla = useCallback(
    () =>
      fetch("/api/admin/zakazlar")
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.xato ?? "Yuklab bo'lmadi");
          setZakazlar(data);
        })
        .catch((e: Error) => setXato(e.message)),
    [],
  );

  useEffect(() => {
    yukla();
  }, [yukla]);

  const otkaz = async (z: AdminZakaz, holat: string) => {
    setBand(z.id);
    setXato(null);
    const javob = await fetch(`/api/admin/zakazlar/${z.id}/holat`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holat }),
    });
    const data = await javob.json();
    if (!javob.ok) setXato(`#${z.raqam}: ${data.xato ?? "xatolik"}`);
    await yukla();
    setBand(null);
  };

  if (!zakazlar) return xato ? <p className="text-red-600">{xato}</p> : <p className="text-stone-500">Yuklanmoqda...</p>;
  if (!zakazlar.length) return <p className="text-stone-600">Bugun hali zakaz yo&apos;q.</p>;

  return (
    <>
      {xato && <p className="mb-3 text-red-600">{xato}</p>}
      <ul className="space-y-3">
        {zakazlar.map((z) => {
          const keyingi = keyingiHolat(z.holat, z.olishUsuli);
          return (
            <li key={z.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold">
                  #{z.raqam} <HolatBelgisi holat={z.holat} />
                </span>
                <span className="font-semibold">{somFormat(z.jamiSumma)}</span>
              </div>
              <div className="mt-1 text-sm text-stone-600">
                {usulNomi(z.olishUsuli)}
                {z.olishVaqti && ` · ${z.olishVaqti}`} · {tolovNomi(z.tolovUsuli)}
              </div>
              {z.yetkazishManzil && <div className="text-sm text-stone-600">📍 {z.yetkazishManzil}</div>}
              <div className="text-sm text-stone-600">
                {z.mijoz ? `${z.mijoz.ism ?? "Ismsiz"} · ${z.mijoz.telefon}` : "Mijoz bog'lanmagan (S1/S2 zakazi)"}
              </div>
              <div className="mt-1 text-sm text-stone-500">{z.qatorlar.map((q) => `${q.nom} × ${q.soni}`).join(", ")}</div>
              {keyingi && (
                <button
                  onClick={() => otkaz(z, keyingi)}
                  disabled={band === z.id}
                  className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  → {HOLAT_NOMLARI[keyingi]}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
