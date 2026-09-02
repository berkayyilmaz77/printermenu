import { View, Text, Pressable, FlatList, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Category, MenuItem } from "./types";
import { colors, radius, spacing, typography, cardShadow, backgroundGradient } from "./theme";
import Tag from "./Tag";
import { allergenLabel, allergenIcon } from "./allergens";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

// Bir kategorinin ürün listesi — ana ekrandan kayarak açılan sayfa.
export default function CategoryScreen({
  category,
  onBack,
  onOpenItem,
}: {
  category: Category;
  onBack: () => void;
  onOpenItem: (item: MenuItem) => void;
}) {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 3 : width >= 560 ? 2 : 1;

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          <Text style={styles.backText}>Kategoriler</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {category.name}
        </Text>
        <View style={{ width: 110 }} />
      </View>

      <FlatList
        key={columns}
        data={category.items}
        keyExtractor={(item) => String(item.id)}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: spacing.md } : undefined}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, { flex: 1 / columns }]} onPress={() => onOpenItem(item)}>
            <View style={styles.cardImageWrap}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Ionicons name="restaurant-outline" size={26} color={colors.muted} />
                </View>
              )}
              {item.originalPrice && (
                <View style={styles.campaignBadge}>
                  <Text style={styles.campaignBadgeText}>İndirim</Text>
                </View>
              )}
              <View style={styles.priceBadgeWrap}>
                {item.originalPrice && (
                  <Text style={styles.oldPrice}>{money(Number(item.originalPrice))}</Text>
                )}
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>{money(Number(item.price))}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.description ? (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
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
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.centerFill}>
            <Text style={styles.emptyText}>Bu kategoride ürün yok.</Text>
          </View>
        }
      />
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
  backButton: { flexDirection: "row", alignItems: "center", width: 110 },
  backText: { color: colors.muted, fontWeight: "600" },
  title: { flex: 1, textAlign: "center", color: colors.foreground, ...typography.heading },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyText: { color: colors.muted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...cardShadow,
  },
  cardImageWrap: { aspectRatio: 4 / 3, backgroundColor: colors.surface2 },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  campaignBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  campaignBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  priceBadgeWrap: { position: "absolute", top: spacing.sm, right: spacing.sm, alignItems: "flex-end", gap: 4 },
  oldPrice: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "600",
    textDecorationLine: "line-through",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  priceBadge: {
    backgroundColor: colors.pillActiveBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  priceBadgeText: { color: colors.pillActiveFg, fontWeight: "800", fontSize: 12 },
  cardBody: { padding: spacing.md, gap: 2 },
  itemName: { color: colors.foreground, fontWeight: "700", fontSize: 15 },
  itemDescription: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
});
