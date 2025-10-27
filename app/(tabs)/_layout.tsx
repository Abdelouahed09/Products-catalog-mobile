import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <Text style={{ color: "#E5E7EB", fontSize: 18, fontWeight: "700" }}>
            Products <Text style={{ color: "#60A5FA" }}>Catalog</Text>
          </Text>
        ),
        headerStyle: { backgroundColor: "#0B1220" },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarActiveTintColor: "#60A5FA",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopColor: "#1F2937",
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Catalog",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="liked"
        options={{
          title: "Liked Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
