"use client";

import { useRef, useState } from "react";
import { createPrinter } from "@/lib/admin-actions";

const ADDRESS_HINT: Record<string, string> = {
  bluetooth: "MAC adresi, örn. 00:11:22:33:44:55",
  network: "IP:port, örn. 192.168.1.50:9100",
  usb: "Cihaz üzerindeki tanımlayıcı/isim",
};

export function NewPrinterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState("network");

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPrinter(formData);
        formRef.current?.reset();
        setType("network");
      }}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">İsim</label>
        <input
          name="name"
          required
          placeholder="Örn. Mutfak yazıcısı"
          className="w-40 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Bağlantı tipi</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        >
          <option value="network">Ağ (Wi-Fi/IP)</option>
          <option value="bluetooth">Bluetooth</option>
          <option value="usb">USB</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Adres</label>
        <input
          name="address"
          required
          placeholder={ADDRESS_HINT[type]}
          className="w-56 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Kağıt genişliği</label>
        <select
          name="paperWidthMm"
          defaultValue={80}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        >
          <option value={58}>58mm</option>
          <option value={80}>80mm</option>
        </select>
      </div>
      <label className="mb-2 flex items-center gap-1.5 text-sm">
        <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
        Aktif
      </label>
      <button
        type="submit"
        className="rounded-lg bg-pill-active-bg px-4 py-2 text-sm font-semibold text-pill-active-fg"
      >
        Ekle
      </button>
    </form>
  );
}
