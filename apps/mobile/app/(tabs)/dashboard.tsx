import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Surface, Text, Card, Title, Paragraph } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";

import { Sale, Product, Stock } from "@farms/schemas";
import { useAuth } from "../../AuthProvider";
import { getAllFromCollection } from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/dash";

export default function DashboardScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const salesData = await getAllFromCollection<Sale>("sales", user.uid);
        setSales(salesData);
        const productData = await getAllFromCollection<Product>(
          "products",
          user.uid
        );
        setProducts(productData);
        const stockData = await getAllFromCollection<Stock>("stock", user.uid);
        setStocks(stockData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const totalRevenue = sales.reduce(
    (sum: number, s: Sale) => sum + s.total_price,
    0
  );
  const totalQuantity = sales.reduce(
    (sum: number, s: Sale) => sum + s.quantity,
    0
  );
  const totalProfit = sales.reduce((sum: number, s: Sale) => {
    const prod = productMap.get(s.product_id);
    if (!prod) return sum;
    return sum + (s.total_price - prod.cost_price * s.quantity);
  }, 0);
  const stockValue = stocks.reduce((sum: number, st: Stock) => {
    const prod = productMap.get(st.product_id);
    if (!prod) return sum;
    return sum + st.available_quantity * prod.unit_price;
  }, 0);

  const profitPerProduct = products
    .map((p) => {
      const quantitySold = sales
        .filter((s: Sale) => s.product_id === p.id)
        .reduce((sum: number, s: Sale) => sum + s.quantity, 0);
      const profit = (p.unit_price - p.cost_price) * quantitySold;
      return { name: p.name, profit };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const chartWidth = Math.min(Dimensions.get("window").width - 48, 600);
  const chartData = {
    labels: profitPerProduct.map((p) => p.name),
    datasets: [
      {
        data: profitPerProduct.map((p) => p.profit),
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Faturamento</Title>
              <Paragraph style={styles.statValue}>
                R$ {totalRevenue.toFixed(2)}
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Lucro</Title>
              <Paragraph style={[styles.statValue, { color: "#10b981" }]}>
                R$ {totalProfit.toFixed(2)}
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Quantidade</Title>
              <Paragraph style={styles.statValue}>{totalQuantity}</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statTitle}>Estoque</Title>
              <Paragraph style={styles.statValue}>
                R$ {stockValue.toFixed(2)}
              </Paragraph>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Lucro por Produto</Title>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={250}
              yAxisLabel="R$ "
              chartConfig={{
                backgroundColor: "#f4f6fa",
                backgroundGradientFrom: "#f4f6fa",
                backgroundGradientTo: "#f4f6fa",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
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

        {/* Mapa */}
        <Card style={styles.mapCard}>
          <Card.Content>
            <Title style={styles.mapTitle}>Vendas por Região</Title>
            <Surface style={styles.map}>
              <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                  latitude: -14.235,
                  longitude: -51.9253,
                  latitudeDelta: 10,
                  longitudeDelta: 10,
                }}
              >
                {sales
                  .filter((s) => s.location?.latitude && s.location?.longitude)
                  .map((s) => (
                    <Marker
                      key={s.id}
                      coordinate={{
                        latitude: s.location!.latitude,
                        longitude: s.location!.longitude,
                      }}
                      title={productMap.get(s.product_id)?.name ?? s.product_id}
                      description={`${s.client_name} - ${s.quantity}`}
                    />
                  ))}
              </MapView>
            </Surface>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}
