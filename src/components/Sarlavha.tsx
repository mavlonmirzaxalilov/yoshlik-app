"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SESSIYA_HODISA } from "@/lib/sessiyaKlient";

type Men = { mijoz: { ism: string | null; telefon: string | null } | null; admin: boolean };

export default function Sarlavha() {
  const yol = usePathname();
  const [men, setMen] = useState<Men | null>(null);

  useEffect(() => {
    const yukla = () =>
      fetch("/api/men")
        .then((r) => r.json())
        .then(setMen)
        .catch(() => setMen({ mijoz: null, admin: false }));
    yukla();
    window.addEventListener(SESSIYA_HODISA, yukla);
    return () => window.removeEventListener(SESSIYA_HODISA, yukla);
  }, [yol]);

  const havola = (href: string, matn: string) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm ${yol === href ? "bg-emerald-50 font-medium text-emerald-800" : "text-stone-700 hover:bg-stone-100"}`}
    >
      {matn}
    </Link>
  );

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-1 px-4 py-2">
        <Link href="/" className="mr-auto text-lg font-bold">
          Yoshlik
        </Link>
        {havola("/", "Menyu")}
        {men?.mijoz ? (
          <>
            {havola("/zakazlarim", "Zakazlarim")}
            {havola("/profil", men.mijoz.ism || "Profil")}
            {men.admin && havola("/admin", "Admin")}
          </>
        ) : (
          men && havola("/kirish", "Kirish")
        )}
      </nav>
    </header>
  );
}
