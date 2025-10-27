import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  search: string;
  onSearch: (text: string) => void;
  selectedCategoryLabel: string;
  onOpenCategory: () => void;
  sortAsc: boolean;
  onToggleSort: () => void;
};

export default function Toolbar({
  search,
  onSearch,
  selectedCategoryLabel,
  onOpenCategory,
  sortAsc,
  onToggleSort,
}: Props) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#98A2B3" />
        <TextInput
          placeholder="Search products"
          placeholderTextColor="#98A2B3"
          style={styles.searchInput}
          value={search}
          onChangeText={onSearch}
          returnKeyType="search"
        />
      </View>
      <View style={styles.toolbarRow}>
        <Pressable style={styles.filterBtn} onPress={onOpenCategory}>
          <Ionicons name="filter" size={16} color="#ffffff" />
          <Text numberOfLines={1} style={styles.filterBtnText}>
            {selectedCategoryLabel}
          </Text>
        </Pressable>
        <Pressable style={styles.sortBtn} onPress={onToggleSort}>
          <Ionicons
            name={sortAsc ? "arrow-down" : "arrow-up"}
            size={16}
            color="#ffffff"
          />
          <Text style={styles.sortBtnText}>
            {sortAsc ? "Price: Low to High" : "Price: High to Low"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#E5E7EB",
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
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterBtnText: {
    color: "#E5E7EB",
    fontSize: 14,
    maxWidth: 160,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sortBtnText: {
    color: "#E5E7EB",
    fontSize: 14,
  },
});
