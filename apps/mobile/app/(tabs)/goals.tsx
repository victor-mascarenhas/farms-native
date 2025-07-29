import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Button,
  List,
  Portal,
  Modal,
  TextInput,
  HelperText,
  useTheme,
} from "react-native-paper";
import {
  onSnapshot,
  query,
  where,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { z } from "zod";
import { getAuth } from "firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/AuthProvider";
import { db } from "@farms/firebase";
import { goalSchema } from "@farms/schemas";
import { useGoalStore } from "@farms/state";

const typedSchema = goalSchema;
type Goal = z.infer<typeof typedSchema> & { id: string };

const formSchema = typedSchema.omit({ created_by: true });
type FormData = z.infer<typeof formSchema>;

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const reachedGoals = useGoalStore((s) => s.reachedGoals);
  const setGoalReached = useGoalStore((s) => s.setGoalReached);
  const [editing, setEditing] = useState<Goal | null>(null);

  const schema = formSchema;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "venda",
      product_id: "",
      target_quantity: 0,
      start_date: new Date(),
      end_date: new Date(),
      notified: false,
    },
  });

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
        items.forEach((g) => {
          if (g.notified && !reachedGoals[g.id]) {
            setGoalReached(g.id);
          }
        });
      },
      (err) => console.error(err)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          type: editing.type,
          product_id: editing.product_id,
          target_quantity: editing.target_quantity,
          start_date:
            editing.start_date instanceof Date
              ? editing.start_date
              : new Date((editing.start_date as any).seconds * 1000),
          end_date:
            editing.end_date instanceof Date
              ? editing.end_date
              : new Date((editing.end_date as any).seconds * 1000),
          notified: editing.notified,
        });
      } else {
        reset({
          type: "venda",
          product_id: "",
          target_quantity: 0,
          start_date: new Date(),
          end_date: new Date(),
          notified: false,
        });
      }
    }
  }, [visible, editing]);

  const renderItem = ({ item }: { item: Goal }) => (
    <List.Item
      title={`${item.product_id} (${item.type})`}
      onPress={() => {
        setEditing(item);
        setVisible(true);
      }}
      right={() => (
        <Button
          onPress={() => {
            setEditing(item);
            setVisible(true);
          }}
        >
          Editar
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList data={goals} keyExtractor={(item) => item.id} renderItem={renderItem} />
      <List.Item title={`Objetivos alcançados: ${Object.keys(reachedGoals).length}`} />
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => {
          setEditing(null);
          setVisible(true);
        }}
      >
        Novo
      </Button>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <View>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Tipo"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.type && (
              <HelperText type="error">{errors.type.message}</HelperText>
            )}

            <Controller
              control={control}
              name="product_id"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Produto"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.product_id && (
              <HelperText type="error">
                {errors.product_id.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="target_quantity"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Quantidade"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.target_quantity && (
              <HelperText type="error">
                {errors.target_quantity.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="start_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Início"
                  value={
                    value instanceof Date
                      ? value.toISOString().slice(0, 10)
                      : ""
                  }
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(new Date(text))}
                  style={styles.input}
                />
              )}
            />
            {errors.start_date && (
              <HelperText type="error">
                {errors.start_date.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="end_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Fim"
                  value={
                    value instanceof Date
                      ? value.toISOString().slice(0, 10)
                      : ""
                  }
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(new Date(text))}
                  style={styles.input}
                />
              )}
            />
            {errors.end_date && (
              <HelperText type="error">{errors.end_date.message}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(async (data) => {
                try {
                  if (editing) {
                    await updateDoc(doc(db, "goals", editing.id), data);
                  } else if (user) {
                    await addDoc(collection(db, "goals"), {
                      ...data,
                      created_by: user.uid,
                    });
                  }
                  setVisible(false);
                  setEditing(null);
                } catch (err) {
                  console.error(err);
                }
              })}
              loading={isSubmitting}
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    margin: 16,
  },
  modal: {
    padding: 20,
    margin: 20,
  },
  input: {
    marginBottom: 12,
  },
});
