import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { db } from '@/firebaseConfig';
import { productSchema } from '@/schemas/firebaseSchemas';

const typedSchema = productSchema;
type Product = z.infer<typeof typedSchema>;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          setProduct(typedSchema.parse(snap.data()));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!product) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">{product.name}</Text>
      <Text>Categoria: {product.category}</Text>
      <Text>Preço Unitário: {product.unit_price}</Text>
      <Text>Preço de Custo: {product.cost_price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
