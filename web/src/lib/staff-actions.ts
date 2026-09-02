"use server";

// Admin panelindeki "Sipariş Al" sayfasının kullandığı server action'lar.
// Tablet uygulamasındaki /api/staff/* route'larıyla birebir aynı çekirdek
// fonksiyonları (lib/staff-orders.ts) çağırıyor — tek fark burada yetki
// kontrolü oturum (requireAdmin) ile yapılıyor, tablette device-key ile.
// İkisi de aynı veriyi okuyup yazdığı için tablet ve web admin sayfası
// otomatik olarak "bağlantılı".
import { requireAdmin } from "./admin-actions";
import {
  addOrderItem,
  confirmOrder,
  getOrCreateOpenOrder,
  getOrderWithItems,
  getTablesOverview,
  removeOrderItem,
  type OrderView,
  type TableOverview,
} from "./staff-orders";

export async function getTablesOverviewAction(): Promise<TableOverview[]> {
  await requireAdmin();
  return getTablesOverview();
}

export async function openTableOrderAction(tableId: number): Promise<OrderView> {
  await requireAdmin();
  return getOrCreateOpenOrder(tableId);
}

export async function getOrderAction(orderId: number): Promise<OrderView | null> {
  await requireAdmin();
  return getOrderWithItems(orderId);
}

export async function addOrderItemAction(
  orderId: number,
  line: { menuItemId: number; quantity: number; note?: string | null; choiceIds?: number[] },
): Promise<OrderView> {
  await requireAdmin();
  return addOrderItem(orderId, line);
}

export async function removeOrderItemAction(orderId: number, orderItemId: number): Promise<OrderView> {
  await requireAdmin();
  return removeOrderItem(orderId, orderItemId);
}

export async function confirmOrderAction(orderId: number): Promise<OrderView> {
  await requireAdmin();
  return confirmOrder(orderId);
}
