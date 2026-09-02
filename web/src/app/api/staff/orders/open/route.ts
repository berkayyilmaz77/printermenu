import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { getOrCreateOpenOrder, OrderValidationError } from "@/lib/staff-orders";

// Garson bir masaya dokununca çağrılır: o masada açık sipariş varsa döner,
// yoksa yenisini oluşturur. İki tablet aynı masaya aynı anda dokunursa da
// güvenli — "open" sipariş için tekil sorgu, yarış durumunda ikinci çağrı da
// aynı satırı bulup döner (aynı tabloya iki ayrı açık sipariş oluşmaz çünkü
// ilk insert'ten sonraki her istek onu bulur).
export async function POST(request: NextRequest) {
  if (!isDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: { tableId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }
  if (typeof body.tableId !== "number") {
    return NextResponse.json({ error: "tableId zorunlu." }, { status: 400 });
  }

  try {
    const order = await getOrCreateOpenOrder(body.tableId);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Açık sipariş alınamadı:", error);
    return NextResponse.json({ error: "Sipariş alınamadı." }, { status: 500 });
  }
}
