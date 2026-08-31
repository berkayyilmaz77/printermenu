"use client";

import { moveMenuItem } from "@/lib/admin-actions";

export function MoveButtons({
  id,
  isFirst,
  isLast,
}: {
  id: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => moveMenuItem(id, "up")}
        className="rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground disabled:opacity-30"
        title="Yukarı taşı"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={() => moveMenuItem(id, "down")}
        className="rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground disabled:opacity-30"
        title="Aşağı taşı"
      >
        ↓
      </button>
    </div>
  );
}
