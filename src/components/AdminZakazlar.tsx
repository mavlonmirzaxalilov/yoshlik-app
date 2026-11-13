"use client";

import { useEffect, useState } from "react";
import { somFormat, usulNomi, type Zakaz } from "@/lib/turlar";

type AdminZakaz = Zakaz & { mijoz: { ism: string | null; telefon: string | null } | null };

export default function AdminZakazlar() {
  const [zakazlar, setZakazlar] = useState<AdminZakaz[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/zakazlar")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.xato ?? "Yuklab bo'lmadi");
        setZakazlar(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, []);

  if (xato) return <p className="text-red-600">{xato}</p>;
  if (!zakazlar) return <p className="text-stone-500">Yuklanmoqda...</p>;
  if (!zakazlar.length) return <p className="text-stone-600">Bugun hali zakaz yo&apos;q.</p>;

  return (
    <ul className="space-y-3">
      {zakazlar.map((z) => (
        <li key={z.id} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex justify-between">
            <span className="font-semibold">
              #{z.raqam} · {usulNomi(z.olishUsuli)}
              {z.olishVaqti && ` · ${z.olishVaqti}`}
            </span>
            <span className="font-semibold">{somFormat(z.jamiSumma)}</span>
          </div>
          <div className="text-sm text-stone-600">
            {z.mijoz ? `${z.mijoz.ism ?? "Ismsiz"} · ${z.mijoz.telefon}` : "Mijoz bog'lanmagan (S1/S2 zakazi)"}
          </div>
          <div className="mt-1 text-sm text-stone-500">{z.qatorlar.map((q) => `${q.nom} × ${q.soni}`).join(", ")}</div>
        </li>
      ))}
    </ul>
  );
}
