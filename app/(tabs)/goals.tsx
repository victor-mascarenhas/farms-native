import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';

import { db } from '@/firebaseConfig';
import { goalSchema } from '@/schemas/firebaseSchemas';

const typedSchema = goalSchema;
type Goal = z.infer<typeof typedSchema> & { id: string };

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(collection(db, 'goals'), where('created_by', '==', user?.uid));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Goal[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setGoals(items);
      },
      (err) => console.error(err)
    );
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Goal }) => (
    <List.Item
      title={`${item.product_id} (${item.type})`}
      onPress={() => router.push(`/goal/${item.id}/edit`)}
      right={() => (
        <Button onPress={() => router.push(`/goal/${item.id}/edit`)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList data={goals} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
