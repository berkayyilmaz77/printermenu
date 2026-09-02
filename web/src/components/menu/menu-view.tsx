"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { PublicCategory, PublicMenuItem } from "@/lib/menu-data";
import { allergenLabel, allergenIcon } from "@/lib/allergens";

type Lang = "tr" | "en";

const UI_TEXT = {
  tr: {
    digitalMenu: "DİJİTAL MENÜ",
    vegetarian: "Vejetaryen",
    vegan: "Vegan",
    allergens: "Alerjenler",
    options: "Seçenekler",
    empty: "Menüde henüz ürün yok.",
    campaign: "İndirim",
    items: (n: number) => `${n} ürün`,
    backToCategories: "Kategoriler",
  },
  en: {
    digitalMenu: "DIGITAL MENU",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    allergens: "Allergens",
    options: "Options",
    empty: "No items in the menu yet.",
    campaign: "Sale",
    items: (n: number) => `${n} items`,
    backToCategories: "Categories",
  },
} as const;

function money(value: string, lang: Lang) {
  const n = Number(value);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ${lang === "tr" ? "₺" : "TRY"}`;
}

function itemName(item: PublicMenuItem, lang: Lang) {
  return lang === "en" && item.nameEn ? item.nameEn : item.name;
}

function itemDescription(item: PublicMenuItem, lang: Lang) {
  return lang === "en" && item.descriptionEn ? item.descriptionEn : item.description;
}

function categoryName(c: PublicCategory, lang: Lang) {
  return lang === "en" && c.nameEn ? c.nameEn : c.name;
}

// Kategori kartında kapak resmi olarak kullanılıyor — categories tablosunda
// ayrı bir resim alanı yok, kategorideki ilk resimli ürünü kullanıyoruz
// (mobil uygulamadaki App.tsx'teki coverImage() ile aynı mantık).
function coverImage(c: PublicCategory): string | null {
  return c.items.find((i) => i.imageUrl)?.imageUrl ?? null;
}

export function MenuView({
  categories,
  businessName,
}: {
  categories: PublicCategory[];
  businessName?: string | null;
}) {
  const [lang, setLang] = useState<Lang>("tr");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [openItem, setOpenItem] = useState<PublicMenuItem | null>(null);
  const t = UI_TEXT[lang];

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        {/* Üst bar: dil seçici */}
        <div className="mb-6 flex justify-start gap-2">
          {(["tr", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition ${
                lang === l
                  ? "border-transparent bg-pill-active-bg text-pill-active-fg"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Başlık */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-muted">
            {t.digitalMenu}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">{businessName || "Menü"}</h1>
        </div>

        {categories.length === 0 && (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        )}

        {!activeCategory ? (
          // Ana ekran: kategoriler kare, resimli kartlar halinde — 2'li ızgara
          // (mobil uygulamadaki App.tsx'teki grid ile aynı düzen).
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {categories.map((c) => {
              const cover = coverImage(c);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategoryId(c.id)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-border text-left"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={categoryName(c, lang)}
                      fill
                      sizes="(max-width: 640px) 50vw, 384px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-2 text-muted">
                      🍽️
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-bold text-white sm:text-lg">
                        {categoryName(c, lang)}
                      </p>
                      <p className="text-[11px] font-medium text-white/75 sm:text-xs">
                        {t.items(c.items.length)}
                      </p>
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/45 text-sm text-white transition group-hover:translate-x-0.5 sm:h-8 sm:w-8 sm:text-base">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Kategori detay: seçilen kategorideki ürünler.
          <div className="animate-slide-in">
            <button
              onClick={() => setActiveCategoryId(null)}
              className="mb-5 flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
            >
              ← {t.backToCategories}
            </button>
            <h2 className="mb-4 text-lg font-bold">{categoryName(activeCategory, lang)}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {activeCategory.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setOpenItem(item)}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full bg-surface-2">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={itemName(item, lang)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    )}
                    {item.originalPrice && (
                      <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-white">
                        {t.campaign}
                      </span>
                    )}
                    <span className="absolute right-2 top-2 flex flex-col items-end gap-1">
                      {item.originalPrice && (
                        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70 line-through">
                          {money(item.originalPrice, lang)}
                        </span>
                      )}
                      <span className="rounded-full bg-pill-active-bg px-2.5 py-1 text-xs font-bold text-pill-active-fg">
                        {money(item.price, lang)}
                      </span>
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold">{itemName(item, lang)}</p>
                    {itemDescription(item, lang) && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {itemDescription(item, lang)}
                      </p>
                    )}
                    {(item.isVegetarian || item.isVegan || item.allergens.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.isVegetarian && <Tag tone="good">🌿 {t.vegetarian}</Tag>}
                        {item.isVegan && <Tag tone="good">🌱 {t.vegan}</Tag>}
                        {item.allergens.map((a) => (
                          <Tag key={a}>
                            {allergenIcon(a)} {allergenLabel(a, lang)}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {openItem && (
        <ItemModal item={openItem} lang={lang} t={t} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

function Tag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "good" }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        tone === "good"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-surface-2 text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function ItemModal({
  item,
  lang,
  t,
  onClose,
}: {
  item: PublicMenuItem;
  lang: Lang;
  t: (typeof UI_TEXT)[Lang];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full bg-surface-2">
          {item.imageUrl && (
            <Image src={item.imageUrl} alt={itemName(item, lang)} fill className="object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">{itemName(item, lang)}</h3>
            <div className="text-right">
              {item.originalPrice && (
                <p className="text-sm text-muted line-through">
                  {money(item.originalPrice, lang)}
                </p>
              )}
              <p className="text-lg font-bold">{money(item.price, lang)}</p>
            </div>
          </div>
          {itemDescription(item, lang) && (
            <p className="text-sm text-muted">{itemDescription(item, lang)}</p>
          )}

          {(item.isVegetarian || item.isVegan || item.allergens.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.isVegetarian && <Tag tone="good">🌿 {t.vegetarian}</Tag>}
              {item.isVegan && <Tag tone="good">🌱 {t.vegan}</Tag>}
              {item.allergens.map((a) => (
                <Tag key={a}>
                  {allergenIcon(a)} {allergenLabel(a, lang)}
                </Tag>
              ))}
            </div>
          )}

          {item.optionGroups.length > 0 && (
            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <p className="text-sm font-semibold">{t.options}</p>
              {item.optionGroups.map((g) => (
                <div key={g.id}>
                  <p className="text-xs font-medium text-muted">{g.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {g.choices.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs"
                      >
                        {c.name}
                        {Number(c.priceDelta) > 0 && ` (+${money(c.priceDelta, lang)})`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
