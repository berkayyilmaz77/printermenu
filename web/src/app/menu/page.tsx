import type { Metadata } from "next";
import { getPublicMenu } from "@/lib/menu-data";
import { getSetting, SETTINGS_KEYS } from "@/lib/settings";
import { MenuView } from "@/components/menu/menu-view";

export async function generateMetadata(): Promise<Metadata> {
  const businessName = await getSetting(SETTINGS_KEYS.businessName);
  return { title: businessName ? `${businessName} — Menü` : "Menü" };
}

// QR koddan açılan herkese açık, salt-okunur menü sayfası. Sipariş bu sayfadan
// verilmez (sipariş mobil uygulamadaki tabletten alınır, yazıcı entegrasyonu
// da orada) — burası sadece müşterilerin kendi telefonlarından menüye göz
// atması için.
export const revalidate = 30;

export default async function PublicMenuPage() {
  const [categories, businessName] = await Promise.all([
    getPublicMenu(),
    getSetting(SETTINGS_KEYS.businessName),
  ]);
  return <MenuView categories={categories} businessName={businessName} />;
}
