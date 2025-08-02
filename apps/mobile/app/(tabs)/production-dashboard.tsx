import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import {
  Surface,
  Text,
  Appbar,
  Card,
  Title,
  Paragraph,
  useTheme,
} from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { WebView } from "react-native-webview";
import { z } from "zod";
import { BarChart } from "react-native-chart-kit";

import { db } from "@farms/firebase";
import { productionSchema, productSchema } from "@farms/schemas";
import { useAuth } from "../../AuthProvider";
import { getAllFromCollection } from "@farms/firebase/src/firestoreUtils";

const typedProduction = productionSchema;
type Production = z.infer<typeof typedProduction> & { id: string };
const typedProduct = productSchema;
type Product = z.infer<typeof typedProduct> & { id: string };

export default function ProductionDashboardScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { logout, user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const prodData = await getAllFromCollection<Production>(
        "productions",
        user.uid
      );
      setProductions(prodData);
      const productData = await getAllFromCollection<Product>(
        "products",
        user.uid
      );
      setProducts(productData);
    };
    load().catch((err) => console.error(err));
  }, [user]);

  const totalProductions = productions.length;
  const quantityHarvested = productions
    .filter((p) => p.status === "colhido")
    .reduce((sum, p) => sum + p.quantity, 0);
  const quantityInProgress = productions
    .filter((p) => p.status !== "colhido")
    .reduce((sum, p) => sum + p.quantity, 0);

  const productNames = new Map(products.map((p) => [p.id, p.name]));
  const quantityPerProduct = productions.reduce<Record<string, number>>(
    (acc, p) => {
      const name = productNames.get(p.product_id) ?? p.product_id;
      acc[name] = (acc[name] ?? 0) + p.quantity;
      return acc;
    },
    {}
  );

  const chartWidth = Math.min(Dimensions.get("window").width - 48, 600);
  const prodLabels = Object.keys(quantityPerProduct);
  const prodData = Object.values(quantityPerProduct);
  const chartData = {
    labels: prodLabels,
    datasets: [
      {
        data: prodData,
      },
    ],
  };

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: "#fff",
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        }}
      >
        <Appbar.Content title="Dashboard de Produção" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Title style={styles.title}>Dashboard de Produção</Title>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Total de Registros</Title>
              <Paragraph style={styles.statValue}>{totalProductions}</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Em Andamento</Title>
              <Paragraph style={styles.statValue}>
                {quantityInProgress}
              </Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Colhido</Title>
              <Paragraph style={[styles.statValue, { color: "#10b981" }]}>
                {quantityHarvested}
              </Paragraph>
            </Card.Content>
          </Card>
        </View>
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Produção por Produto</Title>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={300}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: "#f4f6fa",
                backgroundGradientFrom: "#f4f6fa",
                backgroundGradientTo: "#f4f6fa",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(35, 39, 47, ${opacity})`,
                style: { borderRadius: 8 },
                propsForBackgroundLines: {
                  stroke: "#e2e8f0",
                },
              }}
              style={{ borderRadius: 8 }}
              fromZero
              showValuesOnTopOfBars
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#23272f",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statTitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  chartCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: "#23272f",
    fontWeight: "600",
  },
  chart: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    backgroundColor: "transparent",
  },
});
