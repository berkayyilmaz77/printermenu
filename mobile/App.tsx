import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Category, MenuItem, CartLine } from "./types";
import { API_BASE_URL } from "./config";
import ItemModal from "./ItemModal";
import CartScreen from "./CartScreen";

function money(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)} ₺`;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await res.json();
      setCategories(data.categories);
      if (data.categories.length > 0) setActiveCategory(data.categories[0].id);
    } catch {
      setError("Menü yüklenemedi. Bağlantıyı kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  function addToCart(line: CartLine) {
    setCart((prev) => [...prev, line]);
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  if (showCart) {
    return (
      <>
        <CartScreen
          cart={cart}
          onRemove={removeFromCart}
          onClear={() => {
            setCart([]);
            setShowCart(false);
          }}
          onBack={() => setShowCart(false)}
        />
        <StatusBar style="light" />
      </>
    );
  }

  const activeItems = categories.find((c) => c.id === activeCategory)?.items ?? [];
  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Menü</Text>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabs}
            contentContainerStyle={{ paddingHorizontal: 16 }}
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
            data={activeItems}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => setOpenItem(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.itemPrice}>{money(Number(item.price))}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#9a9a9f", textAlign: "center", marginTop: 40 }}>
                Bu kategoride ürün yok.
              </Text>
            }
          />
        </>
      )}

      {cartCount > 0 && (
        <Pressable style={styles.cartButton} onPress={() => setShowCart(true)}>
          <Text style={styles.cartButtonText}>Sepet · {cartCount} ürün</Text>
        </Pressable>
      )}

      {openItem && (
        <ItemModal item={openItem} onClose={() => setOpenItem(null)} onAdd={addToCart} />
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { color: "#fff", fontSize: 24, fontWeight: "bold", padding: 16 },
  error: { color: "#e5484d", textAlign: "center", marginTop: 40 },
  tabs: { flexGrow: 0, marginBottom: 8 },
  tab: {
    borderWidth: 1,
    borderColor: "#2a2a2e",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#f5f5f5", borderColor: "#f5f5f5" },
  tabText: { color: "#9a9a9f" },
  tabTextActive: { color: "#0a0a0a", fontWeight: "600" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17171a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  itemName: { color: "#fff", fontWeight: "600", fontSize: 16 },
  itemDescription: { color: "#9a9a9f", marginTop: 4, fontSize: 13 },
  itemPrice: { color: "#fff", fontWeight: "bold", marginLeft: 12 },
  cartButton: {
    backgroundColor: "#f5f5f5",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cartButtonText: { color: "#0a0a0a", fontWeight: "bold", fontSize: 16 },
});
