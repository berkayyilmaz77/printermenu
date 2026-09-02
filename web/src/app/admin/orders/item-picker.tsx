"use client";

import { useMemo, useState } from "react";
import type { PublicCategory, PublicMenuItem } from "@/lib/menu-data";

function money(value: string | number) {
  const n = Number(value);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export type PickedLine = {
  menuItemId: number;
  quantity: number;
  note?: string | null;
  choiceIds?: number[];
};

// Sipariş ekranındaki "+ Ürün Ekle" butonuyla açılan seçim penceresi.
// Kategori sekmesi + ürün listesi (garson için hızlı taransın diye satır
// satır, /menu'deki resimli kartlardan bilerek farklı) + ürüne tıklayınca
// adet/seçenek/not giren küçük bir panel. "Ekle" pencereyi kapatmıyor,
// garson art arda birden fazla ürün ekleyebilsin diye listeye geri dönüyor.
export function ItemPicker({
  categories,
  onAdd,
  onClose,
}: {
  categories: PublicCategory[];
  onAdd: (line: PickedLine) => Promise<void>;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(
    categories[0]?.id ?? null,
  );
  const [activeItem, setActiveItem] = useState<PublicMenuItem | null>(null);

  const items = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.items ?? [],
    [categories, activeCategory],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface sm:h-[80vh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-bold">Ürün Ekle</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted transition hover:text-foreground"
          >
            Kapat
          </button>
        </div>

        {activeItem ? (
          <ItemOptionsPanel
            item={activeItem}
            onBack={() => setActiveItem(null)}
            onAdd={async (line) => {
              await onAdd(line);
              setActiveItem(null);
            }}
          />
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    activeCategory === c.id
                      ? "border-transparent bg-pill-active-bg text-pill-active-fg"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 && (
                <p className="p-6 text-center text-sm text-muted">Bu kategoride ürün yok.</p>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="flex w-full items-center justify-between gap-4 border-b border-border px-4 py-3 text-left transition hover:bg-surface-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.description && (
                      <p className="line-clamp-1 text-xs text-muted">{item.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-bold">{money(item.price)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ItemOptionsPanel({
  item,
  onBack,
  onAdd,
}: {
  item: PublicMenuItem;
  onBack: () => void;
  onAdd: (line: PickedLine) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleChoice(groupId: number, choiceId: number, maxSelect: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(choiceId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
      }
      if (maxSelect === 1) return { ...prev, [groupId]: [choiceId] };
      if (current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, choiceId] };
    });
  }

  const chosenChoiceIds = Object.values(selected).flat();
  const chosenChoices = item.optionGroups
    .flatMap((g) => g.choices)
    .filter((c) => chosenChoiceIds.includes(c.id));
  const unitPrice =
    Number(item.price) + chosenChoices.reduce((sum, c) => sum + Number(c.priceDelta), 0);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-sm text-muted transition hover:text-foreground">
          ← Ürünlere dön
        </button>
      </div>
      <div className="flex-1 space-y-5 p-4">
        <div>
          <p className="text-lg font-bold">{item.name}</p>
          {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
          <p className="mt-1 font-semibold">{money(item.price)}</p>
        </div>

        {item.optionGroups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 text-sm font-semibold">
              {group.name} {group.required && <span className="text-xs text-muted">(zorunlu)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.choices.map((choice) => {
                const isSelected = (selected[group.id] ?? []).includes(choice.id);
                return (
                  <button
                    key={choice.id}
                    onClick={() => toggleChoice(group.id, choice.id, group.maxSelect)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      isSelected
                        ? "border-transparent bg-pill-active-bg text-pill-active-fg"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    {choice.name}
                    {Number(choice.priceDelta) > 0 && ` (+${money(choice.priceDelta)})`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <label className="mb-1 block text-sm font-semibold">Not (opsiyonel)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn. az pişmiş, acısız"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Adet</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-border p-4">
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onAdd({
                menuItemId: item.id,
                quantity,
                note: note.trim() || null,
                choiceIds: chosenChoiceIds,
              });
            } finally {
              setSaving(false);
            }
          }}
          className="w-full rounded-lg bg-pill-active-bg px-4 py-2.5 text-sm font-semibold text-pill-active-fg disabled:opacity-60"
        >
          {saving ? "Ekleniyor…" : `Siparişe ekle · ${money(unitPrice * quantity)}`}
        </button>
      </div>
    </div>
  );
}
