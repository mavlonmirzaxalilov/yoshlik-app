"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Crown, Plus, Trash2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { ROL_NOMI, type AdminRol } from "@/components/admin/AdminKontekst";

type Xodim = { id: number | null; telefon: string; ism: string | null; rol: AdminRol; faol: boolean; ega: boolean; telegram: boolean; menmi: boolean };

const ROLLAR: AdminRol[] = ["ADMIN", "KASSIR", "OSHPAZ"];
const IZOH: Record<AdminRol, string> = {
  ADMIN: "hamma bo'limlar",
  KASSIR: "Kassa va Zakazlar",
  OSHPAZ: "faqat Zakazlar (holat)",
};
const maydon = "rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-faol";

export default function XodimlarSahifasi() {
  const [ro, setRo] = useState<Xodim[] | null>(null);
  const [yangi, setYangi] = useState({ telefon: "", ism: "", rol: "KASSIR" as AdminRol });
  const [xato, setXato] = useState<string | null>(null);

  const yukla = useCallback(() => {
    api("/api/admin/xodimlar").then((r) => r.json()).then(setRo);
  }, []);
  useEffect(() => {
    yukla();
  }, [yukla]);

  const sorov = async (url: string, method: string, body?: object) => {
    setXato(null);
    const r = await api(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setXato(d.xato ?? "Xatolik");
      return false;
    }
    yukla();
    return true;
  };

  const qosh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await sorov("/api/admin/xodimlar", "POST", yangi)) setYangi({ telefon: "", ism: "", rol: "KASSIR" });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={qosh} className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-stone-500">Telefon</span>
          <input value={yangi.telefon} onChange={(e) => setYangi({ ...yangi, telefon: e.target.value })} placeholder="90 123 45 67" className={`${maydon} w-full`} />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-stone-500">Ism</span>
          <input value={yangi.ism} onChange={(e) => setYangi({ ...yangi, ism: e.target.value })} placeholder="Ixtiyoriy" className={`${maydon} w-full`} />
        </label>
        <label>
          <span className="mb-1 block text-xs text-stone-500">Rol</span>
          <select value={yangi.rol} onChange={(e) => setYangi({ ...yangi, rol: e.target.value as AdminRol })} className={maydon}>
            {ROLLAR.map((r) => (
              <option key={r} value={r}>{ROL_NOMI[r]}</option>
            ))}
          </select>
        </label>
        <button className="flex items-center gap-1 rounded-xl bg-tolov px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Qo&apos;shish
        </button>
      </form>
      <p className="text-xs text-stone-500">
        Xodim panelga kirishi uchun shu raqam bilan botda /start bosib, raqamini ulashishi kerak. Rollar: Admin — {IZOH.ADMIN}; Kassir — {IZOH.KASSIR}; Oshpaz — {IZOH.OSHPAZ}.
      </p>
      {xato && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{xato}</p>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ro?.map((x) => (
          <div key={x.telefon} className={`rounded-2xl bg-white p-4 shadow-sm ${x.faol ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-panel">
                  {x.ism ?? "Ismsiz"} {x.ega && <Crown size={15} className="text-amber-500" />}
                  {x.menmi && <span className="text-xs font-normal text-stone-400">(siz)</span>}
                </div>
                <div className="text-sm text-stone-600">{x.telefon}</div>
              </div>
              <span className="rounded-full bg-faol-och px-2.5 py-1 text-xs font-semibold text-faol">{x.ega ? "Ega" : ROL_NOMI[x.rol]}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {x.telegram ? (
                <><CheckCircle2 size={14} className="text-tolov" /> Telegram bog&apos;langan</>
              ) : (
                <><XCircle size={14} className="text-stone-400" /> Botda raqam ulashilmagan</>
              )}
            </div>
            {!x.ega && !x.menmi && x.id !== null && (
              <div className="mt-3 flex items-center gap-2">
                <select value={x.rol} onChange={(e) => sorov(`/api/admin/xodimlar/${x.id}`, "PATCH", { rol: e.target.value })} className={`${maydon} flex-1`}>
                  {ROLLAR.map((r) => (
                    <option key={r} value={r}>{ROL_NOMI[r]}</option>
                  ))}
                </select>
                <button onClick={() => sorov(`/api/admin/xodimlar/${x.id}`, "PATCH", { faol: !x.faol })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm">
                  {x.faol ? "To'xtatish" : "Faollashtirish"}
                </button>
                <button
                  onClick={() => confirm(`${x.ism ?? x.telefon} ro'yxatdan o'chirilsinmi?`) && sorov(`/api/admin/xodimlar/${x.id}`, "DELETE")}
                  className="p-2 text-red-500"
                  aria-label="O'chirish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
