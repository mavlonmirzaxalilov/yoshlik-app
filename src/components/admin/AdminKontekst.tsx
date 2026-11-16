"use client";

import { createContext, useContext } from "react";

export type AdminRol = "ADMIN" | "KASSIR" | "OSHPAZ";
export type AdminMen = { ism: string | null; telefon: string | null; rol: AdminRol; ega: boolean };

export const AdminKontekst = createContext<{ men: AdminMen; qidiruv: string } | null>(null);

export function useAdmin() {
  const k = useContext(AdminKontekst);
  if (!k) throw new Error("useAdmin admin qobig'i ichida ishlatilishi kerak");
  return k;
}

export const ROL_NOMI: Record<AdminRol, string> = { ADMIN: "Admin", KASSIR: "Kassir", OSHPAZ: "Oshpaz" };
