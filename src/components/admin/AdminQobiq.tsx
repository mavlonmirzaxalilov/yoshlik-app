"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Menu as MenuIkona,
  Search,
  Settings,
  Tag,
  UserCircle2,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { api, telegramWebApp } from "@/lib/api";
import { AdminKontekst, ROL_NOMI, type AdminMen, type AdminRol } from "@/components/admin/AdminKontekst";

type Bolim = { href: string; nom: string; ikona: LucideIcon; rollar: AdminRol[] };

const BOLIMLAR: Bolim[] = [
  { href: "/admin/kassa", nom: "Kassa", ikona: Calculator, rollar: ["ADMIN", "KASSIR"] },
  { href: "/admin", nom: "Zakazlar", ikona: ClipboardList, rollar: ["ADMIN", "KASSIR", "OSHPAZ"] },
  { href: "/admin/menyu", nom: "Menyu", ikona: UtensilsCrossed, rollar: ["ADMIN"] },
  { href: "/admin/hisobot", nom: "Hisobotlar", ikona: BarChart3, rollar: ["ADMIN"] },
  { href: "/admin/harajatlar", nom: "Harajatlar", ikona: Wallet, rollar: ["ADMIN"] },
  { href: "/admin/xodimlar", nom: "Xodimlar", ikona: Users, rollar: ["ADMIN"] },
  { href: "/admin/promokodlar", nom: "Promokodlar", ikona: Tag, rollar: ["ADMIN"] },
  { href: "/admin/sozlamalar", nom: "Sozlamalar", ikona: Settings, rollar: ["ADMIN"] },
];

// Qidiruv qaysi bo'limlarda ishlaydi (boshqalarida yashiriladi)
const QIDIRUV_BOR = ["/admin", "/admin/kassa", "/admin/menyu"];

export default function AdminQobiq({ children }: { children: ReactNode }) {
  const yol = usePathname();
  const router = useRouter();
  const [men, setMen] = useState<AdminMen | null>(null);
  const [ochiq, setOchiq] = useState(false);
  const [qidiruv, setQidiruv] = useState("");
  const [telegram, setTelegram] = useState(false);

  useEffect(() => {
    api("/api/men")
      .then((r) => r.json())
      .then((d) => {
        const tg = Boolean(telegramWebApp());
        setTelegram(tg);
        if (!d.mijoz) return router.replace(tg ? "/" : "/admin/kirish");
        if (!d.rol) return router.replace(tg ? "/" : "/admin/kirish?xato=xodim-emas");
        setMen({ ism: d.mijoz.ism, telefon: d.mijoz.telefon, rol: d.rol, ega: d.ega });
      });
  }, [router]);

  const bolimlar = BOLIMLAR.filter((b) => men && b.rollar.includes(men.rol));
  const faol = (href: string) => (href === "/admin" ? yol === "/admin" : yol.startsWith(href));

  // Ruxsat yo'q bo'limga to'g'ridan-to'g'ri kirilsa — birinchi ruxsatli bo'limga
  useEffect(() => {
    if (!men) return;
    const joriy = BOLIMLAR.find((b) => faol(b.href));
    if (joriy && !joriy.rollar.includes(men.rol)) router.replace(bolimlar[0]?.href ?? "/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [men, yol]);

  const chiq = async () => {
    await api("/api/auth/chiqish", { method: "POST" });
    router.replace(telegram ? "/" : "/admin/kirish");
  };

  if (!men) {
    return <div className="flex min-h-screen items-center justify-center bg-admin-fon text-stone-500">Yuklanmoqda...</div>;
  }

  const menyu = (
    <nav className="flex h-full flex-col bg-panel text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-faol text-base">Y</span>
          Yoshlik
        </Link>
        <button onClick={() => setOchiq(false)} className="rounded-lg p-1 text-white/70 lg:hidden" aria-label="Menyuni yopish">
          <X size={22} />
        </button>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {bolimlar.map(({ href, nom, ikona: Ikona }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setOchiq(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                faol(href) ? "bg-faol text-white shadow-lg shadow-black/20" : "text-white/80 hover:bg-panel-och hover:text-white"
              }`}
            >
              <Ikona size={20} strokeWidth={1.8} />
              {nom}
            </Link>
          </li>
        ))}
      </ul>
      {telegram ? (
        <Link href="/profil" className="m-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-panel-och">
          ← Mijoz ilovasiga
        </Link>
      ) : (
        <button onClick={chiq} className="m-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-panel-och">
          <LogOut size={18} /> Chiqish
        </button>
      )}
    </nav>
  );

  return (
    <AdminKontekst.Provider value={{ men, qidiruv }}>
      <div className="flex min-h-screen bg-admin-fon">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{menyu}</aside>
        {ochiq && (
          <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setOchiq(false)}>
            <aside className="h-full w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {menyu}
            </aside>
            <div className="flex-1 bg-black/40" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
            <button onClick={() => setOchiq(true)} className="rounded-lg p-1.5 text-panel lg:hidden" aria-label="Menyu">
              <MenuIkona size={24} />
            </button>
            <h1 className="text-lg font-bold text-panel lg:text-xl">
              {BOLIMLAR.find((b) => faol(b.href))?.nom ?? "Admin"}
            </h1>
            {QIDIRUV_BOR.includes(yol) && (
              <label className="ml-auto hidden max-w-sm flex-1 items-center gap-2 rounded-xl bg-admin-fon px-3 py-2 sm:flex">
                <Search size={18} className="text-stone-400" />
                <input
                  value={qidiruv}
                  onChange={(e) => setQidiruv(e.target.value)}
                  placeholder={yol === "/admin" ? "Raqam, telefon yoki ism..." : "Taom qidirish..."}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            )}
            <div className={`flex items-center gap-2 ${QIDIRUV_BOR.includes(yol) ? "" : "ml-auto"}`}>
              <UserCircle2 size={34} strokeWidth={1.4} className="text-panel" />
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-semibold text-panel">{men.ism || men.telefon}</div>
                <div className="text-xs text-stone-500">{men.ega ? "Ega" : ROL_NOMI[men.rol]}</div>
              </div>
            </div>
          </header>
          {QIDIRUV_BOR.includes(yol) && (
            <div className="border-b border-stone-200 bg-white px-4 py-2 sm:hidden">
              <input
                value={qidiruv}
                onChange={(e) => setQidiruv(e.target.value)}
                placeholder="Qidirish..."
                className="w-full rounded-xl bg-admin-fon px-3 py-2 text-sm outline-none"
              />
            </div>
          )}
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AdminKontekst.Provider>
  );
}
