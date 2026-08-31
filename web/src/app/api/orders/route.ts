import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOrder, OrderValidationError, type CreateOrderInput } from "@/lib/orders";

// Tablet uygulaması siparişi buraya POST eder. Herkese açık internetten
// spam sipariş/print job oluşturulmasın diye paylaşımlı bir anahtar (tablet
// uygulamasına verilecek) isteniyor — gerçek kullanıcı auth'u değil, sadece
// "bu istek bizim tabletten geldi" kontrolü.
function isAuthorized(request: NextRequest) {
  const key = request.headers.get("x-device-key");
  const expected = process.env.TABLET_API_KEY;
  return Boolean(expected) && key === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: CreateOrderInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  try {
    const order = await createOrder(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Sipariş oluşturulamadı:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
