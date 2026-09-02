"use client";

import { useRef, useState } from "react";
import { enablePresetOptionGroup, deleteOptionGroup } from "@/lib/admin-actions";
import type { PresetOptionGroupKind } from "@/lib/option-presets";

// "Boy" / "Ekstra Malzeme" için tek tıkla açılıp kapanan kutu. İşaretlenince
// o isimde bir seçenek grubu oluşturuluyor (enablePresetOptionGroup), kutu
// kaldırılınca grup (ve içindeki tüm seçenekler) siliniyor.
export function PresetGroupToggle({
  menuItemId,
  kind,
  label,
  hint,
  groupId,
}: {
  menuItemId: number;
  kind: PresetOptionGroupKind;
  label: string;
  hint: string;
  groupId?: number;
}) {
  const [checked, setChecked] = useState(Boolean(groupId));
  const enableFormRef = useRef<HTMLFormElement>(null);
  const disableFormRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form ref={enableFormRef} action={enablePresetOptionGroup.bind(null, menuItemId, kind)} />
      {groupId && (
        <form ref={disableFormRef} action={deleteOptionGroup.bind(null, groupId, menuItemId)} />
      )}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            if (e.target.checked) {
              setChecked(true);
              enableFormRef.current?.requestSubmit();
            } else if (
              confirm(`"${label}" kaldırılsın mı? İçindeki tüm seçenekler de silinecek.`)
            ) {
              setChecked(false);
              disableFormRef.current?.requestSubmit();
            }
          }}
          className="mt-1 h-4 w-4"
        />
        <span>
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block text-xs text-muted">{hint}</span>
        </span>
      </label>
    </div>
  );
}
