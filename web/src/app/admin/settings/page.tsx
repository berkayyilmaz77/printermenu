import { getAllSettings, SETTINGS_KEYS } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const values = await getAllSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted">
          QR menüde gösterilen genel bilgiler.
        </p>
      </div>
      <SettingsForm businessName={values[SETTINGS_KEYS.businessName] ?? ""} />
    </div>
  );
}
