"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { somFormat, usulNomi, type Zakaz } from "@/lib/turlar";

export default function ZakazTasdiq() {
  const { id } = useParams<{ id: string }>();
  const [zakaz, setZakaz] = useState<Zakaz | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/zakazlar/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.xato ?? "Zakaz topilmadi");
        setZakaz(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      {xato && <p className="text-red-600">{xato}</p>}
      {!zakaz && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}

      {zakaz && (
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-emerald-700">✓ Zakaz qabul qilindi</p>
          <h1 className="mt-1 text-3xl font-bold">Zakaz #{zakaz.raqam}</h1>

          <dl className="mt-4 grid grid-cols-2 gap-y-2">
            <dt className="text-stone-600">Olish usuli</dt>
            <dd className="font-medium">{usulNomi(zakaz.olishUsuli)}</dd>
            {zakaz.olishVaqti && (
              <>
                <dt className="text-stone-600">Olish vaqti</dt>
                <dd className="text-xl font-bold">{zakaz.olishVaqti}</dd>
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
          <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Jami</span>
            <span>{somFormat(zakaz.jamiSumma)}</span>
          </div>

          <p className="mt-5 text-stone-600">Kassada zakaz raqamini ayting.</p>
        </section>
      )}

      <Link href="/" className="mt-6 inline-block text-emerald-700 underline">
        Menyuga qaytish
      </Link>
    </main>
  );
}
