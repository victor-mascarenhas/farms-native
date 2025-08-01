import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Surface, Text } from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { WebView } from "react-native-webview";
import { z } from "zod";

import { db } from "@farms/firebase";
import { productionSchema, productSchema } from "@farms/schemas";

const typedProduction = productionSchema;
type Production = z.infer<typeof typedProduction> & { id: string };
const typedProduct = productSchema;
type Product = z.infer<typeof typedProduct> & { id: string };

export default function ProductionDashboardScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      const prodSnap = await getDocs(collection(db, "productions"));
      const prodData: Production[] = [];
      prodSnap.forEach((doc) => {
        const data = typedProduction.parse(doc.data());
        prodData.push({ id: doc.id, ...data });
      });
      setProductions(prodData);

      const productSnap = await getDocs(collection(db, "products"));
      const productData: Product[] = [];
      productSnap.forEach((doc) => {
        const data = typedProduct.parse(doc.data());
        productData.push({ id: doc.id, ...data });
      });
      setProducts(productData);
    };

    load().catch((err) => console.error(err));
  }, []);

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
    {},
  );

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
          data.addColumn('number', 'Quantidade');
          data.addRows(${JSON.stringify(Object.entries(quantityPerProduct))});
          var options = { title: 'Produ\u00e7\u00e3o por Produto' };
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
        Dados de Produ\u00e7\u00e3o
      </Text>
      <Text>Total de registros: {totalProductions}</Text>
      <Text>Quantidade em andamento: {quantityInProgress}</Text>
      <Text>Quantidade colhida: {quantityHarvested}</Text>
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
