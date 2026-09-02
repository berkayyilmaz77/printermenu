import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { addOrderItem, OrderValidationError } from "@/lib/staff-orders";

// Açık siparişe tek bir ürün ekler (fiyat her zaman sunucuda hesaplanır,
// client'tan gelen fiyat yok — bkz. lib/staff-orders.ts).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Geçersiz sipariş id." }, { status: 400 });
  }

  let body: { menuItemId?: number; quantity?: number; note?: string | null; choiceIds?: number[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }
  if (typeof body.menuItemId !== "number" || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "menuItemId ve quantity zorunlu." }, { status: 400 });
  }

  try {
    const order = await addOrderItem(orderId, {
      menuItemId: body.menuItemId,
      quantity: body.quantity,
      note: body.note,
      choiceIds: body.choiceIds,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Ürün eklenemedi:", error);
    return NextResponse.json({ error: "Ürün eklenemedi." }, { status: 500 });
  }
}
