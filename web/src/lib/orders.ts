import "server-only";
import { getDb } from "@/db";
import {
  orders,
  orderItems,
  orderItemOptions,
  printJobs,
  menuItems,
  optionChoices,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export type CreateOrderChoice = { choiceId: number };
export type CreateOrderItem = {
  menuItemId: number;
  quantity: number;
  note?: string | null;
  choiceIds?: number[];
};
export type CreateOrderInput = {
  tableNumber?: string | null;
  items: CreateOrderItem[];
};

export class OrderValidationError extends Error {}

// Tabletten gelen siparişi oluşturur: fiyatlar hiçbir zaman client'tan
// güvenilmez, her zaman DB'deki güncel fiyat/priceDelta'ya göre burada
// hesaplanır. neon-http sürücüsü çoklu-statement transaction desteklemediği
// için adımlar sırayla atılıyor — aradan biri patlarsa sipariş yarım kalabilir,
// bu MVP için kabul edilebilir bir sınırlama (bkz. print_jobs.status ile takip).
export async function createOrder(input: CreateOrderInput) {
  if (!input.items || input.items.length === 0) {
    throw new OrderValidationError("Sipariş en az bir ürün içermeli.");
  }

  const db = getDb();

  const menuItemIds = [...new Set(input.items.map((i) => i.menuItemId))];
  const items = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, menuItemIds));
  const itemById = new Map(items.map((i) => [i.id, i]));

  const allChoiceIds = [
    ...new Set(input.items.flatMap((i) => i.choiceIds ?? [])),
  ];
  const choices = allChoiceIds.length
    ? await db
        .select()
        .from(optionChoices)
        .where(inArray(optionChoices.id, allChoiceIds))
    : [];
  const choiceById = new Map(choices.map((c) => [c.id, c]));

  type Resolved = {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    note: string | null;
    choices: { id: number; name: string; priceDelta: number }[];
  };

  const resolved: Resolved[] = [];
  let total = 0;

  for (const line of input.items) {
    const menuItem = itemById.get(line.menuItemId);
    if (!menuItem) {
      throw new OrderValidationError(`Ürün bulunamadı: ${line.menuItemId}`);
    }
    if (!menuItem.isAvailable) {
      throw new OrderValidationError(`"${menuItem.name}" şu an satışta değil.`);
    }
    const quantity = Math.trunc(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new OrderValidationError(`Geçersiz adet: ${line.menuItemId}`);
    }

    const lineChoices = (line.choiceIds ?? []).map((id) => {
      const choice = choiceById.get(id);
      if (!choice || !choice.isAvailable) {
        throw new OrderValidationError(`Seçenek bulunamadı: ${id}`);
      }
      return {
        id: choice.id,
        name: choice.name,
        priceDelta: Number(choice.priceDelta),
      };
    });

    const unitPrice =
      Number(menuItem.price) + lineChoices.reduce((sum, c) => sum + c.priceDelta, 0);

    resolved.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: unitPrice,
      quantity,
      note: line.note?.trim() || null,
      choices: lineChoices,
    });
    total += unitPrice * quantity;
  }

  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderNumber: "",
      tableNumber: input.tableNumber?.trim() || null,
      status: "new",
      total: total.toFixed(2),
    })
    .returning();

  const orderNumber = `#${createdOrder.id}`;
  await db
    .update(orders)
    .set({ orderNumber })
    .where(eq(orders.id, createdOrder.id));

  for (const line of resolved) {
    const [createdItem] = await db
      .insert(orderItems)
      .values({
        orderId: createdOrder.id,
        menuItemId: line.menuItemId,
        nameSnapshot: line.name,
        priceSnapshot: line.price.toFixed(2),
        quantity: line.quantity,
        note: line.note,
      })
      .returning();

    for (const choice of line.choices) {
      await db.insert(orderItemOptions).values({
        orderItemId: createdItem.id,
        choiceNameSnapshot: choice.name,
        priceDeltaSnapshot: choice.priceDelta.toFixed(2),
      });
    }
  }

  await db.insert(printJobs).values({
    orderId: createdOrder.id,
    status: "pending",
  });

  return {
    id: createdOrder.id,
    orderNumber,
    total: total.toFixed(2),
    tableNumber: createdOrder.tableNumber,
    items: resolved,
  };
}
