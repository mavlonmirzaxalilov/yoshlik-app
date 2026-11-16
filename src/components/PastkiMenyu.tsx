"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListOrdered, ShoppingCart, User } from "lucide-react";
import { useSavatcha } from "@/components/SavatchaProvider";

// Maketdagi pastki menyu: 4 bo'lim, faol bo'lim shaftoli "tabletka"da.
const BOLIMLAR = [
  { href: "/", nom: "Asosiy", ikona: House },
  { href: "/zakazlarim", nom: "Buyurtmalar", ikona: ListOrdered },
  { href: "/savat", nom: "Savat", ikona: ShoppingCart },
  { href: "/profil", nom: "Profil", ikona: User },
];

const faolmi = (yol: string, href: string) =>
  href === "/" ? yol === "/" : yol === href || yol.startsWith(`${href}/`) || (href === "/zakazlarim" && yol.startsWith("/zakaz/"));

export default function PastkiMenyu() {
  const yol = usePathname();
  const { jamiSoni } = useSavatcha();
  // Kirish, to'lov va admin sahifalarida pastki menyu ko'rsatilmaydi
  if (yol.startsWith("/kirish") || yol.startsWith("/tolov") || yol.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Asosiy bo'limlar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl justify-around px-2 py-1.5">
        {BOLIMLAR.map(({ href, nom, ikona: Ikona }) => {
          const faol = faolmi(yol, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={faol ? "page" : undefined}
                className={`relative flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-xs ${
                  faol ? "bg-shaftoli font-semibold text-asosiy-toq" : "text-stone-700"
                }`}
              >
                <Ikona size={22} strokeWidth={1.8} />
                {nom}
                {href === "/savat" && jamiSoni > 0 && (
                  <span className="absolute right-3 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-asosiy px-1 text-[11px] font-bold text-white">
                    {jamiSoni}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
