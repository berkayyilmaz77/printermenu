import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { TableOverview } from "./types";
import { fetchTables } from "./staffApi";
import { colors, radius, spacing, typography, cardShadow, backgroundGradient } from "./theme";

const POLL_MS = 4000;

function money(n: number | string) {
  const v = Number(n);
  return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)} ₺`;
}

const STATUS_LABEL: Record<string, string> = { open: "Hazırlanıyor", confirmed: "Mutfakta" };

// Uygulamanın açılış ekranı: masaların listesi + varsa üzerindeki güncel
// siparişin özeti. Birkaç saniyede bir tazeleniyor (polling) — başka bir
// tablette yapılan değişiklik burada da görünsün diye.
export default function TablesScreen({ onSelectTable }: { onSelectTable: (table: TableOverview) => void }) {
  const [tables, setTables] = useState<TableOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { tables } = await fetchTables();
      setTables(tables);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Masalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Text style={styles.kicker}>KASİYER / GARSON</Text>
          <Text style={styles.title}>Masalar</Text>
        </View>

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

        {!loading && !error && (
          <FlatList
            data={tables}
            keyExtractor={(t) => String(t.id)}
            numColumns={2}
            columnWrapperStyle={{ gap: spacing.md }}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            ListEmptyComponent={
              <View style={styles.centerFill}>
                <Text style={styles.emptyText}>Henüz masa eklenmedi.</Text>
              </View>
            }
            renderItem={({ item: t }) => (
              <Pressable
                style={[
                  styles.card,
                  { flex: 1 / 2 },
                  t.order?.status === "confirmed" && styles.cardConfirmed,
                  t.order?.status === "open" && styles.cardOpen,
                ]}
                onPress={() => onSelectTable(t)}
              >
                <Text style={styles.cardName}>{t.name}</Text>
                {t.order ? (
                  <>
                    <Text style={styles.cardStatus}>{STATUS_LABEL[t.order.status] ?? t.order.status}</Text>
                    <Text style={styles.cardSummary}>
                      {t.order.itemCount} ürün · {money(t.order.total)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.cardEmpty}>Boş</Text>
                )}
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  kicker: { color: colors.muted, ...typography.subtitle },
  title: { color: colors.foreground, marginTop: spacing.xs, ...typography.title },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  error: { color: colors.foreground, textAlign: "center", fontWeight: "600" },
  emptyText: { color: colors.muted },
  card: {
    minHeight: 110,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: "center",
    ...cardShadow,
  },
  cardOpen: { borderColor: "#f2d68a", backgroundColor: "#fdf6e3" },
  cardConfirmed: { borderColor: "#a7e0c4", backgroundColor: "#e9f9f1" },
  cardName: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
  cardStatus: { color: colors.muted, fontSize: 12.5, fontWeight: "700", marginTop: 4 },
  cardSummary: { color: colors.foreground, fontSize: 14, fontWeight: "600", marginTop: 6 },
  cardEmpty: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
