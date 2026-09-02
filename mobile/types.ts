export type OptionChoice = {
  id: number;
  name: string;
  priceDelta: string;
};

export type OptionGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  choices: OptionChoice[];
};

export type MenuItem = {
  id: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  price: string;
  originalPrice: string | null;
  imageUrl: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
  optionGroups: OptionGroup[];
};

export type Category = {
  id: number;
  name: string;
  nameEn: string | null;
  items: MenuItem[];
};

export type MenuResponse = {
  categories: Category[];
  businessName: string | null;
};

// Sepetteki bir satır. unitPrice, ürün fiyatı + seçilen seçeneklerin
// priceDelta toplamı (sunucu zaten kendi hesaplıyor ama burada da
// gösterim için tutuyoruz).
export type CartLine = {
  key: string;
  menuItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  note: string;
  choiceIds: number[];
  choiceNames: string[];
};
