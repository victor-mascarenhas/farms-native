import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';

import { db } from '@/firebaseConfig';
import { productionSchema } from '@/schemas/firebaseSchemas';

const typedSchema = productionSchema;
type Production = z.infer<typeof typedSchema> & { id: string };

export default function ProductionsScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(
      collection(db, 'productions'),
      where('created_by', '==', user?.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Production[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setProductions(items);
      },
      (err) => console.error(err)
    );
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Production }) => (
    <List.Item
      title={`${item.product_id} (${item.status})`}
      onPress={() => router.push(`/production/${item.id}/edit`)}
      right={() => (
        <Button onPress={() => router.push(`/production/${item.id}/edit`)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList data={productions} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
