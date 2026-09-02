import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { getOrderWithItems } from "@/lib/staff-orders";

// Bir tabletin başka bir tablette yapılan değişiklikleri görmesi için
// periyodik olarak çektiği endpoint (polling — ayrı bir websocket/realtime
// altyapısı kurulmadı, birkaç saniyede bir çekmek bu ölçekte yeterli).
export async function GET(
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

  const order = await getOrderWithItems(orderId);
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
