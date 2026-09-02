import { getTablesAdmin } from "@/lib/admin-data";
import { NewTableForm } from "./new-table-form";
import { TableRow } from "./table-row";

export default async function AdminTablesPage() {
  const tableList = await getTablesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Masalar</h1>
        <p className="mt-1 text-sm text-muted">
          Kasiyer/garson uygulaması sipariş alırken buradaki masalardan seçim yapar. Kapalı
          masalar sipariş ekranında görünmez.
        </p>
      </div>

      <NewTableForm />

      {tableList.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Henüz masa eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {tableList.map((t, i) => (
                <TableRow
                  key={t.id}
                  table={t}
                  isFirst={i === 0}
                  isLast={i === tableList.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
