import { addOptionChoice, addOptionGroup } from "@/lib/admin-actions";
import { PRESET_OPTION_GROUPS } from "@/lib/option-presets";
import type { AdminOptionChoice, AdminOptionGroup } from "@/lib/admin-data";
import { DeleteChoiceButton, DeleteGroupButton } from "./delete-buttons";
import { PresetGroupToggle } from "./preset-group-toggle";

type Group = AdminOptionGroup & { choices: AdminOptionChoice[] };

function ChoiceList({ menuItemId, group }: { menuItemId: number; group: Group }) {
  return (
    <div className="ml-7 mt-3 space-y-3">
      <ul className="space-y-1.5">
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
          <li className="text-xs text-muted">Henüz eklenmedi — aşağıdan istediğin kadar ekleyebilirsin.</li>
        )}
      </ul>

      <form
        action={addOptionChoice.bind(null, group.id, menuItemId)}
        className="flex flex-wrap items-end gap-2"
      >
        <input
          name="name"
          required
          placeholder="Örn. Büyük"
          className="w-40 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
        />
        <input
          name="priceDelta"
          type="number"
          step="0.01"
          placeholder="Fiyat (₺)"
          className="w-28 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-muted"
        />
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
        >
          + Ekle
        </button>
      </form>
    </div>
  );
}

export function OptionGroupsEditor({
  menuItemId,
  groups,
}: {
  menuItemId: number;
  groups: Group[];
}) {
  const boyGroup = groups.find((g) => g.name === PRESET_OPTION_GROUPS.boy.name);
  const ekstraGroup = groups.find((g) => g.name === PRESET_OPTION_GROUPS.ekstra.name);
  // "Boy" ve "Ekstra Malzeme" dışında, admin'in kendi yazdığı özel gruplar
  // (örn. "Şeker") — aşağıda ayrı, gelişmiş bir bölümde gösteriliyor.
  const otherGroups = groups.filter((g) => g !== boyGroup && g !== ekstraGroup);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold">Seçenekler</h2>
        <p className="mt-1 text-xs text-muted">
          Kutuyu işaretleyerek bu ürüne boy veya ekstra malzeme ekle — her biri için istediğin
          kadar seçenek ekleyebilir, her birine ayrı fiyat girebilirsin.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
        <PresetGroupToggle
          menuItemId={menuItemId}
          kind="boy"
          label="Boy seçenekleri"
          hint='Müşteri tek boy seçer (örn. Küçük / Orta / Büyük), her birinin fiyatı farklı olabilir.'
          groupId={boyGroup?.id}
        />
        {boyGroup && <ChoiceList menuItemId={menuItemId} group={boyGroup} />}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
        <PresetGroupToggle
          menuItemId={menuItemId}
          kind="ekstra"
          label="Ekstra malzemeler"
          hint="Müşteri istediği kadar ekstra ekleyebilir (örn. Ekstra Peynir +15₺, Nane +5₺)."
          groupId={ekstraGroup?.id}
        />
        {ekstraGroup && <ChoiceList menuItemId={menuItemId} group={ekstraGroup} />}
      </div>

      <details className="rounded-2xl border border-dashed border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          Gelişmiş: özel bir seçenek grubu daha ekle
        </summary>
        <div className="mt-4 space-y-4">
          {otherGroups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{group.name}</p>
                  <p className="text-xs text-muted">
                    {group.required ? "Zorunlu" : "Opsiyonel"} · min {group.minSelect} · max{" "}
                    {group.maxSelect}
                  </p>
                </div>
                <DeleteGroupButton groupId={group.id} menuItemId={menuItemId} name={group.name} />
              </div>
              <ChoiceList menuItemId={menuItemId} group={group} />
            </div>
          ))}

          <form
            action={addOptionGroup.bind(null, menuItemId)}
            className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface-2 p-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Grup adı</label>
              <input
                name="name"
                required
                placeholder="Örn. Şeker"
                className="w-40 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Min seçim</label>
              <input
                name="minSelect"
                type="number"
                min="0"
                defaultValue={0}
                className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Max seçim</label>
              <input
                name="maxSelect"
                type="number"
                min="1"
                defaultValue={1}
                className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-muted"
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
      </details>
    </div>
  );
}
