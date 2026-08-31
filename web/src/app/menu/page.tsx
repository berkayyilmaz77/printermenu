import { getPublicMenu } from "@/lib/menu-data";
import { MenuView } from "@/components/menu/menu-view";

// QR koddan açılan herkese açık, salt-okunur menü sayfası. Sipariş bu sayfadan
// verilmez (sipariş sadece dükkandaki tabletten alınır) — burası sadece
// müşterilerin kendi telefonlarından menüye göz atması için.
export const revalidate = 30;

export default async function PublicMenuPage() {
  const categories = await getPublicMenu();
  return <MenuView categories={categories} />;
}
