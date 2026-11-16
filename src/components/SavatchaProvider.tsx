"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { savatchaniOqi, savatchaniYoz } from "@/lib/sessiyaKlient";
import type { Taom } from "@/lib/turlar";

// Savatcha butun ilova uchun bitta: Asosiy sahifada qo'shiladi, /savat sahifasida rasmiylashtiriladi.
// localStorage'da saqlanadi — sahifa yangilansa yoki kirishdan qaytilsa ham yo'qolmaydi.

export type SavatchaQatori = { taom: Taom; soni: number };

type Qiymat = {
  qatorlar: SavatchaQatori[];
  soniniOzgartir: (taom: Taom, farq: number) => void;
  tozala: () => void;
  jamiSoni: number;
  jamiSumma: number;
  tiklandi: boolean; // localStorage'dan tiklash tugadimi (bo'sh savatni erta ko'rsatmaslik uchun)
};

const Kontekst = createContext<Qiymat | null>(null);

export function SavatchaProvider({ children }: { children: ReactNode }) {
  const [qatorlar, setQatorlar] = useState<SavatchaQatori[]>([]);
  const [tiklandi, setTiklandi] = useState(false);

  useEffect(() => {
    const saqlangan = savatchaniOqi();
    const tiklash = saqlangan.length
      ? api("/api/taomlar")
          .then((r) => (r.ok ? r.json() : []))
          .then((hammasi: Taom[]) => {
            setQatorlar(
              saqlangan.flatMap((q) => {
                const taom = hammasi.find((t) => t.id === q.taomId && !t.tugadi);
                return taom ? [{ taom, soni: q.soni }] : [];
              }),
            );
          })
      : Promise.resolve();
    tiklash.finally(() => setTiklandi(true));
  }, []);

  useEffect(() => {
    if (tiklandi) savatchaniYoz(qatorlar.map((q) => ({ taomId: q.taom.id, soni: q.soni })));
  }, [qatorlar, tiklandi]);

  const soniniOzgartir = useCallback((taom: Taom, farq: number) => {
    setQatorlar((oldingi) => {
      const mavjud = oldingi.find((q) => q.taom.id === taom.id);
      if (!mavjud) return farq > 0 ? [...oldingi, { taom, soni: farq }] : oldingi;
      return oldingi
        .map((q) => (q.taom.id === taom.id ? { ...q, soni: q.soni + farq } : q))
        .filter((q) => q.soni > 0);
    });
  }, []);

  const tozala = useCallback(() => setQatorlar([]), []);

  const qiymat = useMemo(
    () => ({
      qatorlar,
      soniniOzgartir,
      tozala,
      jamiSoni: qatorlar.reduce((s, q) => s + q.soni, 0),
      jamiSumma: qatorlar.reduce((s, q) => s + q.taom.narx * q.soni, 0),
      tiklandi,
    }),
    [qatorlar, soniniOzgartir, tozala, tiklandi],
  );

  return <Kontekst.Provider value={qiymat}>{children}</Kontekst.Provider>;
}

export function useSavatcha() {
  const q = useContext(Kontekst);
  if (!q) throw new Error("useSavatcha SavatchaProvider ichida ishlatilishi kerak");
  return q;
}
