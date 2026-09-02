import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOrder, OrderValidationError, type CreateOrderInput } from "@/lib/orders";
import { isDeviceAuthorized } from "@/lib/device-auth";

// NOT: Bu endpoint eski, tek seferlik "müşteri kendi siparişini oluşturur"
// akışının kalıntısı. Sipariş artık kasiyer/garson tarafından /api/staff/*
// üzerinden alınıyor (bkz. lib/staff-orders.ts) — orası masa bazlı, çok
// tabletli senkron akışı destekliyor. Bu route artık hiçbir client'tan
// çağrılmıyor, ileride kaldırılabilir; şimdilik dokunmadan bırakıldı.

export async function POST(request: NextRequest) {
  if (!isDeviceAuthorized(request)) {
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
