import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDeviceAuthorized } from "@/lib/device-auth";
import { getTablesOverview } from "@/lib/staff-orders";

// Kasiyer/garson uygulamasının açılış ekranı — masaların listesi + varsa
// üzerindeki güncel siparişin özeti (kaç ürün, tutar, onaylandı mı).
// Tabletler bu endpoint'i periyodik olarak çekerek birbirini görür.
export async function GET(request: NextRequest) {
  if (!isDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const tablesOverview = await getTablesOverview();
  return NextResponse.json({ tables: tablesOverview });
}
