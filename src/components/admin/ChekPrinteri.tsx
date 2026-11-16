"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import { api } from "@/lib/api";

type Holat = { kalitBor: boolean; dasturVaqti: string | null };

const ULANGAN_MS = 60_000;

// Sozlamalar > Chek printeri: kassa kompyuteridagi dastur uchun kalit va ulanish holati.
export default function ChekPrinteri() {
  const [holat, setHolat] = useState<Holat | null>(null);
  const [kalit, setKalit] = useState<string | null>(null);
  const [nusxa, setNusxa] = useState(false);
  const [hozir, setHozir] = useState(0);

  const yukla = useCallback(async () => {
    const r = await api("/api/admin/chek");
    if (r.ok) setHolat(await r.json());
    setHozir(Date.now());
  }, []);

  useEffect(() => {
    Promise.resolve().then(yukla);
    const t = setInterval(yukla, 20_000);
    return () => clearInterval(t);
  }, [yukla]);

  const yangiKalit = async () => {
    if (
      holat?.kalitBor &&
      !confirm("Yangi kalit yaratilsa, eski kalit bilan ishlayotgan dastur to'xtaydi. Davom etasizmi?")
    )
      return;
    const r = await api("/api/admin/chek/kalit", { method: "POST" });
    if (!r.ok) return;
    setKalit((await r.json()).kalit);
    setNusxa(false);
    yukla();
  };

  const ulangan = Boolean(holat?.dasturVaqti && hozir - new Date(holat.dasturVaqti).getTime() < ULANGAN_MS);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-bold text-panel">
        <Printer size={18} /> Chek printeri
      </h2>
      <p className="mt-1 text-xs text-stone-500">
        Bot zakazi to&apos;langanda kassa kompyuteridagi dastur ikkita chek chiqaradi: oshxona (narxsiz) va kassa
        (narxlari bilan). Kassada kiritilgan zakazlarga chek chiqmaydi.
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={`h-2.5 w-2.5 rounded-full ${ulangan ? "bg-green-500" : "bg-stone-300"}`} />
        {!holat
          ? "Tekshirilmoqda..."
          : ulangan
            ? "Dastur ulangan"
            : holat.dasturVaqti
              ? `Dastur ulanmagan (oxirgi marta: ${new Date(holat.dasturVaqti).toLocaleString("ru-RU")})`
              : "Dastur hali ulanmagan"}
      </div>

      {kalit && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            Kalit faqat hozir ko&apos;rinadi — chek-sozlama.json&apos;dagi &quot;kalit&quot;ga qo&apos;ying:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-2 py-1.5 text-xs">{kalit}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(kalit).then(() => setNusxa(true))}
              className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs"
            >
              <Copy size={14} /> {nusxa ? "Nusxalandi" : "Nusxa"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={yangiKalit} className="rounded-xl bg-panel px-4 py-2 text-sm font-semibold text-white">
          {holat?.kalitBor ? "Yangi kalit yaratish" : "Kalit yaratish"}
        </button>
        <a
          href="/chek/chek-dasturi.mjs"
          download
          className="flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2 text-sm"
        >
          <Download size={14} /> chek-dasturi.mjs
        </a>
        <a
          href="/chek/ishga-tushir.bat"
          download
          className="flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2 text-sm"
        >
          <Download size={14} /> ishga-tushir.bat
        </a>
      </div>

      <details className="mt-4 text-sm text-stone-600">
        <summary className="cursor-pointer font-medium text-panel">Kassa kompyuterida o&apos;rnatish</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Ikkala printerni USB orqali ulang va drayverini o&apos;rnating (Windows&apos;da printer ko&apos;rinsin).</li>
          <li>
            <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-faol">
              Node.js
            </a>{" "}
            o&apos;rnating (LTS).
          </li>
          <li>
            Ikkala faylni bitta papkaga yuklab oling, masalan <code>C:\Yoshlik</code>.
          </li>
          <li>
            <code>ishga-tushir.bat</code>ni bir marta oching — <code>chek-sozlama.json</code> yaratiladi.
          </li>
          <li>
            Printer nomlarini bilish: shu papkada <code>node chek-dasturi.mjs printerlar</code>.
          </li>
          <li>
            <code>chek-sozlama.json</code>&apos;ga kalitni, <code>oshxonaPrinter</code> va <code>kassaPrinter</code>{" "}
            nomlarini yozing.
          </li>
          <li>
            Sinov: <code>node chek-dasturi.mjs sinov</code> — ikkala printerdan sinov cheki chiqadi.
          </li>
          <li>
            <code>ishga-tushir.bat</code>ni ishga tushiring va oynani yopmang. Kompyuter yonganda o&apos;zi ochilishi
            uchun uning yorlig&apos;ini <code>shell:startup</code> papkasiga qo&apos;ying.
          </li>
        </ol>
      </details>
    </section>
  );
}
