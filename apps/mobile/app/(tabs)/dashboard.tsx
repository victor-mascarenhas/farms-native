import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  Surface,
  Text,
  Card,
  Title,
  Paragraph,
  Appbar,
} from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { z } from "zod";
import { BarChart } from "react-native-chart-kit";

import { db } from "@farms/firebase";
import { useSalesStore } from "@farms/state";
import { saleSchema, productSchema, stockSchema } from "@farms/schemas";
import { useAuth } from "../../AuthProvider";

// Data types for queries
const typedSale = saleSchema;
type Sale = z.infer<typeof typedSale> & { id: string };
const typedProduct = productSchema;
type Product = z.infer<typeof typedProduct> & { id: string };
const typedStock = stockSchema;
type Stock = z.infer<typeof typedStock> & { id: string };

export default function DashboardScreen() {
  const { sales, fetchSales } = useSalesStore();
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchSales();

        const productSnap = await getDocs(collection(db, "products"));
        const productData: Product[] = [];
        productSnap.forEach((doc) => {
          const data = typedProduct.parse(doc.data());
          productData.push({ id: doc.id, ...data });
        });
        setProducts(productData);

        const stockSnap = await getDocs(collection(db, "stock"));
        const stockData: Stock[] = [];
        stockSnap.forEach((doc) => {
          const data = typedStock.parse(doc.data());
          stockData.push({ id: doc.id, ...data });
        });
        setStocks(stockData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchSales]);

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
    .slice(0, 5); // Top 5 produtos

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
      <Appbar.Header
        style={{
          backgroundColor: "#fff",
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        }}
      >
        <Appbar.Content title="Dashboard de Vendas" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        {/* Cards de estatísticas */}
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

        {/* Gráfico */}
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
                        latitude: s.location.latitude,
                        longitude: s.location.longitude,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6fa", // igual ao web
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#23272f", // igual ao web
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
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    backgroundColor: "transparent",
  },
  mapCard: {
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
  mapTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: "#23272f",
    fontWeight: "600",
  },
  map: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
  },
});
