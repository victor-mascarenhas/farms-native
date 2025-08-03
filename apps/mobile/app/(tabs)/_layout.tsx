import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dash Vendas",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="production-dashboard"
        options={{
          title: "Dash Produção",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Produtos",
          tabBarIcon: ({ color }) => <TabBarIcon name="leaf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Objetivos",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bullseye" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Vendas",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-bag" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: "Estoque",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="dropbox" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="productions"
        options={{
          title: "Produção",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="industry" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
