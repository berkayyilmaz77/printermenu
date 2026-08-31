"use client";

import { deleteMenuItem } from "@/lib/admin-actions";

export function DeleteItemButton({ id, name }: { id: number; name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`"${name}" ürününü silmek istediğine emin misin?`)) {
          deleteMenuItem(id);
        }
      }}
      className="rounded-full border border-border px-3 py-1 text-xs text-accent transition hover:bg-accent/10"
    >
      Sil
    </button>
  );
}
