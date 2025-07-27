import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Button,
  List,
  Portal,
  Modal,
  TextInput,
  HelperText,
} from "react-native-paper";
import {
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "@/firebaseConfig";
import { stockSchema } from "@/schemas/firebaseSchemas";
import { useAuth } from "@/AuthProvider";

const typedSchema = stockSchema;
type StockItem = z.infer<typeof typedSchema> & { id: string };

export default function StockScreen() {
  const [items, setItems] = useState<StockItem[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);

  const schema = typedSchema;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: "",
      available_quantity: 0,
      last_updated: new Date(),
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          available_quantity: editing.available_quantity,
          last_updated:
            editing.last_updated instanceof Date
              ? editing.last_updated
              : new Date((editing.last_updated as any).seconds * 1000),
        });
      } else {
        reset({
          product_id: "",
          available_quantity: 0,
          last_updated: new Date(),
        });
      }
    }
  }, [visible, editing]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'stock'),
      (querySnapshot) => {
        const result: StockItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          result.push({ id: doc.id, ...data });
        });
        setItems(result);
      },
      (err) => console.error(err)
    );
    return unsub;
  }, []);

  const renderItem = ({ item }: { item: StockItem }) => (
    <List.Item
      title={item.product_id}
      description={`Qtd: ${item.available_quantity}`}
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
      <FlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} />
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
          contentContainerStyle={styles.modal}
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
              name="available_quantity"
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
            {errors.available_quantity && (
              <HelperText type="error">
                {errors.available_quantity.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="last_updated"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Atualizado em"
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
            {errors.last_updated && (
              <HelperText type="error">{errors.last_updated.message}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(async (data) => {
                try {
                  if (editing) {
                    await updateDoc(doc(db, "stock", editing.id), data);
                  } else {
                    await addDoc(collection(db, "stock"), data);
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
    backgroundColor: "white",
    padding: 20,
    margin: 20,
  },
  input: {
    marginBottom: 12,
  },
});
