"use client";

import { toggleMenuItemAvailability } from "@/lib/admin-actions";

export function AvailabilityToggle({
  id,
  isAvailable,
}: {
  id: number;
  isAvailable: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => toggleMenuItemAvailability(id, !isAvailable)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        isAvailable
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border text-muted"
      }`}
      title={isAvailable ? "Satıştan kaldır" : "Satışa aç"}
    >
      {isAvailable ? "Satışta" : "Kapalı"}
    </button>
  );
}
