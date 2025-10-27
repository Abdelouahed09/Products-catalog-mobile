import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import ProductCard from "../../components/ui/ProductCard";
import type { Product } from "../../types/product";

const PRODUCTS_URL = "https://fakestoreapi.com/products";
const STORAGE_KEYS = {
  productsCache: "@products_cache",
  favorites: "@favorites_ids",
};

export default function LikedProductsScreen() {
  const { width } = useWindowDimensions();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 12;

  const columnCount = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const listRef = useRef<FlatList<Product>>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
      if (raw) setFavorites(new Set(JSON.parse(raw) as number[]));
      else setFavorites(new Set());
    } catch {
      setFavorites(new Set());
    }
  }, []);

  const loadProducts = useCallback(async () => {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.productsCache);
    if (cached) {
      setProducts(JSON.parse(cached) as Product[]);
      return;
    }
    try {
      const res = await fetch(PRODUCTS_URL);
      const json = (await res.json()) as Product[];
      setProducts(json);
      AsyncStorage.setItem(
        STORAGE_KEYS.productsCache,
        JSON.stringify(json)
      ).catch(() => {});
    } catch {
      setProducts([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (!isActive) return;
        await Promise.all([loadFavorites(), loadProducts()]);
      })();
      return () => {
        isActive = false;
      };
    }, [loadFavorites, loadProducts])
  );

  const onToggleFavorite = useCallback(async (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(
        STORAGE_KEYS.favorites,
        JSON.stringify(Array.from(next))
      ).catch(() => {});
      return next;
    });
  }, []);

  const likedProducts = useMemo(
    () => products.filter((p) => favorites.has(p.id)),
    [products, favorites]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFavorites(), loadProducts()]);
    setRefreshing(false);
  }, [loadFavorites, loadProducts]);

  return (
    <SafeAreaView style={styles.container}>
      {likedProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No liked products yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any product to add it here.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={likedProducts}
          key={columnCount}
          keyExtractor={(item) => String(item.id)}
          numColumns={columnCount}
          columnWrapperStyle={columnCount > 1 ? styles.columnWrap : undefined}
          contentContainerStyle={styles.listContent}
          initialNumToRender={pageSize}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={onToggleFavorite}
              width={
                columnCount > 1
                  ? (width - 32 - (columnCount - 1) * 12) / columnCount
                  : width - 32
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E5E7EB"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  columnWrap: { gap: 12 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#94A3B8", fontSize: 14, textAlign: "center" },
});
