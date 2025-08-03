import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";

import { Product, Production } from "@farms/schemas";
import { useAuth } from "../../AuthProvider";
import { getAllFromCollection } from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/prodDash";

export default function ProductionDashboardScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

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
