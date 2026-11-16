"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleHelp, IdCard, MapPin, ShieldCheck, ShoppingBag, User, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { somFormat, type Zakaz } from "@/lib/turlar";
import { FaolBuyurtma, TarixKartasi, faolmi } from "@/components/ZakazKartalari";
import { IkonaQuti, Karta, MenyuGuruhi, MenyuQatori, Tana } from "@/components/ui";

type Men = { mijoz: { ism: string | null; telefon: string | null } | null; admin: boolean };

// "+998901234567" -> "+998 90 123 45 67"
const telefonKorinish = (t: string | null) =>
  t?.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, "+998 $1 $2 $3 $4") ?? "";

export default function ProfilSahifasi() {
  const router = useRouter();
  const [men, setMen] = useState<Men | null>(null);
  const [zakazlar, setZakazlar] = useState<Zakaz[] | null>(null);

  useEffect(() => {
    api("/api/men")
      .then((r) => r.json())
      .then((d: Men) => (d.mijoz ? setMen(d) : router.replace("/kirish?qaytish=/profil")));
    api("/api/men/zakazlar")
      .then((r) => (r.ok ? r.json() : []))
      .then(setZakazlar);
  }, [router]);

  // Statistika — bekor qilinganlarsiz (maket: "Buyurtmalar" va "Jami")
  const haqiqiy = (zakazlar ?? []).filter((z) => z.holat !== "BEKOR" && z.holat !== "TOLOV_KUTILMOQDA");
  const jami = haqiqiy.reduce((s, z) => s + z.jamiSumma, 0);
  const faol = zakazlar?.find(faolmi);
  const tarix = (zakazlar ?? []).filter((z) => !faolmi(z)).slice(0, 2);

  return (
    <>
      <header className="rounded-b-3xl bg-asosiy px-5 pb-7 pt-5 text-white">
        <h1 className="text-center text-xl font-bold">Profil</h1>
        <div className="mt-5 flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-asosiy">
            <User size={30} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xl font-bold">{men?.mijoz?.ism || "Mijoz"}</div>
            <div className="text-white/90">{telefonKorinish(men?.mijoz?.telefon ?? null) || "..."}</div>
          </div>
        </div>
      </header>

      <Tana className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Karta className="flex items-center gap-3">
            <IkonaQuti ikona={ShoppingBag} />
            <div>
              <div className="text-sm text-stone-700">Buyurtmalar</div>
              <div className="text-xl font-bold">{zakazlar ? haqiqiy.length : "…"}</div>
            </div>
          </Karta>
          <Karta className="flex items-center gap-3">
            <IkonaQuti ikona={Wallet} />
            <div className="min-w-0">
              <div className="text-sm text-stone-700">Jami</div>
              <div className="truncate text-xl font-bold">{zakazlar ? somFormat(jami).replace(" so'm", "") : "…"}</div>
            </div>
          </Karta>
        </div>

        {faol && <FaolBuyurtma zakaz={faol} />}

        {tarix.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Buyurtmalar tarixi</h2>
              <Link href="/zakazlarim" className="text-sm font-medium text-asosiy">
                Barchasini ko&apos;rish
              </Link>
            </div>
            <div className="space-y-3">
              {tarix.map((z) => (
                <TarixKartasi key={z.id} zakaz={z} />
              ))}
            </div>
          </section>
        )}

        <MenyuGuruhi>
          <MenyuQatori href="/profil/malumot" ikona={IdCard} matn="Ism va telefon" />
          <MenyuQatori href="/profil/manzillar" ikona={MapPin} matn="Manzillarim" />
          <MenyuQatori href="/yordam" ikona={CircleHelp} matn="Yordam" />
          {men?.admin && <MenyuQatori href="/admin" ikona={ShieldCheck} matn="Admin" />}
        </MenyuGuruhi>
      </Tana>
    </>
  );
}
