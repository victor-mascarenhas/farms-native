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

import { db } from "@/firebaseConfig";
import { productionSchema } from "@/schemas/firebaseSchemas";
import { useAuth } from "@/AuthProvider";

const typedSchema = productionSchema;
type Production = z.infer<typeof typedSchema> & { id: string };

export default function ProductionsScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Production | null>(null);

  const schema = typedSchema.omit({ created_by: true });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: "",
      status: "aguardando",
      quantity: 0,
      start_date: new Date(),
      harvest_date: null,
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          status: editing.status,
          quantity: editing.quantity,
          start_date:
            editing.start_date instanceof Date
              ? editing.start_date
              : new Date((editing.start_date as any).seconds * 1000),
          harvest_date:
            editing.harvest_date instanceof Date || editing.harvest_date === null
              ? editing.harvest_date
              : new Date((editing.harvest_date as any).seconds * 1000),
        });
      } else {
        reset({
          product_id: "",
          status: "aguardando",
          quantity: 0,
          start_date: new Date(),
          harvest_date: null,
        });
      }
    }
  }, [visible, editing]);

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
      <FlatList data={productions} keyExtractor={(item) => item.id} renderItem={renderItem} />
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
              <HelperText type="error">{errors.product_id.message}</HelperText>
            )}

            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Status"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.status && (
              <HelperText type="error">{errors.status.message}</HelperText>
            )}

            <Controller
              control={control}
              name="quantity"
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
            {errors.quantity && (
              <HelperText type="error">{errors.quantity.message}</HelperText>
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
              <HelperText type="error">{errors.start_date.message}</HelperText>
            )}

            <Controller
              control={control}
              name="harvest_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Colheita"
                  value={
                    value instanceof Date
                      ? value.toISOString().slice(0, 10)
                      : ""
                  }
                  onBlur={onBlur}
                  onChangeText={(text) =>
                    onChange(text ? new Date(text) : null)
                  }
                  style={styles.input}
                />
              )}
            />
            {errors.harvest_date && (
              <HelperText type="error">{errors.harvest_date.message}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(async (data) => {
                try {
                  if (editing) {
                    await updateDoc(doc(db, "productions", editing.id), data);
                  } else if (user) {
                    await addDoc(collection(db, "productions"), {
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
