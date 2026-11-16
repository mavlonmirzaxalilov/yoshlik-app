"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminQobiq from "@/components/admin/AdminQobiq";

// Admin panel qobig'i (POS uslubi). Kirish sahifasi qobiqsiz.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const yol = usePathname();
  if (yol.startsWith("/admin/kirish")) return <>{children}</>;
  return <AdminQobiq>{children}</AdminQobiq>;
}
