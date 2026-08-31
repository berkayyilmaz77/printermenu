"use client";

import { deleteOptionChoice, deleteOptionGroup } from "@/lib/admin-actions";

export function DeleteGroupButton({
  groupId,
  menuItemId,
  name,
}: {
  groupId: number;
  menuItemId: number;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`"${name}" grubunu ve içindeki tüm seçenekleri silmek istediğine emin misin?`)) {
          deleteOptionGroup(groupId, menuItemId);
        }
      }}
      className="rounded-full border border-border px-2.5 py-1 text-xs text-accent transition hover:bg-accent/10"
    >
      Grubu sil
    </button>
  );
}

export function DeleteChoiceButton({
  choiceId,
  menuItemId,
}: {
  choiceId: number;
  menuItemId: number;
}) {
  return (
    <button
      type="button"
      onClick={() => deleteOptionChoice(choiceId, menuItemId)}
      className="text-muted transition hover:text-accent"
      title="Seçeneği sil"
    >
      ✕
    </button>
  );
}
