import "server-only";
import { getDb } from "@/db";
import {
  orders,
  orderItems,
  orderItemOptions,
  printJobs,
  menuItems,
  optionChoices,
  tables,
} from "@/db/schema";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

// Kasiyer/garson sipariş akışının tek kaynağı — hem tablet uygulamasındaki
// /api/staff/* route'ları hem admin panelindeki "Sipariş Al" sayfası (server
// action'lar üzerinden) bu fonksiyonları çağırıyor. İkisi aynı satırları
// okuyup yazdığı için otomatik olarak "bağlantılı" — ayrı bir senkron
// mekanizması yok, kaynak zaten ortak.
//
// Bir masada aynı anda en fazla bir "open" (henüz onaylanmamış) sipariş
// olabilir — garson masaya dokununca o sipariş varsa döner, yoksa oluşturur.
// "confirmed" olunca print_jobs'a düşer ve artık düzenlenemez; masaya tekrar
// dokunulursa o masa için yeni bir "open" sipariş başlar (yeni tur).

export class OrderValidationError extends Error {}

export type OrderItemView = {
  id: number;
  menuItemId: number | null;
  name: string;
  unitPrice: string;
  quantity: number;
  note: string | null;
  options: { name: string; priceDelta: string }[];
};

export type OrderView = {
  id: number;
  orderNumber: string;
  tableId: number | null;
  tableNumber: string | null;
  status: string;
  total: string;
  createdAt: Date;
  items: OrderItemView[];
};

export type TableOverview = {
  id: number;
  name: string;
  order: null | {
    id: number;
    orderNumber: string;
    status: string;
    total: string;
    itemCount: number;
    createdAt: Date;
  };
};

async function recomputeTotal(orderId: number) {
  const db = getDb();
  const items = await db
    .select({ price: orderItems.priceSnapshot, quantity: orderItems.quantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  await db.update(orders).set({ total: total.toFixed(2) }).where(eq(orders.id, orderId));
}

export async function getOrderWithItems(orderId: number): Promise<OrderView | null> {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));
  const itemIds = items.map((i) => i.id);
  const options = itemIds.length
    ? await db.select().from(orderItemOptions).where(inArray(orderItemOptions.orderItemId, itemIds))
    : [];
  const optionsByItem = new Map<number, typeof options>();
  for (const opt of options) {
    const list = optionsByItem.get(opt.orderItemId) ?? [];
    list.push(opt);
    optionsByItem.set(opt.orderItemId, list);
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    tableNumber: order.tableNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    items: items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.nameSnapshot,
      unitPrice: i.priceSnapshot,
      quantity: i.quantity,
      note: i.note,
      options: (optionsByItem.get(i.id) ?? []).map((o) => ({
        name: o.choiceNameSnapshot,
        priceDelta: o.priceDeltaSnapshot,
      })),
    })),
  };
}

// Masaya dokunulunca çağrılır: açık siparişi varsa onu döner, yoksa oluşturur.
export async function getOrCreateOpenOrder(tableId: number): Promise<OrderView> {
  const db = getDb();
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.tableId, tableId), eq(orders.status, "open")))
    .limit(1);
  if (existing) {
    const order = await getOrderWithItems(existing.id);
    if (order) return order;
  }

  const [table] = await db.select().from(tables).where(eq(tables.id, tableId)).limit(1);
  if (!table) throw new OrderValidationError("Masa bulunamadı.");

  const [created] = await db
    .insert(orders)
    .values({ orderNumber: "", tableId, tableNumber: table.name, status: "open", total: "0.00" })
    .returning();
  await db.update(orders).set({ orderNumber: `#${created.id}` }).where(eq(orders.id, created.id));

  const order = await getOrderWithItems(created.id);
  if (!order) throw new OrderValidationError("Sipariş oluşturulamadı.");
  return order;
}

async function requireOpenOrder(orderId: number) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new OrderValidationError("Sipariş bulunamadı.");
  if (order.status !== "open") {
    throw new OrderValidationError("Bu sipariş onaylanmış/kapanmış, artık düzenlenemez.");
  }
  return order;
}

