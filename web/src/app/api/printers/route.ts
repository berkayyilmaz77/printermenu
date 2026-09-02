import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { printers } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { isDeviceAuthorized } from "@/lib/device-auth";

// Tablet uygulaması aktif yazıcıları buradan öğreniyor. Diğer /api/staff/*
// route'larıyla aynı x-device-key koruması — adres/MAC gibi bilgiler herkese
// açık olmasın diye.
export async function GET(request: NextRequest) {
  if (!isDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const db = getDb();
  const list = await db
    .select()
    .from(printers)
    .where(eq(printers.isActive, true))
    .orderBy(asc(printers.sortOrder));

  return NextResponse.json({ printers: list });
}
