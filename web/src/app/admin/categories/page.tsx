import { getCategoriesAdmin } from "@/lib/admin-data";
import { NewCategoryForm } from "./new-category-form";
import { CategoryRowActions } from "./category-row-actions";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Kategoriler</h1>
        <p className="mt-1 text-sm text-muted">
          Menüdeki kategoriler ve sıralamaları. Sıra, QR menüde sekmelerin
          göründüğü sırayı belirler.
        </p>
      </div>

      <NewCategoryForm />

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Henüz kategori yok. Yukarıdan ilk kategoriyi ekleyebilirsin.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">EN adı</th>
                <th className="px-4 py-3 font-medium">Ürün sayısı</th>
                <th className="px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.nameEn ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.itemCount}</td>
                  <td className="px-4 py-3">
                    <CategoryRowActions
                      category={c}
                      isFirst={i === 0}
                      isLast={i === categories.length - 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
