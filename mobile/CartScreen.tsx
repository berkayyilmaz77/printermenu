import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { CartLine } from "./types";
import { API_BASE_URL, DEVICE_KEY } from "./config";
import { printOrder } from "./printer";
import { colors, radius, spacing, typography, cardShadow, backgroundGradient } from "./theme";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export default function CartScreen({
  cart,
  businessName,
  onRemove,
  onClear,
  onBack,
}: {
  cart: CartLine[];
  businessName: string | null;
  onRemove: (key: string) => void;
  onClear: () => void;
  onBack: () => void;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [sending, setSending] = useState(false);

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  async function submitOrder() {
    if (cart.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-key": DEVICE_KEY,
        },
        body: JSON.stringify({
          tableNumber: tableNumber || null,
          items: cart.map((line) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            note: line.note || null,
            choiceIds: line.choiceIds,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Sipariş gönderilemedi.");
      }

      const data = await res.json();
      await printOrder(
        {
          orderNumber: data.order.orderNumber,
          tableNumber: data.order.tableNumber,
          total: Number(data.order.total),
          items: cart.map((line) => ({
            name: line.name,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            note: line.note,
            choiceNames: line.choiceNames,
          })),
        },
        businessName ?? "",
      );
      Alert.alert("Sipariş alındı", `Sipariş no: ${data.order.orderNumber}\nMutfağa iletiliyor.`);
      onClear();
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Sipariş gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          <Text style={styles.backText}>Menü</Text>
        </Pressable>
        <Text style={styles.title}>Sepet</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {cart.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={36} color={colors.muted} />
            <Text style={styles.emptyText}>Sepet boş.</Text>
          </View>
        )}
        {cart.map((line) => (
          <View key={line.key} style={styles.line}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineName}>
                {line.quantity}× {line.name}
              </Text>
              {line.choiceNames.length > 0 && (
                <Text style={styles.lineChoices}>{line.choiceNames.join(", ")}</Text>
              )}
            </View>
            <Text style={styles.linePrice}>{money(line.unitPrice * line.quantity)}</Text>
            <Pressable onPress={() => onRemove(line.key)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={18} color={colors.accent} />
            </Pressable>
          </View>
        ))}

        {cart.length > 0 && (
          <>
            <View style={styles.tableInputWrap}>
              <Ionicons name="restaurant-outline" size={16} color={colors.muted} />
              <TextInput
                placeholder="Masa no (opsiyonel)"
                placeholderTextColor={colors.muted}
                value={tableNumber}
                onChangeText={setTableNumber}
                style={styles.tableInput}
              />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{money(total)}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <Pressable style={styles.submitButton} onPress={submitOrder} disabled={sending}>
          {sending ? (
            <ActivityIndicator color={colors.pillActiveFg} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.pillActiveFg} />
              <Text style={styles.submitButtonText}>Siparişi Gönder</Text>
            </>
          )}
        </Pressable>
      )}
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 70 },
  backText: { color: colors.muted, fontWeight: "600" },
  title: { color: colors.foreground, ...typography.heading },
  emptyState: { alignItems: "center", gap: spacing.sm, marginTop: 60 },
  emptyText: { color: colors.muted },
  line: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lineName: { color: colors.foreground, fontWeight: "700" },
  lineChoices: { color: colors.muted, fontSize: 12, marginTop: 2 },
  linePrice: { color: colors.foreground, fontWeight: "700", marginLeft: spacing.sm },
  removeButton: { marginLeft: spacing.md, padding: 4 },
  tableInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  tableInput: { flex: 1, color: colors.foreground, paddingVertical: spacing.md, fontSize: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xl },
  totalLabel: { color: colors.muted, fontSize: 16 },
  totalValue: { color: colors.foreground, fontSize: 22, fontWeight: "800" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.pillActiveBg,
    margin: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    ...cardShadow,
  },
  submitButtonText: { color: colors.pillActiveFg, fontWeight: "800", fontSize: 16 },
});
