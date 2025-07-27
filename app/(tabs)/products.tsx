import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { db } from '@/firebaseConfig';
import { productSchema } from '@/schemas/firebaseSchemas';

const typedSchema = productSchema;
type Product = z.infer<typeof typedSchema> & { id: string };

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const items: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setProducts(items);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <List.Item
      title={item.name}
      description={item.category}
      onPress={() => router.push(`/product/${item.id}`)}
      right={() => (
        <Button onPress={() => router.push(`/product/${item.id}/edit`)}>Editar</Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
