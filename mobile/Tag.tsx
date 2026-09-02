import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "./theme";

// Ürün kartlarında/detayında vejetaryen-vegan-alerjen rozetleri için küçük etiket.
export default function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "good";
}) {
  const isGood = tone === "good";
  return (
    <View style={[styles.tag, isGood && styles.tagGood]}>
      <Text style={[styles.text, isGood && styles.textGood]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagGood: {
    borderColor: "transparent",
    backgroundColor: colors.successSoft,
  },
  text: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  textGood: { color: colors.success },
});
