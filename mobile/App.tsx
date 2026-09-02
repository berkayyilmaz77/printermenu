import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Category, MenuResponse, TableOverview } from "./types";
import { API_BASE_URL } from "./config";
import { colors, spacing, radius } from "./theme";
import TablesScreen from "./TablesScreen";
import TableOrderScreen from "./TableOrderScreen";

// Kasiyer/garson uygulaması: masa seç -> sipariş oluştur/düzenle -> onayla.
// Menü (kategori/ürün) verisi burada bir kere çekiliyor, hem masalar hem
// ürün seçici bunu kullanıyor — sık değişmediği için ayrıca poll edilmiyor.
export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableOverview | null>(null);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      const data: MenuResponse = await res.json();
      setCategories(data.categories);
      setBusinessName(data.businessName);
    } catch {
      setError("Menü yüklenemedi. Bağlantıyı kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading && (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.foreground} size="large" />
          </View>
        )}

        {error && !loading && (
          <View style={styles.centerFill}>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadMenu}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && !selectedTable && (
          <TablesScreen onSelectTable={setSelectedTable} />
        )}

        {!loading && !error && selectedTable && (
          <TableOrderScreen
            table={selectedTable}
            categories={categories}
            businessName={businessName}
            onBack={() => setSelectedTable(null)}
          />
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  error: { color: colors.foreground, textAlign: "center", fontWeight: "600" },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { color: colors.foreground, fontWeight: "600" },
});
