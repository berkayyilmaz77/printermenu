"use client";

import { useState } from "react";
import {
  deletePrinter,
  togglePrinterActive,
  updatePrinter,
} from "@/lib/admin-actions";
import type { AdminPrinter } from "@/lib/admin-data";

const TYPE_LABELS: Record<string, string> = {
  bluetooth: "Bluetooth",
  network: "Ağ (Wi-Fi/IP)",
  usb: "USB",
};

const ADDRESS_HINT: Record<string, string> = {
  bluetooth: "MAC adresi, örn. 00:11:22:33:44:55",
  network: "IP:port, örn. 192.168.1.50:9100",
  usb: "Cihaz üzerindeki tanımlayıcı/isim",
};

export function PrinterRow({ printer }: { printer: AdminPrinter }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-border">
        <td colSpan={5} className="px-4 py-4">
          <form
            action={async (formData) => {
              await updatePrinter(printer.id, formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">İsim</label>
              <input
                name="name"
                defaultValue={printer.name}
                required
                className="w-40 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Bağlantı</label>
              <select
                name="type"
                defaultValue={printer.type}
                className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
              >
                <option value="bluetooth">Bluetooth</option>
                <option value="network">Ağ (Wi-Fi/IP)</option>
                <option value="usb">USB</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Adres</label>
              <input
                name="address"
                defaultValue={printer.address}
                required
                className="w-48 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Kağıt (mm)</label>
              <select
                name="paperWidthMm"
                defaultValue={printer.paperWidthMm}
                className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
              >
                <option value={58}>58mm</option>
                <option value={80}>80mm</option>
              </select>
            </div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={printer.isActive} className="h-4 w-4" />
              Aktif
            </label>
            <button
              type="submit"
              className="rounded-full bg-pill-active-bg px-3 py-1.5 text-xs font-semibold text-pill-active-fg"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
            >
              Vazgeç
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 font-medium">{printer.name}</td>
      <td className="px-4 py-3 text-muted">{TYPE_LABELS[printer.type] ?? printer.type}</td>
      <td className="px-4 py-3 text-muted">
        {printer.address}
        <p className="text-xs text-muted/70">{ADDRESS_HINT[printer.type]}</p>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => togglePrinterActive(printer.id, !printer.isActive)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            printer.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-border text-muted"
          }`}
        >
          {printer.isActive ? "Aktif" : "Kapalı"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:text-foreground"
          >
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`"${printer.name}" yazıcısını silmek istediğine emin misin?`)) {
                deletePrinter(printer.id);
              }
            }}
            className="rounded-full border border-border px-3 py-1 text-xs text-accent transition hover:bg-accent/10"
          >
            Sil
          </button>
        </div>
      </td>
    </tr>
  );
}
