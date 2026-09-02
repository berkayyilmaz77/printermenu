// Alerjen kodu -> Türkçe etiket + ikon (emoji, ekstra ikon paketi gerekmesin
// ve web ile birebir aynı görünsün diye). Web tarafındaki lib/allergens.ts ile
// aynı kodları kullanır (mobil app'te dil seçici yok, TR yeterli).
const ALLERGEN_INFO: Record<string, { label: string; icon: string }> = {
  gluten: { label: "Gluten", icon: "🌾" },
  sut: { label: "Süt", icon: "🥛" },
  yumurta: { label: "Yumurta", icon: "🥚" },
  findik: { label: "Fındık / Kabuklu Yemiş", icon: "🥜" },
  soya: { label: "Soya", icon: "🫘" },
  balik: { label: "Balık", icon: "🐟" },
  kabuklu_deniz_urunu: { label: "Kabuklu Deniz Ürünü", icon: "🦐" },
  susam: { label: "Susam", icon: "🟤" },
};

export function allergenLabel(code: string): string {
  return ALLERGEN_INFO[code]?.label ?? code;
}

export function allergenIcon(code: string): string {
  return ALLERGEN_INFO[code]?.icon ?? "⚠️";
}
