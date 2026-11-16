"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { IkonaQuti, Karta, Sarlavha, Tana } from "@/components/ui";

type Sozlamalar = { telefon: string | null; telegram: string | null };

export default function YordamSahifasi() {
  const [s, setS] = useState<Sozlamalar | null>(null);

  useEffect(() => {
    api("/api/sozlamalar")
      .then((r) => r.json())
      .then(setS)
      .catch(() => setS({ telefon: null, telegram: null }));
  }, []);

  const username = s?.telegram?.replace(/^@/, "");

  return (
    <>
      <Sarlavha sarlavha="Yordam" />
      <Tana className="space-y-4">
        <Karta>
          <p className="text-stone-700">
            Zakaz bo&apos;yicha savol yoki muammo bo&apos;lsa (noto&apos;g&apos;ri taom, kechikish, to&apos;lov) — kafe
            administratoriga murojaat qiling.
          </p>
        </Karta>
        {s === null && <p className="text-xira">Yuklanmoqda...</p>}
        {s?.telefon && (
          <a href={`tel:${s.telefon.replace(/[^\d+]/g, "")}`} className="block">
            <Karta className="flex items-center gap-3 hover:bg-stone-50">
              <IkonaQuti ikona={Phone} />
              <div>
                <div className="text-sm text-xira">Kafe telefoni</div>
                <div className="font-semibold">{s.telefon}</div>
              </div>
            </Karta>
          </a>
        )}
        {username && (
          <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer" className="block">
            <Karta className="flex items-center gap-3 hover:bg-stone-50">
              <IkonaQuti ikona={MessageCircle} />
              <div>
                <div className="text-sm text-xira">Administrator (Telegram)</div>
                <div className="font-semibold">@{username}</div>
              </div>
            </Karta>
          </a>
        )}
        {s && !s.telefon && !username && (
          <p className="text-sm text-xira">Aloqa ma&apos;lumotlari hali kiritilmagan.</p>
        )}
      </Tana>
    </>
  );
}
