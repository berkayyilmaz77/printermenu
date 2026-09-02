// Kullanım: node --env-file=.env.local scripts/seed-test-items.mjs
// Tasarım/tablet testi için örnek kategori ve ürün verisi ekler (resimli,
// kampanyalı, vejetaryen/vegan, seçenek gruplu çeşitler). Tekrar çalıştırılırsa
// isme göre "on conflict do nothing" olmadığı için yeni satırlar eklenir —
// idempotent değildir, bilerek bir kereliğine kullanılmak üzere yazıldı.
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function img(seed) {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

const categories = [
  { name: "Başlangıçlar", nameEn: "Starters", sortOrder: 1 },
  { name: "Tatlılar", nameEn: "Desserts", sortOrder: 2 },
  { name: "İçecekler", nameEn: "Drinks", sortOrder: 3 },
];

const [anaYemekler] = await sql`select id from categories where name = 'Ana Yemekler' limit 1`;
if (!anaYemekler) {
  console.error("'Ana Yemekler' kategorisi bulunamadı, önce ilk kurulum verisi olmalı.");
  process.exit(1);
}

const categoryIds = { "Ana Yemekler": anaYemekler.id };
for (const c of categories) {
  const [row] = await sql`
    insert into categories (name, name_en, sort_order)
    values (${c.name}, ${c.nameEn}, ${c.sortOrder})
    returning id
  `;
  categoryIds[c.name] = row.id;
}

const items = [
  {
    category: "Ana Yemekler",
    name: "Tavuk Şiş",
    nameEn: "Chicken Skewer",
    description: "Marine edilmiş tavuk göğsü, közlenmiş sebzeler ile.",
    descriptionEn: "Marinated chicken breast with charred vegetables.",
    price: "220.00",
    originalPrice: null,
    seed: "tavuk-sis",
    allergens: [],
  },
  {
    category: "Ana Yemekler",
    name: "Karışık Pizza",
    nameEn: "Mixed Pizza",
    description: "Sucuk, sosis, mantar, biber, zeytin.",
    descriptionEn: "Sausage, mushroom, pepper, olives.",
    price: "280.00",
    originalPrice: "320.00",
    seed: "karisik-pizza",
    allergens: ["gluten", "sut"],
    optionGroup: {
      name: "Boy",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      choices: [
        { name: "Orta", priceDelta: "0" },
        { name: "Büyük", priceDelta: "40" },
      ],
    },
  },
  {
    category: "Başlangıçlar",
    name: "Mercimek Çorbası",
    nameEn: "Lentil Soup",
    description: "Ev yapımı, tereyağlı.",
    descriptionEn: "Homemade, with butter.",
    price: "90.00",
    originalPrice: null,
    seed: "mercimek",
    isVegetarian: true,
    allergens: ["sut"],
  },
  {
    category: "Başlangıçlar",
    name: "Sigara Böreği",
    nameEn: "Cheese Rolls",
    description: "Beyaz peynirli, 6 adet.",
    descriptionEn: "White cheese filling, 6 pieces.",
    price: "130.00",
    originalPrice: null,
    seed: "sigara-boregi",
    isVegetarian: true,
    allergens: ["gluten", "sut", "yumurta"],
  },
  {
    category: "Başlangıçlar",
    name: "Humus",
    nameEn: "Hummus",
    description: "Zeytinyağlı, közlenmiş ekmek ile.",
    descriptionEn: "With olive oil, served with grilled bread.",
    price: "110.00",
    originalPrice: "130.00",
    seed: "humus",
    isVegetarian: true,
    isVegan: true,
    allergens: ["susam", "gluten"],
  },
  {
    category: "Tatlılar",
    name: "Künefe",
    nameEn: "Künefe",
    description: "Antep fıstıklı, sıcak servis.",
    descriptionEn: "With pistachio, served hot.",
    price: "150.00",
    originalPrice: null,
    seed: "kunefe",
    isVegetarian: true,
    allergens: ["sut", "gluten", "findik"],
  },
  {
    category: "Tatlılar",
    name: "Sufle",
    nameEn: "Chocolate Soufflé",
    description: "Sıcak çikolatalı, vanilyalı dondurma ile.",
    descriptionEn: "Warm chocolate, served with vanilla ice cream.",
    price: "140.00",
    originalPrice: null,
    seed: "sufle",
    isVegetarian: true,
    allergens: ["sut", "yumurta", "gluten"],
  },
  {
    category: "Tatlılar",
    name: "Baklava",
    nameEn: "Baklava",
    description: "4 dilim, cevizli.",
    descriptionEn: "4 slices, with walnuts.",
    price: "160.00",
    originalPrice: "180.00",
    seed: "baklava",
    isVegetarian: true,
    allergens: ["gluten", "findik", "sut"],
  },
  {
    category: "İçecekler",
    name: "Ayran",
    nameEn: "Ayran",
    description: "330ml, ev yapımı.",
    descriptionEn: "330ml, homemade.",
    price: "45.00",
    originalPrice: null,
    seed: "ayran",
    isVegetarian: true,
    allergens: ["sut"],
  },
  {
    category: "İçecekler",
    name: "Türk Kahvesi",
    nameEn: "Turkish Coffee",
    description: "Cezvede, lokum ile.",
    descriptionEn: "Brewed in cezve, served with Turkish delight.",
    price: "70.00",
    originalPrice: null,
    seed: "turk-kahvesi",
    isVegetarian: true,
    isVegan: true,
    allergens: [],
    optionGroup: {
      name: "Şeker",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      choices: [
        { name: "Sade", priceDelta: "0" },
        { name: "Az Şekerli", priceDelta: "0" },
        { name: "Şekerli", priceDelta: "0" },
      ],
    },
  },
];

let sortOrder = { [anaYemekler.id]: 1 };
for (const item of items) {
  const categoryId = categoryIds[item.category];
  const order = sortOrder[categoryId] ?? 0;
  sortOrder[categoryId] = order + 1;

  const [row] = await sql`
    insert into menu_items (
      category_id, name, name_en, description, description_en, price, original_price,
      image_url, is_available, is_vegetarian, is_vegan, allergens, sort_order
    ) values (
      ${categoryId}, ${item.name}, ${item.nameEn}, ${item.description}, ${item.descriptionEn},
      ${item.price}, ${item.originalPrice}, ${img(item.seed)}, true,
      ${item.isVegetarian ?? false}, ${item.isVegan ?? false}, ${item.allergens ?? []}, ${order}
    )
    returning id
  `;

  if (item.optionGroup) {
    const [group] = await sql`
      insert into option_groups (menu_item_id, name, required, min_select, max_select, sort_order)
      values (${row.id}, ${item.optionGroup.name}, ${item.optionGroup.required}, ${item.optionGroup.minSelect}, ${item.optionGroup.maxSelect}, 0)
      returning id
    `;
    for (let i = 0; i < item.optionGroup.choices.length; i++) {
      const c = item.optionGroup.choices[i];
      await sql`
        insert into option_choices (group_id, name, price_delta, is_available, sort_order)
        values (${group.id}, ${c.name}, ${c.priceDelta}, true, ${i})
      `;
    }
  }

  console.log(`+ ${item.name} (${item.category})`);
}

console.log(`\n${items.length} ürün + ${categories.length} kategori eklendi.`);
