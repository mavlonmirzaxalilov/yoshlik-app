"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sanaFormat, somFormat, usulNomi, type Zakaz } from "@/lib/turlar";

export default function ZakazlarimSahifasi() {
  const router = useRouter();
  const [zakazlar, setZakazlar] = useState<Zakaz[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/men/zakazlar")
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 401) router.replace("/kirish?qaytish=/zakazlarim");
        else if (!r.ok) throw new Error(data.xato ?? "Yuklab bo'lmadi");
        else setZakazlar(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Mening zakazlarim</h1>
      {xato && <p className="text-red-600">{xato}</p>}
      {!zakazlar && !xato && <p className="text-stone-500">Yuklanmoqda...</p>}
      {zakazlar?.length === 0 && (
        <p className="text-stone-600">
          Hali zakaz yo&apos;q.{" "}
          <Link href="/" className="text-emerald-700 underline">
            Menyuga o&apos;tish
          </Link>
        </p>
      )}
      <ul className="space-y-3">
        {zakazlar?.map((z) => (
          <li key={z.id}>
            <Link href={`/zakaz/${z.id}`} className="block rounded-xl bg-white p-4 shadow-sm hover:bg-stone-50">
              <div className="flex justify-between">
                <span className="font-semibold">Zakaz #{z.raqam}</span>
                <span className="font-semibold">{somFormat(z.jamiSumma)}</span>
              </div>
              <div className="text-sm text-stone-600">
                {sanaFormat(z.yaratilgan)} ·{" "}
                {usulNomi(z.olishUsuli)}
                {z.olishVaqti && ` · ${z.olishVaqti}`}
              </div>
              <div className="mt-1 truncate text-sm text-stone-500">
                {z.qatorlar.map((q) => `${q.nom} × ${q.soni}`).join(", ")}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
