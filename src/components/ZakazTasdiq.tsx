"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BEKOR_MUMKIN, HOLAT_NOMLARI } from "@/lib/holatlar";
import { somFormat, tolovNomi, usulNomi, type Zakaz } from "@/lib/turlar";
import HolatBelgisi from "@/components/HolatBelgisi";

export default function ZakazTasdiq() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [zakaz, setZakaz] = useState<Zakaz | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState(false);

  const yukla = useCallback(
    () =>
      fetch(`/api/zakazlar/${id}`)
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
    const javob = await fetch(`/api/zakazlar/${id}/bekor`, { method: "POST" });
    const data = await javob.json();
    if (!javob.ok) setXato(data.xato ?? "Bekor qilib bo'lmadi");
    await yukla();
    setBand(false);
  };

  const kutilayotganTolov = zakaz?.tolovlar?.find((t) => t.holat === "KUTILMOQDA");
  const qaytarildi = zakaz?.tolovlar?.some((t) => t.holat === "QAYTARILDI");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      {xato && <p className="mb-3 text-red-600">{xato}</p>}
      {!zakaz && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}

      {zakaz && (
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <HolatBelgisi holat={zakaz.holat} />
          <h1 className="mt-2 text-3xl font-bold">Zakaz #{zakaz.raqam}</h1>

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
                  {qaytarildi && <span className="text-emerald-700"> · pul qaytarildi</span>}
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
              <div className="flex justify-between text-emerald-700">
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
            <div className="flex justify-between text-base font-semibold">
              <span>Jami</span>
              <span>{somFormat(zakaz.jamiSumma)}</span>
            </div>
          </div>

          {zakaz.holat === "TOLOV_KUTILMOQDA" && kutilayotganTolov && (
            <button
              onClick={() => router.push(`/tolov/${kutilayotganTolov.id}`)}
              className="mt-5 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              To&apos;lashga o&apos;tish
            </button>
          )}
          {zakaz.holat === "TAYYOR" && zakaz.olishUsuli !== "YETKAZISH" && (
            <p className="mt-5 font-medium text-emerald-700">Zakazingiz tayyor — kassada raqamni ayting.</p>
          )}
          {BEKOR_MUMKIN.includes(zakaz.holat) && (
            <button
              onClick={bekorQil}
              disabled={band}
              className="mt-3 w-full rounded-lg border border-red-300 py-3 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Zakazni bekor qilish
            </button>
          )}
          {zakaz.holat === "BEKOR" && <p className="mt-5 text-stone-600">{HOLAT_NOMLARI.BEKOR}.</p>}
        </section>
      )}

      <Link href="/" className="mt-6 inline-block text-emerald-700 underline">
        Menyuga qaytish
      </Link>
    </main>
  );
}
