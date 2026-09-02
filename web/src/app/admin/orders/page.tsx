import { getPublicMenu } from "@/lib/menu-data";
import { getTablesOverview } from "@/lib/staff-orders";
import { OrdersScreen } from "./orders-screen";

// Admin panelinden sipariş alma ekranı — kasiyer/garson burada da masa seçip
// sipariş oluşturabilir/düzenleyebilir/onaylayabilir. Tablet uygulamasıyla
// aynı çekirdek fonksiyonları (lib/staff-orders.ts) kullandığı için ikisi
// aynı veriyi görür; her ikisi de birkaç saniyede bir en güncel durumu
// çekiyor (polling) ki bir tablette yapılan değişiklik diğerinde de görünsün.
export default async function AdminOrdersPage() {
  const [categories, tablesOverview] = await Promise.all([
    getPublicMenu(),
    getTablesOverview(),
  ]);

  return <OrdersScreen categories={categories} initialTables={tablesOverview} />;
}
