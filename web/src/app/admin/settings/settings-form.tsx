"use client";

import { useState } from "react";
import { updateSettings } from "@/lib/admin-actions";

export function SettingsForm({ businessName }: { businessName: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateSettings(formData);
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">İşletme adı</label>
        <input
          name="businessName"
          defaultValue={businessName}
          placeholder="Örn. Kahve Durağı"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        />
        <p className="mt-1 text-xs text-muted">
          Boş bırakılırsa QR menüde varsayılan olarak &quot;Menü&quot; yazar.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-pill-active-bg px-4 py-2 text-sm font-semibold text-pill-active-fg"
        >
          Kaydet
        </button>
        {saved && <span className="text-xs text-muted">Kaydedildi.</span>}
      </div>
    </form>
  );
}
