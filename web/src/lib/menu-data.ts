import { getDb } from "@/db";
import { categories, menuItems, optionGroups, optionChoices } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type PublicOptionChoice = {
  id: number;
  name: string;
  priceDelta: string;
};

export type PublicOptionGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  choices: PublicOptionChoice[];
};

export type PublicMenuItem = {
  id: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  price: string;
  originalPrice: string | null;
  imageUrl: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
  optionGroups: PublicOptionGroup[];
};

export type PublicCategory = {
  id: number;
  name: string;
  nameEn: string | null;
  items: PublicMenuItem[];
};

// Herkese açık menü verisi: sadece satışta olan (is_available) ürünler döner.
// Hem web'deki /menu (QR menü) sayfası hem de tablet uygulamasının çağıracağı
// /api/menu endpoint'i bu fonksiyonu kullanır — tek kaynak, iki tüketici.
export async function getPublicMenu(): Promise<PublicCategory[]> {
  const db = getDb();

  const [cats, items, groups, choices] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.sortOrder)),
    db.select().from(optionGroups).orderBy(asc(optionGroups.sortOrder)),
    db
      .select()
      .from(optionChoices)
      .where(eq(optionChoices.isAvailable, true))
      .orderBy(asc(optionChoices.sortOrder)),
  ]);

  const choicesByGroup = new Map<number, PublicOptionChoice[]>();
  for (const c of choices) {
    const list = choicesByGroup.get(c.groupId) ?? [];
    list.push({ id: c.id, name: c.name, priceDelta: c.priceDelta });
    choicesByGroup.set(c.groupId, list);
  }

  const groupsByItem = new Map<number, PublicOptionGroup[]>();
  for (const g of groups) {
    const list = groupsByItem.get(g.menuItemId) ?? [];
    list.push({
      id: g.id,
      name: g.name,
      required: g.required,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      choices: choicesByGroup.get(g.id) ?? [],
    });
    groupsByItem.set(g.menuItemId, list);
  }

  const itemsByCategory = new Map<number, PublicMenuItem[]>();
  for (const it of items) {
    const list = itemsByCategory.get(it.categoryId) ?? [];
    list.push({
      id: it.id,
      name: it.name,
      nameEn: it.nameEn,
      description: it.description,
      descriptionEn: it.descriptionEn,
      price: it.price,
      originalPrice: it.originalPrice,
      imageUrl: it.imageUrl,
      isVegetarian: it.isVegetarian,
      isVegan: it.isVegan,
      allergens: it.allergens,
      optionGroups: groupsByItem.get(it.id) ?? [],
    });
    itemsByCategory.set(it.categoryId, list);
  }

  return cats
    .map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      items: itemsByCategory.get(c.id) ?? [],
    }))
    .filter((c) => c.items.length > 0);
}
