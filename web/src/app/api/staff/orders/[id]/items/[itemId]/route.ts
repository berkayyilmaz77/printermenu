import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { removeOrderItem, OrderValidationError } from "@/lib/staff-orders";

// Açık siparişten bir satırı çıkarır (garson yanlış eklediyse vb.).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  if (!isDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const { id, itemId } = await params;
  const orderId = Number(id);
  const orderItemId = Number(itemId);
  if (!Number.isInteger(orderId) || !Number.isInteger(orderItemId)) {
    return NextResponse.json({ error: "Geçersiz id." }, { status: 400 });
  }

  try {
    const order = await removeOrderItem(orderId, orderItemId);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Ürün çıkarılamadı:", error);
    return NextResponse.json({ error: "Ürün çıkarılamadı." }, { status: 500 });
  }
}
