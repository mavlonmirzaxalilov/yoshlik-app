"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { type Zakaz } from "@/lib/turlar";
import { FaolBuyurtma, TarixKartasi, faolmi } from "@/components/ZakazKartalari";
import { Karta, Sarlavha, Tana } from "@/components/ui";

export default function ZakazlarimSahifasi() {
  const router = useRouter();
  const [zakazlar, setZakazlar] = useState<Zakaz[] | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    api("/api/men/zakazlar")
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 401) router.replace("/kirish?qaytish=/zakazlarim");
        else if (!r.ok) throw new Error(data.xato ?? "Yuklab bo'lmadi");
        else setZakazlar(data);
      })
      .catch((e: Error) => setXato(e.message));
  }, [router]);

  const faollar = zakazlar?.filter(faolmi) ?? [];
  const tarix = zakazlar?.filter((z) => !faolmi(z)) ?? [];

  return (
    <>
      <Sarlavha sarlavha="Buyurtmalar" />
      <Tana className="space-y-5">
        {xato && <p className="text-qizil">{xato}</p>}
        {!zakazlar && !xato && <p className="text-xira">Yuklanmoqda...</p>}
        {zakazlar?.length === 0 && (
          <Karta className="py-8 text-center">
            <p className="text-xira">Hali buyurtma yo&apos;q.</p>
            <Link href="/" className="mt-2 inline-block font-semibold text-asosiy">
              Menyuga o&apos;tish
            </Link>
          </Karta>
        )}

        {faollar.map((z) => (
          <FaolBuyurtma key={z.id} zakaz={z} />
        ))}

        {tarix.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold">Buyurtmalar tarixi</h2>
            <div className="space-y-3">
              {tarix.map((z) => (
                <TarixKartasi key={z.id} zakaz={z} />
              ))}
            </div>
          </section>
        )}
      </Tana>
    </>
  );
}
