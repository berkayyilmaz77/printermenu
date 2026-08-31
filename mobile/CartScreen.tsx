import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { CartLine } from "./types";
import { API_BASE_URL, DEVICE_KEY } from "./config";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export default function CartScreen({
  cart,
  onRemove,
  onClear,
  onBack,
}: {
  cart: CartLine[];
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
      Alert.alert("Sipariş alındı", `Sipariş no: ${data.order.orderNumber}\nMutfağa iletiliyor.`);
      onClear();
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Sipariş gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>‹ Menü</Text>
        </Pressable>
        <Text style={styles.title}>Sepet</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {cart.length === 0 && (
          <Text style={{ color: "#9a9a9f", textAlign: "center", marginTop: 40 }}>
            Sepet boş.
          </Text>
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
            <Pressable onPress={() => onRemove(line.key)} style={{ marginLeft: 12 }}>
              <Text style={{ color: "#e5484d" }}>Sil</Text>
            </Pressable>
          </View>
        ))}

        {cart.length > 0 && (
          <>
            <TextInput
              placeholder="Masa no (opsiyonel)"
              placeholderTextColor="#9a9a9f"
              value={tableNumber}
              onChangeText={setTableNumber}
              style={styles.tableInput}
            />
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
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.submitButtonText}>Siparişi Gönder</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2e",
  },
  back: { color: "#9a9a9f" },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  line: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f23",
    paddingVertical: 12,
  },
  lineName: { color: "#fff", fontWeight: "600" },
  lineChoices: { color: "#9a9a9f", fontSize: 12, marginTop: 2 },
  linePrice: { color: "#fff" },
  tableInput: {
    borderWidth: 1,
    borderColor: "#2a2a2e",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginTop: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  totalLabel: { color: "#9a9a9f", fontSize: 16 },
  totalValue: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#f5f5f5",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "#0a0a0a", fontWeight: "bold", fontSize: 16 },
});
