"use client";

import { useState } from "react";
import { deleteTable, moveTable, toggleTableActive, updateTable } from "@/lib/admin-actions";
import type { AdminTable } from "@/lib/admin-data";

export function TableRow({
  table,
  isFirst,
  isLast,
}: {
  table: AdminTable;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-border">
        <td colSpan={3} className="px-4 py-3">
          <form
            action={async (formData) => {
              await updateTable(table.id, formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              name="name"
              defaultValue={table.name}
              required
              className="w-40 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
            />
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
      <td className="px-4 py-3 font-medium">{table.name}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => toggleTableActive(table.id, !table.isActive)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            table.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-border text-muted"
          }`}
        >
          {table.isActive ? "Aktif" : "Kapalı"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => moveTable(table.id, "up")}
            className="rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground disabled:opacity-30"
            title="Yukarı taşı"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => moveTable(table.id, "down")}
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
              if (confirm(`"${table.name}" silinsin mi?`)) {
                deleteTable(table.id);
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
