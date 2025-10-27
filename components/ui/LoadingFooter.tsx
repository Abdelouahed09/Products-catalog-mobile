import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingFooter({ show }: { show: boolean }) {
  if (!show) return <View style={{ height: 16 }} />;
  return (
    <View style={styles.footerLoading}>
      <ActivityIndicator size="small" color="#667085" />
      <Text style={styles.footerText}>Loading more...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerLoading: {
    paddingVertical: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#667085",
    fontSize: 13,
  },
});
