import { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { MenuItem, CartLine } from "./types";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export default function ItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (line: CartLine) => void;
}) {
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);

  function toggleChoice(groupId: number, choiceId: number, maxSelect: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(choiceId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
      }
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [choiceId] };
      }
      if (current.length >= maxSelect) {
        return prev; // max'a ulaşıldı, görmezden gel
      }
      return { ...prev, [groupId]: [...current, choiceId] };
    });
  }

  const chosenChoiceIds = Object.values(selected).flat();
  const chosenChoices = item.optionGroups
    .flatMap((g) => g.choices)
    .filter((c) => chosenChoiceIds.includes(c.id));

  const unitPrice =
    Number(item.price) + chosenChoices.reduce((sum, c) => sum + Number(c.priceDelta), 0);

  function handleAdd() {
    onAdd({
      key: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      unitPrice,
      quantity,
      note: "",
      choiceIds: chosenChoiceIds,
      choiceNames: chosenChoices.map((c) => c.name),
    });
    onClose();
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>{item.name}</Text>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        <Text style={styles.price}>{money(Number(item.price))}</Text>

        {item.optionGroups.map((group) => (
          <View key={group.id} style={{ marginTop: 20 }}>
            <Text style={styles.groupName}>
              {group.name} {group.required ? "(zorunlu)" : ""}
            </Text>
            {group.choices.map((choice) => {
              const isSelected = (selected[group.id] ?? []).includes(choice.id);
              return (
                <Pressable
                  key={choice.id}
                  onPress={() => toggleChoice(group.id, choice.id, group.maxSelect)}
                  style={[styles.choice, isSelected && styles.choiceSelected]}
                >
                  <Text style={{ color: "#fff" }}>
                    {choice.name}
                    {Number(choice.priceDelta) > 0 ? ` (+${money(Number(choice.priceDelta))})` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={styles.qtyRow}>
          <Pressable
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>
            Sepete ekle · {money(unitPrice * quantity)}
          </Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={{ color: "#9a9a9f" }}>Vazgeç</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  description: { marginTop: 8, color: "#9a9a9f" },
  price: { marginTop: 8, fontSize: 18, fontWeight: "600", color: "#fff" },
  groupName: { color: "#9a9a9f", marginBottom: 8, fontWeight: "600" },
  choice: {
    borderWidth: 1,
    borderColor: "#2a2a2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  choiceSelected: { borderColor: "#f5f5f5", backgroundColor: "#1f1f23" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 24, gap: 16 },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { color: "#fff", fontSize: 20 },
  qtyText: { color: "#fff", fontSize: 18, minWidth: 24, textAlign: "center" },
  addButton: {
    marginTop: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addButtonText: { color: "#0a0a0a", fontWeight: "bold", fontSize: 16 },
  cancelButton: { marginTop: 12, alignItems: "center", padding: 10 },
});
