import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category, MenuItem } from "./types";
import { colors, radius, spacing, typography } from "./theme";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export type PickedLine = {
  menuItemId: number;
  quantity: number;
  note?: string | null;
  choiceIds?: number[];
};

// Sipariş ekranındaki "+ Ürün Ekle" ile açılan pencere — web'deki
// admin/orders/item-picker.tsx ile aynı fikir: kategori sekmesi + hızlı
// taranan ürün listesi, ürüne dokununca adet/seçenek/not paneli. "Ekle"
// pencereyi kapatmıyor, garson art arda birden fazla ürün ekleyebilsin diye
// listeye geri dönüyor.
export default function ItemPickerModal({
  categories,
  onAdd,
  onClose,
}: {
  categories: Category[];
  onAdd: (line: PickedLine) => Promise<void>;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(categories[0]?.id ?? null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const items = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.items ?? [],
    [categories, activeCategory],
  );

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ürün Ekle</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
          </View>

          {activeItem ? (
            <OptionsPanel
              item={activeItem}
              onBack={() => setActiveItem(null)}
              onAdd={async (line) => {
                await onAdd(line);
                setActiveItem(null);
              }}
            />
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabs}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
              >
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setActiveCategory(c.id)}
                    style={[styles.tab, activeCategory === c.id && styles.tabActive]}
                  >
                    <Text style={activeCategory === c.id ? styles.tabTextActive : styles.tabText}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Bu kategoride ürün yok.</Text>
                }
                renderItem={({ item }) => (
                  <Pressable style={styles.row} onPress={() => setActiveItem(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.rowDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.rowPrice}>{money(Number(item.price))}</Text>
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function OptionsPanel({
  item,
  onBack,
  onAdd,
}: {
  item: MenuItem;
  onBack: () => void;
  onAdd: (line: PickedLine) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleChoice(groupId: number, choiceId: number, maxSelect: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(choiceId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
      }
      if (maxSelect === 1) return { ...prev, [groupId]: [choiceId] };
      if (current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, choiceId] };
    });
  }

  const chosenChoiceIds = Object.values(selected).flat();
  const chosenChoices = item.optionGroups
    .flatMap((g) => g.choices)
    .filter((c) => chosenChoiceIds.includes(c.id));
  const unitPrice =
    Number(item.price) + chosenChoices.reduce((sum, c) => sum + Number(c.priceDelta), 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
      <Pressable onPress={onBack}>
        <Text style={styles.backLink}>← Ürünlere dön</Text>
      </Pressable>

      <Text style={styles.itemName}>{item.name}</Text>
      {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
      <Text style={styles.itemPrice}>{money(Number(item.price))}</Text>

      {item.optionGroups.map((group) => (
        <View key={group.id} style={{ marginTop: spacing.lg }}>
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
                  <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                    {choice.name}
                    {Number(choice.priceDelta) > 0 ? ` (+${money(Number(choice.priceDelta))})` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ marginTop: spacing.lg }}>
        <Text style={styles.groupName}>Not (opsiyonel)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Örn. az pişmiş, acısız"
          placeholderTextColor={colors.muted}
          style={styles.noteInput}
        />
      </View>

      <View style={styles.qtyRow}>
        <Text style={styles.groupName}>Adet</Text>
        <View style={styles.qtyControls}>
          <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
            <Ionicons name="add" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <Pressable
        disabled={saving}
        style={[styles.addButton, saving && { opacity: 0.6 }]}
        onPress={async () => {
          setSaving(true);
          try {
            await onAdd({
              menuItemId: item.id,
              quantity,
              note: note.trim() || null,
              choiceIds: chosenChoiceIds,
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? (
          <ActivityIndicator color={colors.pillActiveFg} />
        ) : (
          <Text style={styles.addButtonText}>Siparişe ekle · {money(unitPrice * quantity)}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: "88%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.foreground, ...typography.heading },
  closeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  closeText: { color: colors.muted, fontWeight: "600" },
  tabs: { flexGrow: 0, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabActive: { backgroundColor: colors.pillActiveBg, borderColor: colors.pillActiveBg },
  tabText: { color: colors.muted, fontWeight: "600" },
  tabTextActive: { color: colors.pillActiveFg, fontWeight: "700" },
  emptyText: { color: colors.muted, textAlign: "center", padding: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowName: { color: colors.foreground, fontWeight: "700", fontSize: 15 },
  rowDescription: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  rowPrice: { color: colors.foreground, fontWeight: "800", marginLeft: spacing.md },
  backLink: { color: colors.muted, fontWeight: "600" },
  itemName: { color: colors.foreground, fontSize: 20, fontWeight: "800", marginTop: spacing.md },
  itemDescription: { color: colors.muted, marginTop: spacing.xs },
  itemPrice: { color: colors.foreground, fontWeight: "700", marginTop: spacing.xs, fontSize: 16 },
  groupName: { color: colors.foreground, fontWeight: "700", marginBottom: spacing.sm },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  choiceSelected: { borderColor: colors.pillActiveBg, backgroundColor: colors.pillActiveBg },
  choiceText: { color: colors.foreground, fontWeight: "600", fontSize: 13 },
  choiceTextSelected: { color: colors.pillActiveFg },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.foreground,
  },
  qtyRow: { marginTop: spacing.xl },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: colors.foreground, fontSize: 17, fontWeight: "700", minWidth: 20, textAlign: "center" },
  addButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    backgroundColor: colors.pillActiveBg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  addButtonText: { color: colors.pillActiveFg, fontWeight: "800", fontSize: 16 },
});
