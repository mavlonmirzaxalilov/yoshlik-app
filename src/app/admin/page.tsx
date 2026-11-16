"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, telegramWebApp } from "@/lib/api";
import AdminZakazlar from "@/components/AdminZakazlar";
import { Sarlavha, Tana } from "@/components/ui";

// Rol tekshiruvi klientda: Telegram Mini App cookie emas, header bilan kiradi (server sahifasi uni ko'rmaydi).
// Ma'lumotning o'zini /api/admin/... yo'llari himoyalaydi (admin bo'lmasa 403).
export default function AdminSahifasi() {
  const router = useRouter();
  const [ruxsat, setRuxsat] = useState(false);

  useEffect(() => {
    api("/api/men")
      .then((r) => r.json())
      .then((d) => {
        if (!d.mijoz) return router.replace(telegramWebApp() ? "/" : "/kirish?qaytish=/admin");
        if (!d.admin) return router.replace("/");
        setRuxsat(true);
      });
  }, [router]);

  return (
    <>
      <Sarlavha sarlavha="Admin">
        <p className="mt-1 text-center text-sm text-white/90">Bugungi zakazlar · to&apos;liq panel S6&apos;da</p>
      </Sarlavha>
      <Tana className="pb-8">{ruxsat ? <AdminZakazlar /> : <p className="text-xira">Yuklanmoqda...</p>}</Tana>
    </>
  );
}
