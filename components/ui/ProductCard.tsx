import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "../../types/product";

type Props = {
  product: Product;
  width: number;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

export default function ProductCard({
  product,
  width,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.cardHeader}>
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <Pressable onPress={() => onToggleFavorite(product.id)} hitSlop={8}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "#EF4444" : "#9CA3AF"}
          />
        </Pressable>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    boxShadow: "0px 6px 16px rgba(0,0,0,0.35)",
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#0F172A",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  title: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 15,
    fontWeight: "600",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  category: {
    color: "#94A3B8",
    fontSize: 13,
  },
  price: {
    color: "#60A5FA",
    fontSize: 16,
    fontWeight: "700",
  },
});
