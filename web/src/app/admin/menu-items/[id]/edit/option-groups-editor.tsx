import { addOptionChoice, addOptionGroup } from "@/lib/admin-actions";
import type { AdminOptionChoice, AdminOptionGroup } from "@/lib/admin-data";
import { DeleteChoiceButton, DeleteGroupButton } from "./delete-buttons";

type Group = AdminOptionGroup & { choices: AdminOptionChoice[] };

export function OptionGroupsEditor({
  menuItemId,
  groups,
}: {
  menuItemId: number;
  groups: Group[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold">Seçenek grupları</h2>
        <p className="mt-1 text-xs text-muted">
          Örn. &quot;Boy&quot; (tekli seçim, max. 1) veya &quot;Ekstra Malzeme&quot; (çoklu seçim, max. 3 gibi).
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{group.name}</p>
              <p className="text-xs text-muted">
                {group.required ? "Zorunlu" : "Opsiyonel"} · min {group.minSelect} · max{" "}
                {group.maxSelect}
              </p>
            </div>
            <DeleteGroupButton groupId={group.id} menuItemId={menuItemId} name={group.name} />
          </div>

          <ul className="mb-3 space-y-1.5">
            {group.choices.map((choice) => (
              <li
                key={choice.id}
                className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm"
              >
                <span>
                  {choice.name}
                  {Number(choice.priceDelta) > 0 && (
                    <span className="ml-1 text-muted">(+{choice.priceDelta} ₺)</span>
                  )}
                </span>
                <DeleteChoiceButton choiceId={choice.id} menuItemId={menuItemId} />
              </li>
            ))}
            {group.choices.length === 0 && (
              <li className="text-xs text-muted">Henüz seçenek yok.</li>
            )}
          </ul>

          <form
            action={addOptionChoice.bind(null, group.id, menuItemId)}
            className="flex flex-wrap items-end gap-2"
          >
            <input
              name="name"
              required
              placeholder="Seçenek adı (örn. Büyük)"
              className="w-40 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
            />
            <input
              name="priceDelta"
              type="number"
              step="0.01"
              placeholder="+₺"
              className="w-24 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
            />
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
            >
              + Seçenek ekle
            </button>
          </form>
        </div>
      ))}

      <form
        action={addOptionGroup.bind(null, menuItemId)}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-border p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Grup adı</label>
          <input
            name="name"
            required
            placeholder="Örn. Boy"
            className="w-40 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Min seçim</label>
          <input
            name="minSelect"
            type="number"
            min="0"
            defaultValue={0}
            className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Max seçim</label>
          <input
            name="maxSelect"
            type="number"
            min="1"
            defaultValue={1}
            className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
          />
        </div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="required" className="h-4 w-4" />
          Zorunlu
        </label>
        <button
          type="submit"
          className="rounded-lg bg-pill-active-bg px-3 py-1.5 text-xs font-semibold text-pill-active-fg"
        >
          + Grup ekle
        </button>
      </form>
    </div>
  );
}
