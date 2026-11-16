"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { IkonaQuti, Karta, Sarlavha, Tana, maydon, tugmaAsosiy } from "@/components/ui";

type Manzil = { id: number; matn: string };

export default function ManzillarSahifasi() {
  const router = useRouter();
  const [manzillar, setManzillar] = useState<Manzil[] | null>(null);
  const [yangi, setYangi] = useState("");
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    api("/api/men/manzillar").then(async (r) => {
      if (r.status === 401) return router.replace("/kirish?qaytish=/profil/manzillar");
      setManzillar(r.ok ? await r.json() : []);
    });
  }, [router]);

  const qosh = async (e: React.FormEvent) => {
    e.preventDefault();
    setXato(null);
    const javob = await api("/api/men/manzillar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matn: yangi }),
    });
    const data = await javob.json();
    if (!javob.ok) return setXato(data.xato ?? "Qo'shib bo'lmadi");
    setManzillar((m) => [...(m ?? []), data]);
    setYangi("");
  };

  const ochir = async (id: number) => {
    const javob = await api(`/api/men/manzillar/${id}`, { method: "DELETE" });
    if (javob.ok) setManzillar((m) => (m ?? []).filter((x) => x.id !== id));
  };

  return (
    <>
      <Sarlavha sarlavha="Manzillarim" />
      <Tana className="space-y-4">
        {manzillar === null && <p className="text-xira">Yuklanmoqda...</p>}
        {manzillar?.length === 0 && (
          <p className="text-xira">Saqlangan manzil yo&apos;q. Yetkazib berishda tez tanlash uchun qo&apos;shing.</p>
        )}
        {manzillar && manzillar.length > 0 && (
          <div className="divide-y divide-stone-100 overflow-hidden rounded-karta border border-stone-200/80 bg-white shadow-karta">
            {manzillar.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <IkonaQuti ikona={MapPin} och />
                <span className="flex-1">{m.matn}</span>
                <button onClick={() => ochir(m.id)} aria-label={`${m.matn} — o'chirish`} className="p-2 text-qizil">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Karta>
          <form onSubmit={qosh} className="space-y-3">
            <span className="block font-bold">Yangi manzil</span>
            <input value={yangi} onChange={(e) => setYangi(e.target.value)} className={maydon} placeholder="Ko'cha, uy, xonadon, mo'ljal" />
            {xato && <p className="text-sm text-qizil">{xato}</p>}
            <button type="submit" className={tugmaAsosiy}>
              Qo&apos;shish
            </button>
          </form>
        </Karta>
      </Tana>
    </>
  );
}
