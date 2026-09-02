import { ALLERGEN_CODES } from "@/db/schema";

export type AllergenCode = (typeof ALLERGEN_CODES)[number];

export const ALLERGEN_LABELS: Record<AllergenCode, { tr: string; en: string }> = {
  gluten: { tr: "Gluten", en: "Gluten" },
  sut: { tr: "Süt", en: "Milk" },
  yumurta: { tr: "Yumurta", en: "Egg" },
  findik: { tr: "Fındık / Kabuklu Yemiş", en: "Nuts" },
  soya: { tr: "Soya", en: "Soy" },
  balik: { tr: "Balık", en: "Fish" },
  kabuklu_deniz_urunu: { tr: "Kabuklu Deniz Ürünü", en: "Shellfish" },
  susam: { tr: "Susam", en: "Sesame" },
};

// Mobil uygulamadaki allergens.ts ile aynı ikonlar — iki yüzde de aynı görünsün diye.
export const ALLERGEN_ICONS: Record<AllergenCode, string> = {
  gluten: "🌾",
  sut: "🥛",
  yumurta: "🥚",
  findik: "🥜",
  soya: "🫘",
  balik: "🐟",
  kabuklu_deniz_urunu: "🦐",
  susam: "🟤",
};

export function allergenLabel(code: string, lang: "tr" | "en"): string {
  const entry = ALLERGEN_LABELS[code as AllergenCode];
  return entry ? entry[lang] : code;
}

export function allergenIcon(code: string): string {
  return ALLERGEN_ICONS[code as AllergenCode] ?? "⚠️";
}
