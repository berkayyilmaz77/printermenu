"use server";

import { getDb } from "@/db";
import {
  categories,
  menuItems,
  optionGroups,
  optionChoices,
  settings,
  ALLERGEN_CODES,
} from "@/db/schema";
import { auth } from "@/auth";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

// Bütün mutasyonlar server action — proxy.ts optimistic bir kontrol yapıyor
// ama Server Action'lar proxy matcher'ından bağımsız da çağrılabildiği için
// (bkz. Next.js proxy.js dokümanı) burada da oturum kontrolü tekrarlanıyor.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
  }
  return session.user;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------- Kategoriler ----------

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  if (!name) throw new Error("Kategori adı zorunlu.");

  const db = getDb();
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${categories.sortOrder}), -1)` })
    .from(categories);

  await db.insert(categories).values({
    name,
    nameEn: str(formData, "nameEn"),
    sortOrder: maxSort + 1,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  if (!name) throw new Error("Kategori adı zorunlu.");

  const db = getDb();
  await db
    .update(categories)
    .set({ name, nameEn: str(formData, "nameEn") })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function moveCategory(id: number, direction: "up" | "down") {
  await requireAdmin();
  const db = getDb();
  const all = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= all.length) return;

  const a = all[index];
  const b = all[swapWith];
  await db
    .update(categories)
    .set({ sortOrder: b.sortOrder })
    .where(eq(categories.id, a.id));
  await db
    .update(categories)
    .set({ sortOrder: a.sortOrder })
    .where(eq(categories.id, b.id));

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

// ---------- Ürünler ----------

async function resolveImageUrl(formData: FormData, existingUrl: string | null) {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const blob = await put(`menu-items/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }
  // Manuel URL girilmişse (dosya seçilmediyse) onu kullan.
  const manualUrl = str(formData, "imageUrl");
  return manualUrl ?? existingUrl;
}

function readAllergens(formData: FormData): string[] {
  const values = formData.getAll("allergens").filter((v): v is string => typeof v === "string");
  return values.filter((v) => (ALLERGEN_CODES as readonly string[]).includes(v));
}

