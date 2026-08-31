import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// /admin altındaki her şeyi korur (login sayfası hariç). Next.js 16'da
// middleware.ts -> proxy.ts olarak yeniden adlandırıldı, davranış aynı.
// Burada sadece cookie'deki JWT'ye bakılıyor (optimistic check) — asıl
// yetki kontrolü server action'ların içinde de tekrar yapılmalı.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
