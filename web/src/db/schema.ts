import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  nameEn: varchar("name_en", { length: 120 }), // boşsa TR isim fallback olarak kullanılır
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sabit alerjen/diyet etiket listesi (kod tarafında tanımlı, admin panelinden
// ürün başına işaretlenir). Ayrı bir tabloya gerek yok, çeviri de kod içinde tutulur.
export const ALLERGEN_CODES = [
  "gluten",
  "sut",
  "yumurta",
  "findik",
  "soya",
  "balik",
  "kabuklu_deniz_urunu",
  "susam",
] as const;

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  nameEn: varchar("name_en", { length: 160 }),
  description: text("description"),
  descriptionEn: text("description_en"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  // Kampanya/indirim: doluysa üründe "eski fiyat" olarak üstü çizili gösterilir
  // ve price alanı kampanyalı (güncel) fiyat kabul edilir.
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  allergens: text("allergens").array().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bir ürüne bağlı seçenek grubu (örn. "Boy", "Ekstra Malzeme")
export const optionGroups = pgTable("option_groups", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  required: boolean("required").notNull().default(false),
  minSelect: integer("min_select").notNull().default(0),
  maxSelect: integer("max_select").notNull().default(1), // 1 = tekli seçim (örn. Boy), >1 = çoklu (örn. ekstra malzemeler)
  sortOrder: integer("sort_order").notNull().default(0),
});

// Bir seçenek grubunun içindeki tek tek seçenekler (örn. "Büyük" +10₺, "Ekstra Peynir" +5₺)
export const optionChoices = pgTable("option_choices", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => optionGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  priceDelta: numeric("price_delta", { precision: 10, scale: 2 }).notNull().default("0"),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Fiziksel masalar — kasiyer/garson uygulaması sipariş alırken buradan masa
// seçiyor. Admin panelinden eklenip çıkarılıyor (printers ile aynı desen).
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(), // "Masa 1", "Bahçe 3" vb.
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).notNull(),
  tableId: integer("table_id").references(() => tables.id, { onDelete: "set null" }),
  // tableId'nin o andaki isim kopyası — masa silinse/adı değişse bile eski
  // sipariş/fişte doğru isim kalsın diye (diğer *Snapshot alanlarıyla aynı mantık).
  tableNumber: varchar("table_number", { length: 40 }),
  // open: garson hâlâ ürün ekliyor/çıkarıyor, mutfağa gitmedi.
  // confirmed: onaylandı, print_jobs'a düştü, artık düzenlenemez.
  // paid | cancelled: kapanmış sipariş.
  status: varchar("status", { length: 20 }).notNull().default("open"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  paidAt: timestamp("paid_at"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id").references(() => menuItems.id, {
    onDelete: "set null",
  }),
  nameSnapshot: varchar("name_snapshot", { length: 160 }).notNull(),
  priceSnapshot: numeric("price_snapshot", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  note: text("note"),
});

// Bir sipariş satırında seçilen varyant/opsiyonların anlık kaydı (fiyat/isim
// sonradan admin panelinden değişse bile eski siparişler bozulmasın diye).
export const orderItemOptions = pgTable("order_item_options", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  choiceNameSnapshot: varchar("choice_name_snapshot", { length: 120 }).notNull(),
  priceDeltaSnapshot: numeric("price_delta_snapshot", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
});

export const printJobs = pgTable("print_jobs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | sent | failed
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
});

// Mutfak/kasa yazıcıları. Bağlantı tipi ne olursa olsun (Bluetooth, ağ/wifi
// üzerinden IP, ya da USB) buradan tanımlanıp admin panelinden eklenip
// çıkarılabiliyor. Tablet uygulaması aktif olan(lar)ı /api/printers'tan çekip
// kullanıyor.
export const PRINTER_TYPES = ["bluetooth", "network", "usb"] as const;

export const printers = pgTable("printers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // bluetooth | network | usb
  // bluetooth: MAC adresi, network: IP:port, usb: cihazdaki tanımlayıcı/isim
  address: varchar("address", { length: 255 }).notNull(),
  paperWidthMm: integer("paper_width_mm").notNull().default(80), // 58 veya 80 yaygın
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("owner"), // owner | staff
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: text("value").notNull(),
});
