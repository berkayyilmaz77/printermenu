import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { confirmOrder, OrderValidationError } from "@/lib/staff-orders";

// Siparişi onaylar: mutfak yazıcısına düşer (print_jobs "pending"), artık
// düzenlenemez. Masaya tekrar dokunulursa o masa için yeni bir açık sipariş
// başlar (yeni tur).
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

  try {
    const order = await confirmOrder(orderId);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Sipariş onaylanamadı:", error);
    return NextResponse.json({ error: "Sipariş onaylanamadı." }, { status: 500 });
  }
}
