"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Taom } from "@/lib/turlar";
import { useAdmin } from "@/components/admin/AdminKontekst";

type Kat = { id: number; nom: string; belgi: string; tartib: number; _count: { taomlar: number } };
type Forma = { id?: number; nom: string; narx: string; hajm: string; tavsif: string; kategoriyaId: string };

const maydon = "w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol";

export default function MenyuBoshqaruvi() {
  const { qidiruv } = useAdmin();
  const [kategoriyalar, setKategoriyalar] = useState<Kat[]>([]);
  const [taomlar, setTaomlar] = useState<Taom[]>([]);
  const [filtr, setFiltr] = useState<number | null>(null);
  const [forma, setForma] = useState<Forma | null>(null);
  const [katForma, setKatForma] = useState<{ id?: number; nom: string; belgi: string } | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState(false);
  const fayl = useRef<HTMLInputElement>(null);
  const [rasmUchun, setRasmUchun] = useState<number | null>(null);

  const yukla = async () => {
    const [k, t] = await Promise.all([
      api("/api/admin/kategoriyalar").then((r) => r.json()),
      api("/api/taomlar").then((r) => r.json()),
    ]);
    setKategoriyalar(k);
    setTaomlar(t);
  };
  useEffect(() => {
    // holat await'dan keyin o'rnatiladi; mikrovazifa orqali chaqiramiz (effekt ichida sinxron setState bo'lmasin)
    Promise.resolve().then(yukla);
  }, []);

  const korinadigan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return taomlar.filter((t) => (filtr ? t.kategoriyaId === filtr : true) && (!q || t.nom.toLowerCase().includes(q)));
  }, [taomlar, filtr, qidiruv]);

  const sorov = async (url: string, method: string, body?: object) => {
    setXato(null);
    const r = await api(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setXato(d.xato ?? "Xatolik");
      return null;
    }
    return d;
  };

  const tugadi = async (t: Taom) => {
    setTaomlar((old) => old.map((x) => (x.id === t.id ? { ...x, tugadi: !t.tugadi } : x)));
    if (!(await sorov(`/api/admin/taomlar/${t.id}`, "PATCH", { tugadi: !t.tugadi }))) yukla();
  };

  const saqla = async () => {
    if (!forma) return;
    setBand(true);
    const body = {
      nom: forma.nom,
      narx: Number(forma.narx.replace(/\D/g, "")),
      hajm: forma.hajm,
      tavsif: forma.tavsif,
      kategoriyaId: Number(forma.kategoriyaId),
    };
    const ok = await sorov(forma.id ? `/api/admin/taomlar/${forma.id}` : "/api/admin/taomlar", forma.id ? "PATCH" : "POST", body);
    setBand(false);
    if (ok) {
      setForma(null);
      yukla();
    }
  };

  const ochir = async (t: Taom) => {
    if (!confirm(`"${t.nom}" menyudan o'chirilsinmi? Eski zakazlarda nomi saqlanib qoladi.`)) return;
    if (await sorov(`/api/admin/taomlar/${t.id}`, "DELETE")) yukla();
  };

  const rasmTanla = (id: number) => {
    setRasmUchun(id);
    fayl.current?.click();
  };

  const rasmYukla = async (f: File | undefined) => {
    if (!f || rasmUchun === null) return;
    setXato(null);
    const fd = new FormData();
    fd.append("rasm", f);
    const r = await api(`/api/admin/taomlar/${rasmUchun}/rasm`, { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) setXato(d.xato ?? "Rasm yuklanmadi");
    if (fayl.current) fayl.current.value = "";
    yukla();
  };

  const rasmOchir = async (id: number) => {
    if (await sorov(`/api/admin/taomlar/${id}/rasm`, "DELETE")) yukla();
  };

  const katSaqla = async () => {
    if (!katForma) return;
    const ok = await sorov(
      katForma.id ? `/api/admin/kategoriyalar/${katForma.id}` : "/api/admin/kategoriyalar",
      katForma.id ? "PATCH" : "POST",
      { nom: katForma.nom, belgi: katForma.belgi },
    );
    if (ok) {
      setKatForma(null);
      yukla();
    }
  };

  const katOchir = async (k: Kat) => {
    if (!confirm(`"${k.nom}" kategoriyasi o'chirilsinmi?`)) return;
    if (await sorov(`/api/admin/kategoriyalar/${k.id}`, "DELETE")) yukla();
  };

  return (
    <div className="space-y-4">
      <input ref={fayl} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => rasmYukla(e.target.files?.[0])} />
      {xato && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{xato}</p>}

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-panel">Kategoriyalar</h2>
          <button onClick={() => setKatForma({ nom: "", belgi: "🍽️" })} className="flex items-center gap-1 rounded-xl bg-faol px-3 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> Kategoriya
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiltr(null)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${filtr === null ? "bg-faol text-white" : "bg-admin-fon"}`}>
            Barchasi ({taomlar.length})
          </button>
          {kategoriyalar.map((k) => (
            <span key={k.id} className={`flex items-center rounded-xl text-sm font-semibold ${filtr === k.id ? "bg-faol text-white" : "bg-admin-fon"}`}>
              <button onClick={() => setFiltr(k.id)} className="py-2 pl-3 pr-1">
                {k.belgi} {k.nom} ({k._count.taomlar})
              </button>
              <button onClick={() => setKatForma({ id: k.id, nom: k.nom, belgi: k.belgi })} className="px-1 opacity-60 hover:opacity-100" aria-label="Tahrirlash">
                <Pencil size={13} />
              </button>
              {k._count.taomlar === 0 && (
                <button onClick={() => katOchir(k)} className="pr-2 opacity-60 hover:opacity-100" aria-label="O'chirish">
                  <Trash2 size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold text-panel">Taomlar ({korinadigan.length})</h2>
          <button
            onClick={() => setForma({ nom: "", narx: "", hajm: "", tavsif: "", kategoriyaId: String(filtr ?? kategoriyalar[0]?.id ?? "") })}
            className="flex items-center gap-1 rounded-xl bg-tolov px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Taom qo&apos;shish
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-admin-fon text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-2">Taom</th>
                <th className="px-4 py-2">Kategoriya</th>
                <th className="px-4 py-2 text-right">Narx</th>
                <th className="px-4 py-2 text-center">Mavjud</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {korinadigan.map((t) => (
                <tr key={t.id} className={t.tugadi ? "bg-red-50/40" : ""}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => rasmTanla(t.id)} className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-admin-fon text-2xl" title="Rasm yuklash">
                        {t.rasm ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.rasm} alt="" className="h-full w-full object-cover" />
                        ) : (
                          t.kategoriya?.belgi
                        )}
                        <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                          <ImagePlus size={18} />
                        </span>
                      </button>
                      <div>
                        <div className="font-semibold text-panel">{t.nom}</div>
                        <div className="text-xs text-stone-500">
                          {t.hajm}
                          {t.rasm && (
                            <button onClick={() => rasmOchir(t.id)} className="ml-2 text-red-500 hover:underline">
                              rasmni olib tashlash
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-stone-600">{t.kategoriya?.nom}</td>
                  <td className="px-4 py-2 text-right font-semibold">{t.narx.toLocaleString("ru-RU")}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => tugadi(t)}
                      role="switch"
                      aria-checked={!t.tugadi}
                      aria-label={`${t.nom} — ${t.tugadi ? "tugagan" : "mavjud"}`}
                      className={`relative h-6 w-11 rounded-full transition ${t.tugadi ? "bg-stone-300" : "bg-tolov"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${t.tugadi ? "left-0.5" : "left-[22px]"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() =>
                        setForma({ id: t.id, nom: t.nom, narx: String(t.narx), hajm: t.hajm ?? "", tavsif: t.tavsif ?? "", kategoriyaId: String(t.kategoriyaId ?? "") })
                      }
                      className="p-2 text-faol"
                      aria-label="Tahrirlash"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => ochir(t)} className="p-2 text-red-500" aria-label="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {forma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setForma(null)}>
          <div className="w-full max-w-md space-y-3 rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-panel">{forma.id ? "Taomni tahrirlash" : "Yangi taom"}</h2>
              <button onClick={() => setForma(null)} aria-label="Yopish">
                <X size={20} />
              </button>
            </div>
            <input value={forma.nom} onChange={(e) => setForma({ ...forma, nom: e.target.value })} placeholder="Nomi" className={maydon} />
            <div className="grid grid-cols-2 gap-2">
              <input inputMode="numeric" value={forma.narx} onChange={(e) => setForma({ ...forma, narx: e.target.value })} placeholder="Narx (so'm)" className={maydon} />
              <input value={forma.hajm} onChange={(e) => setForma({ ...forma, hajm: e.target.value })} placeholder="Hajm: 1 pors, 0,5 l" className={maydon} />
            </div>
            <select value={forma.kategoriyaId} onChange={(e) => setForma({ ...forma, kategoriyaId: e.target.value })} className={maydon}>
              {kategoriyalar.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.belgi} {k.nom}
                </option>
              ))}
            </select>
            <textarea value={forma.tavsif} onChange={(e) => setForma({ ...forma, tavsif: e.target.value })} rows={2} placeholder="Tavsif (ixtiyoriy)" className={maydon} />
            {xato && <p className="text-sm text-red-600">{xato}</p>}
            <button onClick={saqla} disabled={band} className="w-full rounded-xl bg-faol py-3 font-semibold text-white disabled:opacity-50">
              Saqlash
            </button>
            {!forma.id && <p className="text-center text-xs text-stone-500">Rasmni saqlagandan keyin jadvaldagi rasm joyini bosib yuklaysiz</p>}
          </div>
        </div>
      )}

      {katForma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setKatForma(null)}>
          <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-panel">{katForma.id ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</h2>
            <div className="flex gap-2">
              <input value={katForma.belgi} onChange={(e) => setKatForma({ ...katForma, belgi: e.target.value })} className={`${maydon} w-16 text-center text-xl`} aria-label="Belgi (emoji)" />
              <input value={katForma.nom} onChange={(e) => setKatForma({ ...katForma, nom: e.target.value })} placeholder="Nomi" className={maydon} />
            </div>
            {xato && <p className="text-sm text-red-600">{xato}</p>}
            <button onClick={katSaqla} className="w-full rounded-xl bg-faol py-3 font-semibold text-white">
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
