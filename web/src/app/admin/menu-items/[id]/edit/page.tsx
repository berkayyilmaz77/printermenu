import { notFound } from "next/navigation";
import { getCategoriesAdmin, getMenuItemAdmin } from "@/lib/admin-data";
import { ItemForm } from "../../item-form";
import { OptionGroupsEditor } from "./option-groups-editor";

export default async function EditMenuItemPage({
  params,
}: PageProps<"/admin/menu-items/[id]/edit">) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) notFound();

  const [categories, data] = await Promise.all([
    getCategoriesAdmin(),
    getMenuItemAdmin(itemId),
  ]);
  if (!data) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-xl font-bold">{data.item.name} düzenle</h1>
      </div>
      <ItemForm categories={categories} item={data.item} />
      <div className="border-t border-border pt-6">
        <OptionGroupsEditor menuItemId={itemId} groups={data.groups} />
      </div>
    </div>
  );
}
