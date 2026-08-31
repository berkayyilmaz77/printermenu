// Fişin metin olarak biçimlendirilmesi. Gerçek yazıcıya gönderme kısmı (ESC/POS
// komutları, Bluetooth/USB/ağ üzerinden yollama) donanım belli olunca eklenecek
// — bu dosya sadece "kağıda ne yazılacak"ı hazırlıyor, printer.ts o satırları
// alıp gönderecek.

export type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string | null;
  choiceNames?: string[];
};

export type ReceiptOrder = {
  orderNumber: string;
  tableNumber?: string | null;
  items: ReceiptItem[];
  total: number;
};

// 58mm ve 80mm kağıtlarda standart termal yazıcı fontuyla sığan karakter sayısı.
const CHARS_PER_LINE: Record<number, number> = { 58: 32, 80: 42 };

function money(n: number) {
  return `${n.toFixed(2)} TL`;
}

function center(text: string, width: number) {
  if (text.length >= width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  return " ".repeat(left) + text;
}

function twoColumns(left: string, right: string, width: number) {
  const space = width - left.length - right.length;
  if (space < 1) return `${left} ${right}`;
  return left + " ".repeat(space) + right;
}

export function buildReceiptLines(
  order: ReceiptOrder,
  businessName: string,
  paperWidthMm: number,
): string[] {
  const width = CHARS_PER_LINE[paperWidthMm] ?? 42;
  const divider = "-".repeat(width);
  const lines: string[] = [];

  lines.push(center(businessName || "MENÜ", width));
  lines.push(center(`Sipariş ${order.orderNumber}`, width));
  if (order.tableNumber) lines.push(center(`Masa ${order.tableNumber}`, width));
  lines.push(divider);

  for (const item of order.items) {
    lines.push(
      twoColumns(`${item.quantity}x ${item.name}`, money(item.unitPrice * item.quantity), width),
    );
    for (const choice of item.choiceNames ?? []) {
      lines.push(`   + ${choice}`);
    }
    if (item.note) lines.push(`   Not: ${item.note}`);
  }

  lines.push(divider);
  lines.push(twoColumns("TOPLAM", money(order.total), width));
  lines.push("");
  lines.push(center(new Date().toLocaleString("tr-TR"), width));
  lines.push("");
  lines.push("");

  return lines;
}
