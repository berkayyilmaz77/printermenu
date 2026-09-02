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

// --- Kasiyer/garson sipariş akışı (web tarafındaki lib/staff-orders.ts ile
// aynı şekiller — /api/staff/* buradan JSON döner) ---

export type TableOverview = {
  id: number;
  name: string;
  order: null | {
    id: number;
    orderNumber: string;
    status: string; // open | confirmed
    total: string;
    itemCount: number;
  };
};

export type OrderItemOption = { name: string; priceDelta: string };

export type OrderItemView = {
  id: number;
  menuItemId: number | null;
  name: string;
  unitPrice: string;
  quantity: number;
  note: string | null;
  options: OrderItemOption[];
};

export type OrderView = {
  id: number;
  orderNumber: string;
  tableId: number | null;
  tableNumber: string | null;
  status: string; // open | confirmed | paid | cancelled
  total: string;
  items: OrderItemView[];
};
