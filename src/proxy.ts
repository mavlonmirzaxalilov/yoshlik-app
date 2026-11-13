import { NextResponse, type NextRequest } from "next/server";

// Optimistik tekshiruv: sessiya cookie'si yo'q bo'lsa kirish sahifasiga yo'naltiradi.
// Haqiqiy ruxsat (sessiya yaroqliligi, admin roli) API va server komponentlarda tekshiriladi.
export function proxy(request: NextRequest) {
  if (request.cookies.has("sessiya")) return NextResponse.next();
  const url = new URL("/kirish", request.url);
  url.searchParams.set("qaytish", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/zakazlarim", "/profil", "/admin/:path*"],
};
