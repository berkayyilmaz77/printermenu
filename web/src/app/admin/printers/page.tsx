import { getPrintersAdmin } from "@/lib/admin-data";
import { NewPrinterForm } from "./new-printer-form";
import { PrinterRow } from "./printer-row";

export default async function AdminPrintersPage() {
  const printerList = await getPrintersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Yazıcılar</h1>
        <p className="mt-1 text-sm text-muted">
          Bluetooth, ağ (Wi-Fi/IP) veya USB üzerinden bağlı fiş yazıcıları. Tablet
          uygulaması buradaki aktif yazıcı(lar)ı kullanır.
        </p>
      </div>

      <NewPrinterForm />

      {printerList.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Henüz yazıcı eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">İsim</th>
                <th className="px-4 py-3 font-medium">Bağlantı</th>
                <th className="px-4 py-3 font-medium">Adres</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {printerList.map((p) => (
                <PrinterRow key={p.id} printer={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
