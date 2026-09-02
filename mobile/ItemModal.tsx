import { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { MenuItem, CartLine } from "./types";
import { colors, radius, spacing, typography, cardShadow } from "./theme";
import Tag from "./Tag";
import { allergenLabel, allergenIcon } from "./allergens";

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
    <Modal visible animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
            <View style={styles.imageWrap}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Ionicons name="restaurant-outline" size={40} color={colors.muted} />
                </View>
              )}
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  {item.originalPrice && (
                    <Text style={styles.oldPrice}>{money(Number(item.originalPrice))}</Text>
                  )}
                  <Text style={styles.price}>{money(Number(item.price))}</Text>
                </View>
              </View>

              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

              {(item.isVegetarian || item.isVegan || item.allergens.length > 0) && (
                <View style={styles.tagRow}>
                  {item.isVegetarian && <Tag tone="good">🌿 Vejetaryen</Tag>}
                  {item.isVegan && <Tag tone="good">🌱 Vegan</Tag>}
                  {item.allergens.map((a) => (
                    <Tag key={a}>
                      {allergenIcon(a)} {allergenLabel(a)}
                    </Tag>
                  ))}
                </View>
              )}

              {item.optionGroups.map((group) => (
                <View key={group.id} style={styles.group}>
                  <Text style={styles.groupName}>
                    {group.name} {group.required ? "· zorunlu" : ""}
                  </Text>
                  <View style={styles.choiceGrid}>
                    {group.choices.map((choice) => {
                      const isSelected = (selected[group.id] ?? []).includes(choice.id);
                      return (
                        <Pressable
                          key={choice.id}
                          onPress={() => toggleChoice(group.id, choice.id, group.maxSelect)}
                          style={[styles.choice, isSelected && styles.choiceSelected]}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color={colors.pillActiveFg} />
                          )}
                          <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                            {choice.name}
                            {Number(choice.priceDelta) > 0
                              ? ` (+${money(Number(choice.priceDelta))})`
                              : ""}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Adet</Text>
                <View style={styles.qtyControls}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={18} color={colors.foreground} />
                  </Pressable>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
                    <Ionicons name="add" size={18} color={colors.foreground} />
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Sepete ekle · {money(unitPrice * quantity)}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "92%",
    overflow: "hidden",
  },
  imageWrap: { aspectRatio: 16 / 9, backgroundColor: colors.surface2 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: spacing.xl },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
  title: { flex: 1, color: colors.foreground, ...typography.heading, fontSize: 21 },
  oldPrice: { color: colors.muted, fontSize: 13, textDecorationLine: "line-through" },
  price: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
  description: { marginTop: spacing.sm, color: colors.muted, ...typography.body },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md },
  group: { marginTop: spacing.xl },
  groupName: { color: colors.muted, marginBottom: spacing.sm, fontWeight: "700", fontSize: 13 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  choiceSelected: { borderColor: colors.pillActiveBg, backgroundColor: colors.pillActiveBg },
  choiceText: { color: colors.foreground, fontWeight: "600", fontSize: 13 },
  choiceTextSelected: { color: colors.pillActiveFg },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl,
  },
  qtyLabel: { color: colors.foreground, fontWeight: "700", fontSize: 15 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  qtyButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: colors.foreground, fontSize: 17, fontWeight: "700", minWidth: 20, textAlign: "center" },
  addButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.pillActiveBg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    ...cardShadow,
  },
  addButtonText: { color: colors.pillActiveFg, fontWeight: "800", fontSize: 16 },
});