export async function addOrderItem(
  orderId: number,
  line: { menuItemId: number; quantity: number; note?: string | null; choiceIds?: number[] },
): Promise<OrderView> {
  await requireOpenOrder(orderId);
  const db = getDb();

  const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, line.menuItemId)).limit(1);
  if (!menuItem) throw new OrderValidationError("Ürün bulunamadı.");
  if (!menuItem.isAvailable) throw new OrderValidationError(`"${menuItem.name}" şu an satışta değil.`);
  const quantity = Math.trunc(line.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new OrderValidationError("Geçersiz adet.");
  }

  const choiceIds = [...new Set(line.choiceIds ?? [])];
  const choices = choiceIds.length
    ? await db.select().from(optionChoices).where(inArray(optionChoices.id, choiceIds))
    : [];
  if (choices.length !== choiceIds.length) {
    throw new OrderValidationError("Seçeneklerden biri bulunamadı.");
  }
  for (const c of choices) {
    if (!c.isAvailable) throw new OrderValidationError(`"${c.name}" artık mevcut değil.`);
  }

  const unitPrice = Number(menuItem.price) + choices.reduce((s, c) => s + Number(c.priceDelta), 0);

  const [createdItem] = await db
    .insert(orderItems)
    .values({
      orderId,
      menuItemId: menuItem.id,
      nameSnapshot: menuItem.name,
      priceSnapshot: unitPrice.toFixed(2),
      quantity,
      note: line.note?.trim() || null,
    })
    .returning();

  for (const c of choices) {
    await db.insert(orderItemOptions).values({
      orderItemId: createdItem.id,
      choiceNameSnapshot: c.name,
      priceDeltaSnapshot: c.priceDelta,
    });
  }

  await recomputeTotal(orderId);
  const order = await getOrderWithItems(orderId);
  if (!order) throw new OrderValidationError("Sipariş bulunamadı.");
  return order;
}

export async function removeOrderItem(orderId: number, orderItemId: number): Promise<OrderView> {
  await requireOpenOrder(orderId);
  const db = getDb();
  await db
    .delete(orderItems)
    .where(and(eq(orderItems.id, orderItemId), eq(orderItems.orderId, orderId)));
  await recomputeTotal(orderId);
  const order = await getOrderWithItems(orderId);
  if (!order) throw new OrderValidationError("Sipariş bulunamadı.");
  return order;
}

// Siparişi onaylar: mutfak yazıcısına düşer (print_jobs), artık düzenlenemez.
export async function confirmOrder(orderId: number): Promise<OrderView> {
  const order = await requireOpenOrder(orderId);
  const db = getDb();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  if (items.length === 0) {
    throw new OrderValidationError("Sipariş boş, önce ürün ekle.");
  }

  await db
    .update(orders)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(eq(orders.id, order.id));
  await db.insert(printJobs).values({ orderId: order.id, status: "pending" });

  const updated = await getOrderWithItems(orderId);
  if (!updated) throw new OrderValidationError("Sipariş bulunamadı.");
  return updated;
}

// Masalar ekranı: her aktif masa + varsa güncel (open/confirmed) siparişinin
// özeti. "confirmed" ama henüz "paid" olmamış sipariş de masayı dolu gösterir.
export async function getTablesOverview(): Promise<TableOverview[]> {
  const db = getDb();
  const tableList = await db
    .select()
    .from(tables)
    .where(eq(tables.isActive, true))
    .orderBy(asc(tables.sortOrder));

  const activeOrders = await db
    .select()
    .from(orders)
    .where(inArray(orders.status, ["open", "confirmed"]));

  const orderByTable = new Map<number, (typeof activeOrders)[number]>();
  for (const o of activeOrders) {
    if (o.tableId == null) continue;
    const existing = orderByTable.get(o.tableId);
    if (!existing || o.createdAt > existing.createdAt) orderByTable.set(o.tableId, o);
  }

  const orderIds = [...orderByTable.values()].map((o) => o.id);
  const counts = orderIds.length
    ? await db
        .select({ orderId: orderItems.orderId, count: sql<number>`count(*)` })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
        .groupBy(orderItems.orderId)
    : [];
  const countByOrder = new Map(counts.map((c) => [c.orderId, Number(c.count)]));

  return tableList.map((t) => {
    const o = orderByTable.get(t.id);
    return {
      id: t.id,
      name: t.name,
      order: o
        ? {
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            total: o.total,
            itemCount: countByOrder.get(o.id) ?? 0,
            createdAt: o.createdAt,
          }
        : null,
    };
  });
}
