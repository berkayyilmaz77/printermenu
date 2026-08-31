"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { PublicCategory, PublicMenuItem } from "@/lib/menu-data";
import { allergenLabel } from "@/lib/allergens";

type Lang = "tr" | "en";

const UI_TEXT = {
  tr: {
    digitalMenu: "DİJİTAL MENÜ",
    all: "Tümü",
    vegetarian: "Vejetaryen",
    vegan: "Vegan",
    allergens: "Alerjenler",
    options: "Seçenekler",
    empty: "Menüde henüz ürün yok.",
    campaign: "İndirim",
  },
  en: {
    digitalMenu: "DIGITAL MENU",
    all: "All",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    allergens: "Allergens",
    options: "Options",
    empty: "No items in the menu yet.",
    campaign: "Sale",
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

export function MenuView({ categories }: { categories: PublicCategory[] }) {
  const [lang, setLang] = useState<Lang>("tr");
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [openItem, setOpenItem] = useState<PublicMenuItem | null>(null);
  const t = UI_TEXT[lang];

  const visibleCategories = useMemo(() => {
    if (activeCategory === "all") return categories;
    return categories.filter((c) => c.id === activeCategory);
  }, [categories, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <h1 className="text-2xl font-bold sm:text-3xl">Menü</h1>
        </div>

        {/* Kategori sekmeleri */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === "all"
                ? "border-transparent bg-pill-active-bg text-pill-active-fg"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategory === c.id
                  ? "border-transparent bg-pill-active-bg text-pill-active-fg"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {lang === "en" && c.nameEn ? c.nameEn : c.name}
            </button>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        )}

        {/* Kategoriler ve ürünler */}
        <div className="space-y-10">
          {visibleCategories.map((c) => (
            <section key={c.id}>
              <h2 className="mb-4 text-lg font-bold">
                {lang === "en" && c.nameEn ? c.nameEn : c.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {c.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOpenItem(item)}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition hover:border-muted"
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
                          {item.isVegetarian && <Tag>{t.vegetarian}</Tag>}
                          {item.isVegan && <Tag>{t.vegan}</Tag>}
                          {item.allergens.map((a) => (
                            <Tag key={a} muted>
                              {allergenLabel(a, lang)}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {openItem && (
        <ItemModal item={openItem} lang={lang} t={t} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        muted ? "border-border text-muted" : "border-emerald-800 text-emerald-400"
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center"
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
              {item.isVegetarian && <Tag>{t.vegetarian}</Tag>}
              {item.isVegan && <Tag>{t.vegan}</Tag>}
              {item.allergens.map((a) => (
                <Tag key={a} muted>
                  {allergenLabel(a, lang)}
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
                        className="rounded-full border border-border px-2.5 py-1 text-xs"
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
