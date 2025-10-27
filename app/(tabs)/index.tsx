import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import CategoryModal from "../../components/ui/CategoryModal";
import LoadingFooter from "../../components/ui/LoadingFooter";
import ProductCard from "../../components/ui/ProductCard";
import Toolbar from "../../components/ui/Toolbar";
import type { Product } from "../../types/product";

// Using shared Product type from types/product

const PRODUCTS_URL = "https://fakestoreapi.com/products";
const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";

const STORAGE_KEYS = {
  productsCache: "@products_cache",
  favorites: "@favorites_ids",
  categoriesCache: "@categories_cache",
};

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(pageSize);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const flatListRef = useRef<FlatList<Product>>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
      if (raw) {
        setFavorites(new Set(JSON.parse(raw) as number[]));
      } else {
        setFavorites(new Set());
      }
    } catch {
      setFavorites(new Set());
    }
  }, []);

  // Load favorites initially
  useEffect(() => {
    (async () => {
      await loadFavorites();
    })();
  }, []);

  // Refresh favorites when screen regains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (!isActive) return;
        await loadFavorites();
      })();
      return () => {
        isActive = false;
      };
    }, [loadFavorites])
  );

  // Persist favorites when changed
  useEffect(() => {
    (async () => {
      try {
        const arr = Array.from(favorites);
        await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(arr));
      } catch {
        // ignore
      }
    })();
  }, [favorites]);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    try {
      const res = await fetch(PRODUCTS_URL);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = (await res.json()) as Product[];
      // Cache
      AsyncStorage.setItem(
        STORAGE_KEYS.productsCache,
        JSON.stringify(json)
      ).catch(() => {});
      return json;
    } catch (err) {
      // Fallback to cache
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.productsCache);
      if (raw) return JSON.parse(raw) as Product[];
      throw err;
    }
  }, []);

  const fetchCategories = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch(CATEGORIES_URL);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = (await res.json()) as string[];
      AsyncStorage.setItem(
        STORAGE_KEYS.categoriesCache,
        JSON.stringify(json)
      ).catch(() => {});
      return json;
    } catch (err) {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.categoriesCache);
      if (raw) return JSON.parse(raw) as string[];
      // If categories not cached, derive from products cache
      const productsRaw = await AsyncStorage.getItem(
        STORAGE_KEYS.productsCache
      );
      if (productsRaw) {
        const unique = Array.from(
          new Set((JSON.parse(productsRaw) as Product[]).map((p) => p.category))
        );
        return unique;
      }
      throw err;
    }
  }, []);

  const {
    data: products,
    isLoading: loadingProducts,
    isRefetching,
    error: productsError,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 12,
    retry: 1,
  });

  // Derived lists
  const categoryOptions = useMemo(
    () => ["All", ...(categories ?? [])],
    [categories]
  );

  const filteredSorted = useMemo(() => {
    const list = (products ?? []).filter((p) => {
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesCat && matchesSearch;
    });
    list.sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price));
    return list;
  }, [products, selectedCategory, search, sortAsc]);

  const visibleItems = useMemo(
    () => filteredSorted.slice(0, visibleCount),
    [filteredSorted, visibleCount]
  );

  // Reset list scroll and pagination upon filters change
  useEffect(() => {
    setVisibleCount(pageSize);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [search, selectedCategory, sortAsc]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const loadMore = useCallback(() => {
    if (!filteredSorted.length) return;
    if (visibleCount >= filteredSorted.length) return;
    setVisibleCount((v) => Math.min(v + pageSize, filteredSorted.length));
  }, [filteredSorted.length, visibleCount]);

  const columnCount = width >= 900 ? 3 : width >= 600 ? 2 : 1;

  const keyExtractor = useCallback((item: Product) => String(item.id), []);

  const header = (
    <Toolbar
      search={search}
      onSearch={setSearch}
      selectedCategoryLabel={selectedCategory}
      onOpenCategory={() => setCategoryModalOpen(true)}
      sortAsc={sortAsc}
      onToggleSort={() => setSortAsc((s) => !s)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {loadingProducts && !products ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : productsError && !products ? (
        <View style={styles.centerWrap}>
          <Text style={styles.errorText}>Unable to load products.</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={visibleItems}
          key={columnCount}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={toggleFavorite}
              width={
                columnCount > 1
                  ? (width - 32 - (columnCount - 1) * 12) / columnCount
                  : width - 32
              }
            />
          )}
          numColumns={columnCount}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={header}
          ListFooterComponent={
            <LoadingFooter show={visibleCount < filteredSorted.length} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#111827"
            />
          }
          columnWrapperStyle={columnCount > 1 ? styles.columnWrap : undefined}
          removeClippedSubviews
          initialNumToRender={pageSize}
          windowSize={10}
        />
      )}

      <CategoryModal
        visible={isCategoryModalOpen}
        categories={categoryOptions}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        onClose={() => setCategoryModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  toolbar: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#111827",
    fontSize: 14,
  },
  toolbarRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterBtnText: {
    color: "#111827",
    fontSize: 14,
    maxWidth: 160,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sortBtnText: {
    color: "#111827",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    boxShadow: "0px 6px 16px rgba(0,0,0,0.35)",
  },
  columnWrap: {
    gap: 12,
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
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  errorText: {
    color: "#F87171",
    fontSize: 15,
  },
  retryBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerLoading: {
    paddingVertical: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#11182799",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: "#F3F4F6",
  },
  modalOptionText: {
    color: "#111827",
    fontSize: 14,
  },
  modalOptionTextActive: {
    color: "#0EA5E9",
    fontWeight: "700",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
