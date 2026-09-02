// Admin panelinde her ürüne kolayca eklenebilen iki hazır seçenek grubu:
// "Boy" (tekli seçim — Küçük/Orta/Büyük gibi) ve "Ekstra Malzeme" (çoklu
// seçim — istediği kadar ekstra, her birinin kendi fiyatı). İkisi de aslında
// normal bir option_groups satırı, sadece admin panelinde isim yazmak yerine
// tek tıkla açılıp kapanan bir kutu olarak sunuluyor. Grup adı bu sabitteki
// isimle birebir eşleştiği için sunucu tarafında "zaten var mı" kontrolü de
// bu isme bakarak yapılıyor.
export const PRESET_OPTION_GROUPS = {
  boy: {
    name: "Boy",
    required: true,
    minSelect: 1,
    maxSelect: 1,
  },
  ekstra: {
    name: "Ekstra Malzeme",
    required: false,
    minSelect: 0,
    // "İstediği kadar seçebilsin" — pratikte sınırsız sayılacak kadar
    // yüksek bir üst sınır (tek tek malzeme sayısı bunu aşmaz).
    maxSelect: 20,
  },
} as const;

export type PresetOptionGroupKind = keyof typeof PRESET_OPTION_GROUPS;
