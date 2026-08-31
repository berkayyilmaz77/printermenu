import "server-only";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

// Basit key-value ayarlar (settings tablosu). Şimdilik sadece işletme adı
// kullanılıyor — QR menü başlığında "Menü" yerine gösteriliyor.
export const SETTINGS_KEYS = {
  businessName: "business_name",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = getDb();
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
