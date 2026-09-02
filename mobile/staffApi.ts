import { API_BASE_URL, DEVICE_KEY } from "./config";
import type { OrderView, TableOverview } from "./types";

// Kasiyer/garson API'sinin ince istemcisi — web tarafındaki lib/staff-orders.ts
// çekirdeğinin aynısını /api/staff/* üzerinden çağırıyor. Web admin panelindeki
// "Sipariş Al" sayfası da aynı çekirdeği kullandığı için ikisi birbirini görür.
class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-device-key": DEVICE_KEY,
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "İstek başarısız oldu.");
  }
  return data as T;
}

export function fetchTables(): Promise<{ tables: TableOverview[] }> {
  return request("/api/staff/tables");
}

export function openTableOrder(tableId: number): Promise<{ order: OrderView }> {
  return request("/api/staff/orders/open", {
    method: "POST",
    body: JSON.stringify({ tableId }),
  });
}

export function fetchOrder(orderId: number): Promise<{ order: OrderView }> {
  return request(`/api/staff/orders/${orderId}`);
}

export function addOrderItem(
  orderId: number,
  line: { menuItemId: number; quantity: number; note?: string | null; choiceIds?: number[] },
): Promise<{ order: OrderView }> {
  return request(`/api/staff/orders/${orderId}/items`, {
    method: "POST",
    body: JSON.stringify(line),
  });
}

export function removeOrderItem(orderId: number, orderItemId: number): Promise<{ order: OrderView }> {
  return request(`/api/staff/orders/${orderId}/items/${orderItemId}`, { method: "DELETE" });
}

export function confirmOrder(orderId: number): Promise<{ order: OrderView }> {
  return request(`/api/staff/orders/${orderId}/confirm`, { method: "POST" });
}
