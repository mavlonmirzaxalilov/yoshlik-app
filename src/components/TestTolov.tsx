"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { somFormat, tolovNomi, type TolovUsuli } from "@/lib/turlar";

type Tolov = {
  id: number;
  usul: TolovUsuli;
  summa: number;
  holat: string;
  zakaz: { id: number; raqam: number; holat: string };
  testRejim: boolean;
};

// Click/Payme kalitlari kelguncha to'lov sahifasi o'rnida turadi (DECISIONS.md).
export default function TestTolov() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tolov, setTolov] = useState<Tolov | null>(null);
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tolov/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 401) return router.replace(`/kirish?qaytish=/tolov/${id}`);
        if (!r.ok) throw new Error(data.xato ?? "To'lov topilmadi");
        setTolov(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, [id, router]);

  const natija = async (n: "tolandi" | "bekor") => {
    setBand(true);
    setXato(null);
    const javob = await fetch(`/api/tolov/${id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ natija: n }),
    });
    const data = await javob.json();
    if (!javob.ok) {
      setXato(data.xato ?? "Xatolik");
      setBand(false);
      return;
    }
    router.push(`/zakaz/${data.zakazId}`);
  };

  if (xato && !tolov) return <p className="text-red-600">{xato}</p>;
  if (!tolov) return <p className="text-stone-500">Yuklanmoqda...</p>;

  const yakunlangan = tolov.holat !== "KUTILMOQDA";

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        TEST REJIMI — haqiqiy pul yechilmaydi
      </p>
      <h1 className="text-xl font-bold">{tolovNomi(tolov.usul)} orqali to&apos;lov</h1>
      <p className="mt-1 text-stone-600">Zakaz #{tolov.zakaz.raqam}</p>
      <p className="mt-4 text-3xl font-bold">{somFormat(tolov.summa)}</p>

      {xato && <p className="mt-3 text-red-600">{xato}</p>}

      {yakunlangan ? (
        <p className="mt-5 text-stone-600">Bu to&apos;lov allaqachon yakunlangan.</p>
      ) : (
        <div className="mt-5 space-y-2">
          <button
            onClick={() => natija("tolandi")}
            disabled={band}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            To&apos;lash
          </button>
          <button
            onClick={() => natija("bekor")}
            disabled={band}
            className="w-full rounded-lg border border-stone-300 py-3 text-stone-700 hover:bg-stone-100 disabled:opacity-60"
          >
            To&apos;lovni rad etish
          </button>
        </div>
      )}
      <button onClick={() => router.push(`/zakaz/${tolov.zakaz.id}`)} className="mt-3 w-full py-2 text-sm text-stone-600">
        Zakazga qaytish
      </button>
    </section>
  );
}
