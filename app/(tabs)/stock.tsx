import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';
import { getDocs, collection } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { db } from '@/firebaseConfig';
import { stockSchema } from '@/schemas/firebaseSchemas';

const typedSchema = stockSchema;
type StockItem = z.infer<typeof typedSchema> & { id: string };

export default function StockScreen() {
  const [items, setItems] = useState<StockItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'stock'));
        const result: StockItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          result.push({ id: doc.id, ...data });
        });
        setItems(result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: StockItem }) => (
    <List.Item
      title={item.product_id}
      description={`Qtd: ${item.available_quantity}`}
      onPress={() => router.push(`/stock/${item.id}/edit`)}
      right={() => (
        <Button onPress={() => router.push(`/stock/${item.id}/edit`)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
