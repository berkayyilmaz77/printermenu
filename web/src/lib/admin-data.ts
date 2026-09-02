import "server-only";
import { getDb } from "@/db";
import {
  categories,
  menuItems,
  optionGroups,
  optionChoices,
  printers,
  tables,
} from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";

export type AdminCategory = typeof categories.$inferSelect;
export type AdminMenuItem = typeof menuItems.$inferSelect;
export type AdminOptionGroup = typeof optionGroups.$inferSelect;
export type AdminOptionChoice = typeof optionChoices.$inferSelect;
export type AdminPrinter = typeof printers.$inferSelect;
export type AdminTable = typeof tables.$inferSelect;

export async function getPrintersAdmin(): Promise<AdminPrinter[]> {
  const db = getDb();
  return db.select().from(printers).orderBy(asc(printers.sortOrder));
}

export async function getTablesAdmin(): Promise<AdminTable[]> {
  const db = getDb();
  return db.select().from(tables).orderBy(asc(tables.sortOrder));
}

// Admin panelinde public sayfadan farklı olarak satışta olmayan (isAvailable:
// false) ürünler de görünür — yönetici hepsini görüp düzenleyebilmeli.

export async function getCategoriesAdmin(): Promise<
  (AdminCategory & { itemCount: number })[]
> {
  const db = getDb();
  const [cats, items] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ categoryId: menuItems.categoryId }).from(menuItems),
  ]);

  const counts = new Map<number, number>();
  for (const it of items) {
    counts.set(it.categoryId, (counts.get(it.categoryId) ?? 0) + 1);
  }

  return cats.map((c) => ({ ...c, itemCount: counts.get(c.id) ?? 0 }));
}

export async function getCategoryAdmin(id: number) {
  const db = getDb();
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return cat ?? null;
}

export async function getMenuItemsAdmin(): Promise<
  (AdminMenuItem & { categoryName: string })[]
> {
  const db = getDb();
  const [items, cats] = await Promise.all([
    db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)),
    db.select().from(categories),
  ]);
  const nameById = new Map(cats.map((c) => [c.id, c.name]));
  return items.map((it) => ({
    ...it,
    categoryName: nameById.get(it.categoryId) ?? "—",
  }));
}

export async function getMenuItemAdmin(id: number) {
  const db = getDb();
  const [item] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, id))
    .limit(1);
  if (!item) return null;

  const groups = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.menuItemId, id))
    .orderBy(asc(optionGroups.sortOrder));

  // Gruplara ait tüm seçenekleri tek sorguda çekip grup id'sine göre dağıtıyoruz.
  const groupIds = groups.map((g) => g.id);
  const allChoices = groupIds.length
    ? await db
        .select()
        .from(optionChoices)
        .where(inArray(optionChoices.groupId, groupIds))
        .orderBy(asc(optionChoices.sortOrder))
    : [];

  const choicesByGroup = new Map<number, AdminOptionChoice[]>();
  for (const c of allChoices) {
    const list = choicesByGroup.get(c.groupId) ?? [];
    list.push(c);
    choicesByGroup.set(c.groupId, list);
  }

  return {
    item,
    groups: groups.map((g) => ({
      ...g,
      choices: choicesByGroup.get(g.id) ?? [],
    })),
  };
}
