"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BEKOR_MUMKIN, HOLAT_NOMLARI } from "@/lib/holatlar";
import { somFormat, tolovNomi, usulNomi, type Zakaz } from "@/lib/turlar";
import HolatBelgisi from "@/components/HolatBelgisi";
import BosqichShkala from "@/components/BosqichShkala";
import { Sarlavha } from "@/components/ui";

export default function ZakazTasdiq() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [zakaz, setZakaz] = useState<Zakaz | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState(false);

  const yukla = useCallback(
    () =>
      api(`/api/zakazlar/${id}`)
        .then(async (r) => {
          const data = await r.json();
          if (r.status === 401) {
            router.replace(`/kirish?qaytish=/zakaz/${id}`);
            return;
          }
          if (!r.ok) throw new Error(data.xato ?? "Zakaz topilmadi");
          setZakaz(data);
        })
        .catch((e: Error) => setXato(e.message)),
    [id, router],
  );

  useEffect(() => {
    yukla();
  }, [yukla]);

  const bekorQil = async () => {
    if (!confirm("Zakazni bekor qilasizmi?")) return;
    setBand(true);
    setXato(null);
    const javob = await api(`/api/zakazlar/${id}/bekor`, { method: "POST" });
    const data = await javob.json();
    if (!javob.ok) setXato(data.xato ?? "Bekor qilib bo'lmadi");
    await yukla();
    setBand(false);
  };

  const kutilayotganTolov = zakaz?.tolovlar?.find((t) => t.holat === "KUTILMOQDA");
  const qaytarildi = zakaz?.tolovlar?.some((t) => t.holat === "QAYTARILDI");

  const faol = zakaz && !["TOLOV_KUTILMOQDA", "BERILDI", "BEKOR"].includes(zakaz.holat);

  return (
    <>
      <Sarlavha sarlavha={zakaz ? `Buyurtma #${zakaz.raqam}` : "Buyurtma"} />
      <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-5">
      {xato && <p className="mb-3 text-qizil">{xato}</p>}
      {!zakaz && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}

      {zakaz && faol && (
        <div className="mb-4 rounded-karta border border-shaftoli-chegara bg-shaftoli/70 p-4">
          <BosqichShkala holat={zakaz.holat} olishUsuli={zakaz.olishUsuli} />
        </div>
      )}

      {zakaz && (
        <section className="rounded-karta border border-stone-200/80 bg-white p-5 shadow-karta">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">Zakaz #{zakaz.raqam}</h1>
            <HolatBelgisi holat={zakaz.holat} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-y-2">
            <dt className="text-stone-600">Olish usuli</dt>
            <dd className="font-medium">{usulNomi(zakaz.olishUsuli)}</dd>
            {zakaz.olishVaqti && (
              <>
                <dt className="text-stone-600">{zakaz.olishUsuli === "YETKAZISH" ? "Yetkazish vaqti" : "Olish vaqti"}</dt>
                <dd className="text-xl font-bold">{zakaz.olishVaqti}</dd>
              </>
            )}
            {zakaz.yetkazishManzil && (
              <>
                <dt className="text-stone-600">Manzil</dt>
                <dd>
                  {zakaz.yetkazishManzil}
                  {zakaz.masofaKm !== null && <span className="text-stone-500"> · {zakaz.masofaKm} km</span>}
                </dd>
              </>
            )}
            {zakaz.tolovUsuli && (
              <>
                <dt className="text-stone-600">To&apos;lov</dt>
                <dd>
                  {tolovNomi(zakaz.tolovUsuli)}
                  {qaytarildi && <span className="text-asosiy-toq"> · pul qaytarildi</span>}
                </dd>
              </>
            )}
          </dl>

          <ul className="mt-5 divide-y divide-stone-100 border-t border-stone-200">
            {zakaz.qatorlar.map((q) => (
              <li key={q.id} className="flex justify-between py-2">
                <span>
                  {q.nom} × {q.soni}
                </span>
                <span>{somFormat(q.narx * q.soni)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-stone-200 pt-3 text-sm">
            {zakaz.chegirma > 0 && (
              <div className="flex justify-between text-asosiy-toq">
                <span>Chegirma</span>
                <span>−{somFormat(zakaz.chegirma)}</span>
              </div>
            )}
            {zakaz.yetkazishNarxi > 0 && (
              <div className="flex justify-between">
                <span>Yetkazish</span>
                <span>{somFormat(zakaz.yetkazishNarxi)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Jami</span>
              <span className="text-asosiy">{somFormat(zakaz.jamiSumma)}</span>
            </div>
          </div>

          {zakaz.holat === "TOLOV_KUTILMOQDA" && kutilayotganTolov && (
            <button
              onClick={() => router.push(`/tolov/${kutilayotganTolov.id}`)}
              className="mt-5 w-full rounded-xl bg-asosiy py-3 font-semibold text-white hover:bg-asosiy-toq"
            >
              To&apos;lashga o&apos;tish
            </button>
          )}
          {zakaz.holat === "TAYYOR" && zakaz.olishUsuli !== "YETKAZISH" && (
            <p className="mt-5 font-medium text-asosiy-toq">Zakazingiz tayyor — kassada raqamni ayting.</p>
          )}
          {BEKOR_MUMKIN.includes(zakaz.holat) && (
            <button
              onClick={bekorQil}
              disabled={band}
              className="mt-3 w-full rounded-xl border border-red-300 py-3 text-qizil hover:bg-qizil-fon disabled:opacity-60"
            >
              Zakazni bekor qilish
            </button>
          )}
          {zakaz.holat === "BEKOR" && <p className="mt-5 text-stone-600">{HOLAT_NOMLARI.BEKOR}.</p>}
        </section>
      )}

      <Link href="/zakazlarim" className="mt-6 inline-block font-medium text-asosiy">
        ← Buyurtmalarga qaytish
      </Link>
      </main>
    </>
  );
}
