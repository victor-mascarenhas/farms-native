import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Surface, Text } from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { WebView } from "react-native-webview";
import { z } from "zod";

import { db } from "@/firebaseConfig";
import {
  saleSchema,
  productSchema,
  stockSchema,
} from "@/schemas/firebaseSchemas";

// Data types for queries
const typedSale = saleSchema;
type Sale = z.infer<typeof typedSale> & { id: string };
const typedProduct = productSchema;
type Product = z.infer<typeof typedProduct> & { id: string };
const typedStock = stockSchema;
type Stock = z.infer<typeof typedStock> & { id: string };

export default function DashboardScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    const load = async () => {
      const saleSnap = await getDocs(collection(db, "sales"));
      const salesData: Sale[] = [];
      saleSnap.forEach((doc) => {
        const data = typedSale.parse(doc.data());
        salesData.push({ id: doc.id, ...data });
      });
      setSales(salesData);

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
    };

    load().catch((err) => console.error(err));
  }, []);

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
    .sort((a, b) => b.profit - a.profit);

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
        var options = { title: 'Lucro por Produto' };
        var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
        chart.draw(data, options);
      }
    </script>
  </head>
  <body>
    <div id="chart" style="width:100%;height:300px"></div>
  </body>
</html>`;

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Visão Geral
      </Text>
      <Text>Faturamento total: {totalRevenue.toFixed(2)}</Text>
      <Text>Lucro estimado total: {totalProfit.toFixed(2)}</Text>
      <Text>Quantidade total vendida: {totalQuantity}</Text>
      <Text>Valor atual em estoque: {stockValue.toFixed(2)}</Text>
      <Surface style={styles.chart}>
        <WebView originWhitelist={["*"]} source={{ html: chartHtml }} />
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chart: {
    marginTop: 20,
    height: 300,
  },
});
