import { API_BASE_URL, DEVICE_KEY } from "./config";
import { buildReceiptLines, type ReceiptOrder } from "./receipt";

export type Printer = {
  id: number;
  name: string;
  type: "bluetooth" | "network" | "usb";
  address: string;
  paperWidthMm: number;
  isActive: boolean;
};

export async function fetchPrinters(): Promise<Printer[]> {
  const res = await fetch(`${API_BASE_URL}/api/printers`, {
    headers: { "x-device-key": DEVICE_KEY },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.printers;
}

// Siparişi ilk aktif yazıcıya "gönderir". Şu an için gerçek donanım
// bağlantısı yok — hangi yazıcı (Bluetooth/USB/ağ) kullanılacağı ve hangi
// kütüphaneyle konuşulacağı netleşince aşağıdaki switch'in içi doldurulacak.
// Şimdilik fişin nasıl göründüğünü konsola basıyor, böylece format hazır.
export async function printOrder(order: ReceiptOrder, businessName: string) {
  const printers = await fetchPrinters();
  const printer = printers[0];

  if (!printer) {
    console.log("[printer] Aktif yazıcı yok, fiş sadece burada:");
    console.log(buildReceiptLines(order, businessName, 80).join("\n"));
    return { printed: false, reason: "no-printer" as const };
  }

  const lines = buildReceiptLines(order, businessName, printer.paperWidthMm);

  switch (printer.type) {
    case "network":
      // TODO: printer.address ("ip:port") ile TCP soket açıp ESC/POS
      // komutlarıyla lines'ı gönder (örn. react-native-tcp-socket).
      console.log(`[printer] (network) ${printer.address} ->`);
      console.log(lines.join("\n"));
      break;
    case "bluetooth":
      // TODO: printer.address (MAC) ile eşleştirilmiş yazıcıya ESC/POS
      // kütüphanesiyle gönder (örn. react-native-thermal-receipt-printer).
      console.log(`[printer] (bluetooth) ${printer.address} ->`);
      console.log(lines.join("\n"));
      break;
    case "usb":
      // TODO: USB yazıcı kütüphanesiyle gönder.
      console.log(`[printer] (usb) ${printer.address} ->`);
      console.log(lines.join("\n"));
      break;
  }

  return { printed: false, reason: "not-implemented" as const, lines };
}
