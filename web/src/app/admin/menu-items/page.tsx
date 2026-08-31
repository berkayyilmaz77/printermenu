import Link from "next/link";
import { getMenuItemsAdmin } from "@/lib/admin-data";
import { AvailabilityToggle } from "./availability-toggle";
import { DeleteItemButton } from "./delete-item-button";
import { MoveButtons } from "./move-buttons";

function money(value: string) {
  const n = Number(value);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export default async function AdminMenuItemsPage() {
  const items = await getMenuItemsAdmin();

  const byCategory = new Map<string, typeof items>();
  for (const item of items) {
    const list = byCategory.get(item.categoryName) ?? [];
    list.push(item);
    byCategory.set(item.categoryName, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Ürünler</h1>
          <p className="mt-1 text-sm text-muted">
            Menüdeki tüm ürünler. Kapalı olanlar QR menüde ve tablette görünmez.
          </p>
        </div>
        <Link
          href="/admin/menu-items/new"
          className="rounded-lg bg-pill-active-bg px-4 py-2 text-sm font-semibold text-pill-active-fg"
        >
          + Yeni ürün
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Henüz ürün yok.{" "}
          <Link href="/admin/menu-items/new" className="underline">
            İlk ürünü ekle
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-8">
          {[...byCategory.entries()].map(([categoryName, catItems]) => (
            <section key={categoryName}>
              <h2 className="mb-3 text-sm font-bold text-muted">{categoryName}</h2>
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ürün</th>
                      <th className="px-4 py-3 font-medium">Fiyat</th>
                      <th className="px-4 py-3 font-medium">Durum</th>
                      <th className="px-4 py-3 font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item, i) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted">
                          {money(item.price)}
                          {item.originalPrice && (
                            <span className="ml-1 line-through">
                              {money(item.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <AvailabilityToggle id={item.id} isAvailable={item.isAvailable} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MoveButtons
                              id={item.id}
                              isFirst={i === 0}
                              isLast={i === catItems.length - 1}
                            />
                            <Link
                              href={`/admin/menu-items/${item.id}/edit`}
                              className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:text-foreground"
                            >
                              Düzenle
                            </Link>
                            <DeleteItemButton id={item.id} name={item.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
