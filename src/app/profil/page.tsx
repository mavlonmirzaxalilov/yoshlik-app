"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sessiyaOzgardi } from "@/lib/sessiyaKlient";

type Manzil = { id: number; matn: string };

export default function ProfilSahifasi() {
  const router = useRouter();
  const [telefon, setTelefon] = useState<string | null>(null);
  const [ism, setIsm] = useState("");
  const [manzillar, setManzillar] = useState<Manzil[]>([]);
  const [yangiManzil, setYangiManzil] = useState("");
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/men")
      .then((r) => r.json())
      .then((d) => {
        if (!d.mijoz) return router.replace("/kirish?qaytish=/profil");
        setTelefon(d.mijoz.telefon);
        setIsm(d.mijoz.ism ?? "");
      });
    fetch("/api/men/manzillar")
      .then((r) => (r.ok ? r.json() : []))
      .then(setManzillar);
  }, [router]);

  const sorov = async (url: string, method: string, body?: object) => {
    setXato(null);
    setXabar(null);
    const javob = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await javob.json();
    if (!javob.ok) {
      setXato(data.xato ?? "Xatolik yuz berdi");
      return null;
    }
    return data;
  };

  const ismniSaqla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await sorov("/api/men", "PATCH", { ism })) {
      setXabar("Ism saqlandi");
      sessiyaOzgardi();
    }
  };

  const manzilQosh = async (e: React.FormEvent) => {
    e.preventDefault();
    const manzil = await sorov("/api/men/manzillar", "POST", { matn: yangiManzil });
    if (manzil) {
      setManzillar((m) => [...m, manzil]);
      setYangiManzil("");
    }
  };

  const manzilOchir = async (id: number) => {
    if (await sorov(`/api/men/manzillar/${id}`, "DELETE")) setManzillar((m) => m.filter((x) => x.id !== id));
  };

  const chiq = async () => {
    await fetch("/api/auth/chiqish", { method: "POST" });
    sessiyaOzgardi();
    router.push("/");
  };

  const maydon = "w-full rounded-lg border border-stone-300 px-3 py-2";
  const tugma = "rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700";

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      <h1 className="text-2xl font-bold">Profil</h1>
      {xato && <p className="text-red-600">{xato}</p>}
      {xabar && <p className="text-emerald-700">{xabar}</p>}

      <form onSubmit={ismniSaqla} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <div className="text-sm text-stone-500">Telefon</div>
          <div className="font-medium">{telefon ?? "..."}</div>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-stone-500">Ism</span>
          <div className="flex gap-2">
            <input value={ism} onChange={(e) => setIsm(e.target.value)} className={maydon} placeholder="Ismingiz" />
            <button type="submit" className={tugma}>
              Saqlash
            </button>
          </div>
        </label>
      </form>

      <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Yetkazish manzillari</h2>
        {manzillar.length === 0 && <p className="text-stone-500">Saqlangan manzil yo&apos;q.</p>}
        <ul className="divide-y divide-stone-100">
          {manzillar.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2">
              <span>{m.matn}</span>
              <button onClick={() => manzilOchir(m.id)} className="text-sm text-red-600 hover:underline">
                O&apos;chirish
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={manzilQosh} className="flex gap-2">
          <input
            value={yangiManzil}
            onChange={(e) => setYangiManzil(e.target.value)}
            className={maydon}
            placeholder="Ko'cha, uy, xonadon"
          />
          <button type="submit" className={tugma}>
            Qo&apos;shish
          </button>
        </form>
      </section>

      <button onClick={chiq} className="w-full rounded-lg border border-stone-300 py-3 text-stone-700 hover:bg-stone-100">
        Chiqish
      </button>
    </main>
  );
}
