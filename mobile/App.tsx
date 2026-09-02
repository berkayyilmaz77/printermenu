import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import type { Category, MenuItem, MenuResponse, CartLine } from "./types";
import { API_BASE_URL } from "./config";
import { colors, radius, spacing, typography, cardShadow, backgroundGradient } from "./theme";
import ItemModal from "./ItemModal";
import CategoryScreen from "./CategoryScreen";
import CartScreen from "./CartScreen";

// İlk resimli ürünü kategori kapağı olarak kullanıyoruz — categories
// tablosunda ayrı bir resim alanı yok, ekstra admin alanı açmadan basit çözüm.
function coverImage(category: Category): string | null {
  return category.items.find((i) => i.imageUrl)?.imageUrl ?? null;
}

function Screen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);

  const { width } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  function openCategory(category: Category) {
    setSelectedCategory(category);
    slideAnim.setValue(0);
    Animated.timing(slideAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }

  function closeCategory() {
    Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setSelectedCategory(null);
    });
  }

  function addToCart(line: CartLine) {
    setCart((prev) => [...prev, line]);
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  if (showCart) {
    return (
      <CartScreen
        cart={cart}
        businessName={businessName}
        onRemove={removeFromCart}
        onClear={() => {
          setCart([]);
          setShowCart(false);
        }}
        onBack={() => setShowCart(false)}
      />
    );
  }

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Text style={styles.kicker}>DİJİTAL SİPARİŞ</Text>
          <Text style={styles.title}>{businessName || "Menü"}</Text>
        </View>

        {loading && (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.foreground} size="large" />
          </View>
        )}

        {error && (
          <View style={styles.centerFill}>
            <Ionicons name="cloud-offline-outline" size={32} color={colors.accent} />
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadMenu}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={categories}
            keyExtractor={(c) => String(c.id)}
            numColumns={2}
            columnWrapperStyle={{ gap: spacing.md }}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            ListEmptyComponent={
              <View style={styles.centerFill}>
                <Text style={styles.emptyText}>Menüde henüz kategori yok.</Text>
              </View>
            }
            renderItem={({ item: category }) => {
              const cover = coverImage(category);
              return (
                <Pressable
                  style={[styles.categoryCard, { flex: 1 / 2 }]}
                  onPress={() => openCategory(category)}
                >
                  {cover ? (
                    <Image
                      source={{ uri: cover }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, styles.categoryPlaceholder]}>
                      <Ionicons name="restaurant-outline" size={40} color={colors.muted} />
                    </View>
                  )}
                  <LinearGradient
                    colors={["transparent", "rgba(10,10,10,0.9)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.categoryTextWrap}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>{category.items.length} ürün</Text>
                  </View>
                  <View style={styles.categoryChevron}>
                    <Ionicons name="chevron-forward" size={18} color="#ffffff" />
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        {cartCount > 0 && (
          <Pressable style={styles.cartButton} onPress={() => setShowCart(true)}>
            <Ionicons name="cart" size={20} color={colors.pillActiveFg} />
            <Text style={styles.cartButtonText}>Sepet · {cartCount} ürün</Text>
          </Pressable>
        )}
        <StatusBar style="dark" />
      </SafeAreaView>

      {selectedCategory && (
        <Animated.View
          style={[
            styles.overlay,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <CategoryScreen category={selectedCategory} onBack={closeCategory} onOpenItem={setOpenItem} />
        </Animated.View>
      )}

      {openItem && (
        <ItemModal item={openItem} onClose={() => setOpenItem(null)} onAdd={addToCart} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LinearGradient colors={backgroundGradient} style={{ flex: 1 }}>
        <Screen />
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  kicker: { color: colors.muted, ...typography.subtitle },
  title: { color: colors.foreground, marginTop: spacing.xs, ...typography.title },
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
  emptyText: { color: colors.muted },
  categoryCard: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "flex-end",
    ...cardShadow,
  },
  categoryPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 },
  categoryTextWrap: { padding: spacing.md },
  // Bu metin her zaman fotoğrafın üstündeki koyu gradient'in üzerinde durur
  // (resim olmasa bile gradient hâlâ çiziliyor) — o yüzden tema tokenleri
  // yerine sabit beyaz kullanıyoruz, aksi halde açık temada okunmaz olur.
  categoryName: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  categoryCount: { color: "rgba(255,255,255,0.8)", fontSize: 11.5, fontWeight: "600", marginTop: 2 },
  categoryChevron: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.pillActiveBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    ...cardShadow,
  },
  cartButtonText: { color: colors.pillActiveFg, fontWeight: "800", fontSize: 16 },
});
