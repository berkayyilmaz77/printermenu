"use client";

import { useRef } from "react";
import { createTable } from "@/lib/admin-actions";

export function NewTableForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTable(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Masa adı</label>
        <input
          name="name"
          required
          placeholder="Örn. Masa 7 veya Bahçe 2"
          className="w-56 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-pill-active-bg px-4 py-2 text-sm font-semibold text-pill-active-fg"
      >
        Ekle
      </button>
    </form>
  );
}
