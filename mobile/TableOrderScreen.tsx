import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Category, OrderView, TableOverview } from "./types";
import { addOrderItem, confirmOrder, fetchOrder, openTableOrder, removeOrderItem } from "./staffApi";
import { colors, radius, spacing, typography, cardShadow, backgroundGradient } from "./theme";
import ItemPickerModal, { type PickedLine } from "./ItemPickerModal";
import { printOrder } from "./printer";

const POLL_MS = 3000;

function money(n: number | string) {
  const v = Number(n);
  return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)} ₺`;
}

const STATUS_LABEL: Record<string, string> = { open: "Hazırlanıyor", confirmed: "Mutfakta" };

// Bir masanın siparişi: aç/oluştur, ürün ekle/çıkar, onayla. Sipariş "open"
// durumundayken periyodik tazeleniyor — başka bir tablet aynı masaya ürün
// ekleyip çıkarabilir, o değişiklikler burada da görünsün diye.
export default function TableOrderScreen({
  table,
  categories,
  businessName,
  onBack,
}: {
  table: TableOverview;
  categories: Category[];
  businessName: string | null;
  onBack: () => void;
}) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    openTableOrder(table.id)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(err instanceof Error ? err.message : "Sipariş açılamadı."))
      .finally(() => setLoading(false));
  }, [table.id]);

  const refresh = useCallback(() => {
    if (!order) return;
    fetchOrder(order.id)
      .then(({ order: fresh }) => setOrder(fresh))
      .catch(() => {});
  }, [order]);

  useEffect(() => {
    if (!order || order.status !== "open") return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [order, refresh]);

  async function handleAdd(line: PickedLine) {
    if (!order) return;
    try {
      const { order: updated } = await addOrderItem(order.id, line);
      setOrder(updated);
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Ürün eklenemedi.");
    }
  }

  async function handleRemove(orderItemId: number) {
    if (!order) return;
    try {
      const { order: updated } = await removeOrderItem(order.id, orderItemId);
      setOrder(updated);
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Ürün çıkarılamadı.");
    }
  }

  async function handleConfirm() {
    if (!order) return;
    setConfirming(true);
    try {
      const { order: updated } = await confirmOrder(order.id);
      setOrder(updated);
      // En iyi çaba: bu tablet siparişi onayladıysa fişi de yazdırmayı dener
      // (donanım entegrasyonu henüz TODO, bkz. printer.ts).
      printOrder(
        {
          orderNumber: updated.orderNumber,
          tableNumber: updated.tableNumber,
          total: Number(updated.total),
          items: updated.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            note: i.note,
            choiceNames: i.options.map((o) => o.name),
          })),
        },
        businessName ?? "",
      ).catch(() => {});
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Sipariş onaylanamadı.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
            <Text style={styles.backText}>Masalar</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {table.name}
          </Text>
          <View style={{ width: 90 }} />
        </View>

        {order && (
          <Text style={styles.subtitle}>
            Sipariş {order.orderNumber} · {STATUS_LABEL[order.status] ?? order.status}
          </Text>
        )}

        {loading && (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.foreground} size="large" />
          </View>
        )}

        {error && !loading && (
          <View style={styles.centerFill}>
            <Ionicons name="cloud-offline-outline" size={32} color={colors.accent} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {order && (
          <FlatList
            data={order.items}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
            ListEmptyComponent={
              <View style={styles.centerFill}>
                <Text style={styles.emptyText}>Henüz ürün eklenmedi.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.quantity}× {item.name}
                  </Text>
                  {item.options.length > 0 && (
                    <Text style={styles.itemMeta}>{item.options.map((o) => o.name).join(", ")}</Text>
                  )}
                  {item.note && <Text style={styles.itemMeta}>Not: {item.note}</Text>}
                </View>
                <Text style={styles.itemPrice}>{money(Number(item.unitPrice) * item.quantity)}</Text>
                {order.status === "open" && (
                  <Pressable onPress={() => handleRemove(item.id)} style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={18} color={colors.accent} />
                  </Pressable>
                )}
              </View>
            )}
          />
        )}

        {order?.status === "open" && (
          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.secondaryButtonText}>+ Ürün Ekle</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, (confirming || order.items.length === 0) && { opacity: 0.5 }]}
              disabled={confirming || order.items.length === 0}
              onPress={handleConfirm}
            >
              {confirming ? (
                <ActivityIndicator color={colors.pillActiveFg} />
              ) : (
                <Text style={styles.primaryButtonText}>Siparişi Onayla · {money(order.total)}</Text>
              )}
            </Pressable>
          </View>
        )}

        {order?.status === "confirmed" && (
          <View style={styles.confirmedBanner}>
            <Text style={styles.confirmedText}>
              Sipariş mutfağa gönderildi. Bu masaya yeni sipariş eklemek için tekrar masaya dokun.
            </Text>
          </View>
        )}
      </SafeAreaView>

      {showPicker && (
        <ItemPickerModal categories={categories} onAdd={handleAdd} onClose={() => setShowPicker(false)} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 90 },
  backText: { color: colors.muted, fontWeight: "600" },
  title: { flex: 1, textAlign: "center", color: colors.foreground, ...typography.heading },
  subtitle: { color: colors.muted, textAlign: "center", marginTop: spacing.xs, fontSize: 13 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  error: { color: colors.foreground, textAlign: "center", fontWeight: "600" },
  emptyText: { color: colors.muted },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...cardShadow,
  },
  itemName: { color: colors.foreground, fontWeight: "700" },
  itemMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  itemPrice: { color: colors.foreground, fontWeight: "700", marginLeft: spacing.sm },
  removeButton: { marginLeft: spacing.md, padding: 4 },
  footer: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.foreground, fontWeight: "700" },
  primaryButton: {
    flex: 1.4,
    backgroundColor: colors.pillActiveBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    ...cardShadow,
  },
  primaryButtonText: { color: colors.pillActiveFg, fontWeight: "800" },
  confirmedBanner: {
    margin: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#a7e0c4",
    backgroundColor: "#e9f9f1",
    padding: spacing.lg,
  },
  confirmedText: { color: "#1a9c63", fontSize: 13, fontWeight: "600" },
});
