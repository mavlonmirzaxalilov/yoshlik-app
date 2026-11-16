import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Maketdagi umumiy bloklar: to'q sariq sarlavha, oq kartochka, menyu qatori, tugmalar.

export function Sarlavha({ sarlavha, children }: { sarlavha: string; children?: ReactNode }) {
  return (
    <header className="rounded-b-3xl bg-asosiy px-4 pb-6 pt-5 text-white">
      <h1 className="text-center text-xl font-bold">{sarlavha}</h1>
      {children}
    </header>
  );
}

export function Karta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-karta border border-stone-200/80 bg-white p-4 shadow-karta ${className}`}>{children}</div>
  );
}

/** Kvadrat ichidagi ikona (maketdagi shaftoli fonli ikona). */
export function IkonaQuti({ ikona: Ikona, och = false }: { ikona: LucideIcon; och?: boolean }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${och ? "bg-stone-100 text-stone-700" : "bg-shaftoli text-asosiy-toq"}`}
    >
      <Ikona size={20} strokeWidth={1.8} />
    </span>
  );
}

export function MenyuQatori({
  href,
  ikona,
  matn,
  qiymat,
}: {
  href: string;
  ikona: LucideIcon;
  matn: string;
  qiymat?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
      <IkonaQuti ikona={ikona} och />
      <span className="flex-1 text-[15px]">{matn}</span>
      {qiymat && <span className="text-sm text-xira">{qiymat}</span>}
      <ChevronRight size={18} className="text-stone-500" />
    </Link>
  );
}

export function MenyuGuruhi({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-stone-100 overflow-hidden rounded-karta border border-stone-200/80 bg-white shadow-karta">
      {children}
    </div>
  );
}

export const tugmaAsosiy =
  "w-full rounded-xl bg-asosiy py-3 font-semibold text-white hover:bg-asosiy-toq disabled:opacity-60";
export const tugmaIkkinchi =
  "w-full rounded-xl border border-stone-300 bg-white py-3 font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60";
export const maydon =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-asosiy focus:ring-2 focus:ring-shaftoli";

/** Pastki menyu bilan to'qnashmasligi uchun sahifa tanasi. */
export function Tana({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto w-full max-w-xl px-4 pb-28 pt-5 ${className}`}>{children}</main>;
}