export async function createMenuItem(formData: FormData) {
  await requireAdmin();
  const categoryId = num(formData, "categoryId");
  const name = str(formData, "name");
  const price = str(formData, "price");
  if (!categoryId || !name || !price) {
    throw new Error("Kategori, isim ve fiyat zorunlu.");
  }

  const db = getDb();
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${menuItems.sortOrder}), -1)` })
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId));

  const imageUrl = await resolveImageUrl(formData, null);

  const [created] = await db
    .insert(menuItems)
    .values({
      categoryId,
      name,
      nameEn: str(formData, "nameEn"),
      description: str(formData, "description"),
      descriptionEn: str(formData, "descriptionEn"),
      price,
      originalPrice: str(formData, "originalPrice"),
      imageUrl,
      isAvailable: formData.get("isAvailable") === "on",
      isVegetarian: formData.get("isVegetarian") === "on",
      isVegan: formData.get("isVegan") === "on",
      allergens: readAllergens(formData),
      sortOrder: maxSort + 1,
    })
    .returning({ id: menuItems.id });

  revalidatePath("/admin/menu-items");
  revalidatePath("/menu");
  return created.id;
}

export async function updateMenuItem(id: number, formData: FormData) {
  await requireAdmin();
  const categoryId = num(formData, "categoryId");
  const name = str(formData, "name");
  const price = str(formData, "price");
  if (!categoryId || !name || !price) {
    throw new Error("Kategori, isim ve fiyat zorunlu.");
  }

  const db = getDb();
  const [existing] = await db
    .select({ imageUrl: menuItems.imageUrl })
    .from(menuItems)
    .where(eq(menuItems.id, id))
    .limit(1);

  const imageUrl = await resolveImageUrl(formData, existing?.imageUrl ?? null);

  await db
    .update(menuItems)
    .set({
      categoryId,
      name,
      nameEn: str(formData, "nameEn"),
      description: str(formData, "description"),
      descriptionEn: str(formData, "descriptionEn"),
      price,
      originalPrice: str(formData, "originalPrice"),
      imageUrl,
      isAvailable: formData.get("isAvailable") === "on",
      isVegetarian: formData.get("isVegetarian") === "on",
      isVegan: formData.get("isVegan") === "on",
      allergens: readAllergens(formData),
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id));

  revalidatePath("/admin/menu-items");
  revalidatePath("/menu");
}

export async function deleteMenuItem(id: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(menuItems).where(eq(menuItems.id, id));
  revalidatePath("/admin/menu-items");
  revalidatePath("/menu");
}

export async function moveMenuItem(id: number, direction: "up" | "down") {
  await requireAdmin();
  const db = getDb();
  const [item] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, id))
    .limit(1);
  if (!item) return;

  // Sıralama sadece kendi kategorisi içinde anlamlı.
  const siblings = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.categoryId, item.categoryId))
    .orderBy(asc(menuItems.sortOrder));

  const index = siblings.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];
  await db
    .update(menuItems)
    .set({ sortOrder: b.sortOrder })
    .where(eq(menuItems.id, a.id));
  await db
    .update(menuItems)
    .set({ sortOrder: a.sortOrder })
    .where(eq(menuItems.id, b.id));

  revalidatePath("/admin/menu-items");
  revalidatePath("/menu");
}

export async function toggleMenuItemAvailability(id: number, next: boolean) {
  await requireAdmin();
  const db = getDb();
  await db
    .update(menuItems)
    .set({ isAvailable: next, updatedAt: new Date() })
    .where(eq(menuItems.id, id));
  revalidatePath("/admin/menu-items");
  revalidatePath("/menu");
}

// ---------- Seçenek grupları / seçenekler ----------

export async function addOptionGroup(menuItemId: number, formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  if (!name) throw new Error("Grup adı zorunlu.");

  const db = getDb();
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${optionGroups.sortOrder}), -1)` })
    .from(optionGroups)
    .where(eq(optionGroups.menuItemId, menuItemId));

  const maxSelect = num(formData, "maxSelect") ?? 1;
  await db.insert(optionGroups).values({
    menuItemId,
    name,
    required: formData.get("required") === "on",
    minSelect: num(formData, "minSelect") ?? 0,
    maxSelect,
    sortOrder: maxSort + 1,
  });

  revalidatePath(`/admin/menu-items/${menuItemId}/edit`);
  revalidatePath("/menu");
}

export async function deleteOptionGroup(groupId: number, menuItemId: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(optionGroups).where(eq(optionGroups.id, groupId));
  revalidatePath(`/admin/menu-items/${menuItemId}/edit`);
  revalidatePath("/menu");
}

export async function addOptionChoice(
  groupId: number,
  menuItemId: number,
  formData: FormData,
) {
  await requireAdmin();
  const name = str(formData, "name");
  if (!name) throw new Error("Seçenek adı zorunlu.");

  const db = getDb();
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${optionChoices.sortOrder}), -1)` })
    .from(optionChoices)
    .where(eq(optionChoices.groupId, groupId));

  await db.insert(optionChoices).values({
    groupId,
    name,
    priceDelta: str(formData, "priceDelta") ?? "0",
    sortOrder: maxSort + 1,
  });

  revalidatePath(`/admin/menu-items/${menuItemId}/edit`);
  revalidatePath("/menu");
}

export async function deleteOptionChoice(choiceId: number, menuItemId: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(optionChoices).where(eq(optionChoices.id, choiceId));
  revalidatePath(`/admin/menu-items/${menuItemId}/edit`);
  revalidatePath("/menu");
}

// ---------- Ayarlar ----------

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const db = getDb();

  const entries: [string, string | null][] = [
    ["business_name", str(formData, "businessName")],
  ];

  for (const [key, value] of entries) {
    if (value === null) continue;
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/menu");
}
