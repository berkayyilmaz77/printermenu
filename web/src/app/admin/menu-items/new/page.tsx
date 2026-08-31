import { getCategoriesAdmin } from "@/lib/admin-data";
import { ItemForm } from "../item-form";

export default async function NewMenuItemPage() {
  const categories = await getCategoriesAdmin();

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
        Ürün eklemeden önce en az bir kategori oluşturman gerekiyor.{" "}
        <a href="/admin/categories" className="underline">
          Kategorilere git
        </a>
        .
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Yeni ürün</h1>
        <p className="mt-1 text-sm text-muted">
          Kaydettikten sonra bu ürüne seçenek grupları (Boy, Ekstra Malzeme vb.) ekleyebileceksin.
        </p>
      </div>
      <ItemForm categories={categories} />
    </div>
  );
}
