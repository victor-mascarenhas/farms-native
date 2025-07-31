import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Surface, Text, Card, Title, Paragraph, useTheme } from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { WebView } from "react-native-webview";
import { z } from "zod";

import { db } from "@farms/firebase";
import { useSalesStore } from "@farms/state";
import {
  saleSchema,
  productSchema,
  stockSchema,
} from "@farms/schemas";

// Data types for queries
const typedSale = saleSchema;
type Sale = z.infer<typeof typedSale> & { id: string };
const typedProduct = productSchema;
type Product = z.infer<typeof typedProduct> & { id: string };
const typedStock = stockSchema;
type Stock = z.infer<typeof typedStock> & { id: string };

export default function DashboardScreen() {
  const theme = useTheme();
  const { sales, fetchSales } = useSalesStore();
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
  const totalRevenue = sales.reduce((sum, s) => sum + s.total_price, 0);
  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalProfit = sales.reduce((sum, s) => {
    const prod = productMap.get(s.product_id);
    if (!prod) return sum;
    return sum + (s.total_price - prod.cost_price * s.quantity);
  }, 0);
  const stockValue = stocks.reduce((sum, st) => {
    const prod = productMap.get(st.product_id);
    if (!prod) return sum;
    return sum + st.available_quantity * prod.unit_price;
  }, 0);

  const profitPerProduct = products
    .map((p) => {
      const quantitySold = sales
        .filter((s) => s.product_id === p.id)
        .reduce((sum, s) => sum + s.quantity, 0);
      const profit = (p.unit_price - p.cost_price) * quantitySold;
      return { name: p.name, profit };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5); // Top 5 produtos

  const chartHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {packages:['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Produto');
        data.addColumn('number', 'Lucro');
        data.addRows(${JSON.stringify(profitPerProduct.map((p) => [p.name, p.profit]))});
        var options = { 
          title: 'Top 5 Produtos por Lucro',
          colors: ['#10b981'],
          backgroundColor: '#f8fafc'
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
        chart.draw(data, options);
      }
    </script>
  </head>
  <body style="margin: 0; padding: 0;">
    <div id="chart" style="width:100%;height:250px"></div>
  </body>
</html>`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Dashboard de Vendas</Title>
      
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
            <Paragraph style={[styles.statValue, { color: '#10b981' }]}>
              R$ {totalProfit.toFixed(2)}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statTitle}>Quantidade</Title>
            <Paragraph style={styles.statValue}>
              {totalQuantity}
            </Paragraph>
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
          <Surface style={styles.chart}>
            <WebView 
              originWhitelist={["*"]} 
              source={{ html: chartHtml }}
              style={styles.webview}
            />
          </Surface>
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
              {sales.filter(s => s.location?.latitude && s.location?.longitude).map((s) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  chartCard: {
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  chart: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
  mapCard: {
    marginBottom: 20,
    elevation: 2,
  },
  mapTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  map: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
