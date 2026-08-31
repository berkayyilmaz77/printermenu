"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMenuItem, updateMenuItem } from "@/lib/admin-actions";
import { ALLERGEN_LABELS, type AllergenCode } from "@/lib/allergens";
import type { AdminCategory, AdminMenuItem } from "@/lib/admin-data";

const ALLERGEN_LIST = Object.keys(ALLERGEN_LABELS) as AllergenCode[];

export function ItemForm({
  categories,
  item,
}: {
  categories: AdminCategory[];
  item?: AdminMenuItem;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      if (item) {
        await updateMenuItem(item.id, formData);
        router.push("/admin/menu-items");
      } else {
        const id = await createMenuItem(formData);
        router.push(`/admin/menu-items/${id}/edit`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Kategori</label>
          <select
            name="categoryId"
            required
            defaultValue={item?.categoryId ?? categories[0]?.id}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={item?.isAvailable ?? true}
              className="h-4 w-4"
            />
            Satışta
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isVegetarian"
              defaultChecked={item?.isVegetarian ?? false}
              className="h-4 w-4"
            />
            Vejetaryen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isVegan"
              defaultChecked={item?.isVegan ?? false}
              className="h-4 w-4"
            />
            Vegan
          </label>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">İsim (TR)</label>
          <input
            name="name"
            required
            defaultValue={item?.name}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">İsim (EN)</label>
          <input
            name="nameEn"
            defaultValue={item?.nameEn ?? ""}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Açıklama (TR)</label>
          <textarea
            name="description"
            defaultValue={item?.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Açıklama (EN)</label>
          <textarea
            name="descriptionEn"
            defaultValue={item?.descriptionEn ?? ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Fiyat (₺)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={item?.price}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Kampanya öncesi fiyat (₺, opsiyonel)
          </label>
          <input
            name="originalPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.originalPrice ?? ""}
            placeholder="Doluysa üstü çizili gösterilir"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-muted"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">Görsel</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-pill-active-bg file:px-3 file:py-1 file:text-xs file:font-semibold file:text-pill-active-fg"
          />
          {item?.imageUrl && (
            <p className="mt-1 text-xs text-muted">
              Mevcut görsel var, yeni bir dosya seçmezsen değişmez.
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium text-muted">Alerjenler</label>
          <div className="flex flex-wrap gap-3">
            {ALLERGEN_LIST.map((code) => (
              <label key={code} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="allergens"
                  value={code}
                  defaultChecked={item?.allergens?.includes(code) ?? false}
                  className="h-4 w-4"
                />
                {ALLERGEN_LABELS[code].tr}
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-pill-active-bg px-5 py-2 text-sm font-semibold text-pill-active-fg disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : item ? "Kaydet" : "Ürünü oluştur"}
      </button>
    </form>
  );
}
