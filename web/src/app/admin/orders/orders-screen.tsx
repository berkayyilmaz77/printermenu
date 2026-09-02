"use client";

import { useEffect, useState } from "react";
import type { PublicCategory } from "@/lib/menu-data";
import type { OrderView, TableOverview } from "@/lib/staff-orders";
import {
  addOrderItemAction,
  confirmOrderAction,
  getOrderAction,
  getTablesOverviewAction,
  openTableOrderAction,
  removeOrderItemAction,
} from "@/lib/staff-actions";
import { ItemPicker, type PickedLine } from "./item-picker";

const TABLES_POLL_MS = 4000;
const ORDER_POLL_MS = 3000;

function money(value: string | number) {
  const n = Number(value);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Hazırlanıyor",
  confirmed: "Mutfakta",
  paid: "Ödendi",
  cancelled: "İptal",
};

export function OrdersScreen({
  categories,
  initialTables,
}: {
  categories: PublicCategory[];
  initialTables: TableOverview[];
}) {
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [order, setOrder] = useState<OrderView | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Masalar ekranındayken listeyi periyodik tazele — başka bir tablet/sekme
  // bir masayı açtıysa/onayladıysa burada da görünsün.
  useEffect(() => {
    if (selectedTableId !== null) return;
    const id = setInterval(() => {
      getTablesOverviewAction().then(setTables).catch(() => {});
    }, TABLES_POLL_MS);
    return () => clearInterval(id);
  }, [selectedTableId]);

  // Bir masanın siparişi açıkken (henüz onaylanmadıysa) periyodik tazele —
  // başka bir tablet aynı masaya ürün ekleyip çıkarabilir.
  useEffect(() => {
    if (!order || order.status !== "open") return;
    const id = setInterval(() => {
      getOrderAction(order.id).then((fresh) => fresh && setOrder(fresh)).catch(() => {});
    }, ORDER_POLL_MS);
    return () => clearInterval(id);
  }, [order]);

  async function selectTable(table: TableOverview) {
    setError(null);
    setLoadingTable(true);
    setSelectedTableId(table.id);
    try {
      const opened = await openTableOrderAction(table.id);
      setOrder(opened);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş açılamadı.");
      setSelectedTableId(null);
    } finally {
      setLoadingTable(false);
    }
  }

  function backToTables() {
    setSelectedTableId(null);
    setOrder(null);
    setError(null);
    getTablesOverviewAction().then(setTables).catch(() => {});
  }

  async function handleAdd(line: PickedLine) {
    if (!order) return;
    try {
      const updated = await addOrderItemAction(order.id, line);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün eklenemedi.");
    }
  }

  async function handleRemove(orderItemId: number) {
    if (!order) return;
    try {
      const updated = await removeOrderItemAction(order.id, orderItemId);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün çıkarılamadı.");
    }
  }

  async function handleConfirm() {
    if (!order) return;
    try {
      const updated = await confirmOrderAction(order.id);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş onaylanamadı.");
    }
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  if (selectedTableId !== null) {
    return (
      <div className="space-y-6">
        <button onClick={backToTables} className="text-sm text-muted transition hover:text-foreground">
          ← Masalar
        </button>
        <div>
          <h1 className="text-xl font-bold">{selectedTable?.name ?? "Masa"}</h1>
          {order && (
            <p className="mt-1 text-sm text-muted">
              Sipariş {order.orderNumber} · {STATUS_LABEL[order.status] ?? order.status}
            </p>
          )}
        </div>

        {error && <p className="rounded-xl bg-accent/10 p-3 text-sm text-accent">{error}</p>}

        {loadingTable && <p className="text-sm text-muted">Yükleniyor…</p>}

        {order && (
          <>
            <OrderItemsList order={order} onRemove={handleRemove} />

            {order.status === "open" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPicker(true)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:border-muted"
                >
                  + Ürün Ekle
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={order.items.length === 0}
                  className="rounded-lg bg-pill-active-bg px-4 py-2 text-sm font-semibold text-pill-active-fg disabled:opacity-40"
                >
                  Siparişi Onayla · {money(order.total)}
                </button>
              </div>
            )}

            {order.status === "confirmed" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Sipariş mutfağa gönderildi. Bu masaya yeni bir sipariş eklemek için tekrar masaya
                dokun.
              </div>
            )}
          </>
        )}

        {showPicker && (
          <ItemPicker
            categories={categories}
            onAdd={handleAdd}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Sipariş Al</h1>
        <p className="mt-1 text-sm text-muted">
          Masayı seç, sipariş ekle/çıkar, onaylayınca mutfak yazıcısına düşer. Diğer tabletlerle
          bağlantılı — buradaki değişiklikler orada da görünür.
        </p>
      </div>

      {tables.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Henüz masa eklenmedi.{" "}
          <a href="/admin/tables" className="underline">
            Masalar sayfasından ekleyebilirsin.
          </a>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTable(t)}
              className={`rounded-2xl border p-4 text-left transition hover:border-muted ${
                t.order?.status === "confirmed"
                  ? "border-emerald-200 bg-emerald-50"
                  : t.order?.status === "open"
                    ? "border-amber-200 bg-amber-50"
                    : "border-border bg-surface"
              }`}
            >
              <p className="font-bold">{t.name}</p>
              {t.order ? (
                <>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {STATUS_LABEL[t.order.status] ?? t.order.status}
                  </p>
                  <p className="mt-2 text-sm">
                    {t.order.itemCount} ürün · {money(t.order.total)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted">Boş</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderItemsList({
  order,
  onRemove,
}: {
  order: OrderView;
  onRemove: (orderItemId: number) => void;
}) {
  if (order.items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Henüz ürün eklenmedi.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {order.items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-3"
        >
          <div>
            <p className="font-semibold">
              {item.quantity}× {item.name}
            </p>
            {item.options.length > 0 && (
              <p className="text-xs text-muted">{item.options.map((o) => o.name).join(", ")}</p>
            )}
            {item.note && <p className="text-xs italic text-muted">Not: {item.note}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-semibold">{money(Number(item.unitPrice) * item.quantity)}</span>
            {order.status === "open" && (
              <button
                onClick={() => onRemove(item.id)}
                className="text-muted transition hover:text-accent"
                title="Çıkar"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
