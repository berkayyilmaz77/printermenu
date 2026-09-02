import "server-only";
import type { NextRequest } from "next/server";

// Tablet uygulamasının (kasiyer/garson) çağırdığı public API route'ları için
// ortak yetki kontrolü — gerçek kullanıcı auth'u değil, "bu istek bizim
// tabletten geldi" kontrolü (bkz. TABLET_API_KEY, .env.local).
export function isDeviceAuthorized(request: NextRequest): boolean {
  const key = request.headers.get("x-device-key");
  const expected = process.env.TABLET_API_KEY;
  return Boolean(expected) && key === expected;
}
