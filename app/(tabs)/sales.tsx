import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';

import { db } from '@/firebaseConfig';
import { saleSchema } from '@/schemas/firebaseSchemas';

const typedSchema = saleSchema;
type Sale = z.infer<typeof typedSchema> & { id: string };

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(collection(db, 'sales'), where('created_by', '==', user?.uid));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Sale[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setSales(items);
      },
      (err) => console.error(err)
    );
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Sale }) => (
    <List.Item
      title={item.client_name}
      description={`${item.quantity} - ${item.total_price}`}
      onPress={() => router.push(`/sale/${item.id}/edit`)}
      right={() => (
        <Button onPress={() => router.push(`/sale/${item.id}/edit`)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList data={sales} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
