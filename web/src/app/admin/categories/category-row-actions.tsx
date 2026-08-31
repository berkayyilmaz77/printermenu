"use client";

import { useState } from "react";
import {
  deleteCategory,
  moveCategory,
  updateCategory,
} from "@/lib/admin-actions";
import type { AdminCategory } from "@/lib/admin-data";

export function CategoryRowActions({
  category,
  isFirst,
  isLast,
}: {
  category: AdminCategory;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateCategory(category.id, formData);
          setEditing(false);
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          name="name"
          defaultValue={category.name}
          required
          className="w-32 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-muted"
        />
        <input
          name="nameEn"
          defaultValue={category.nameEn ?? ""}
          placeholder="EN adı"
          className="w-32 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-muted"
        />
        <button
          type="submit"
          className="rounded-full bg-pill-active-bg px-3 py-1 text-xs font-semibold text-pill-active-fg"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted"
        >
          Vazgeç
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => moveCategory(category.id, "up")}
        className="rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground disabled:opacity-30"
        title="Yukarı taşı"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={() => moveCategory(category.id, "down")}
        className="rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground disabled:opacity-30"
        title="Aşağı taşı"
      >
        ↓
      </button>
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
          if (confirm(`"${category.name}" kategorisini silmek istediğine emin misin? İçindeki ürünler de silinir.`)) {
            deleteCategory(category.id);
          }
        }}
        className="rounded-full border border-border px-3 py-1 text-xs text-accent transition hover:bg-accent/10"
      >
        Sil
      </button>
    </div>
  );
}
