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
import { saleSchema } from "@/schemas/firebaseSchemas";
import { useAuth } from "@/AuthProvider";

const typedSchema = saleSchema;
type Sale = z.infer<typeof typedSchema> & { id: string };

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);

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
      quantity: 0,
      total_price: 0,
      client_name: "",
      location: { latitude: 0, longitude: 0 },
      sale_date: new Date(),
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          quantity: editing.quantity,
          total_price: editing.total_price,
          client_name: editing.client_name,
          location: {
            latitude: editing.location.latitude,
            longitude: editing.location.longitude,
          },
          sale_date:
            editing.sale_date instanceof Date
              ? editing.sale_date
              : new Date((editing.sale_date as any).seconds * 1000),
        });
      } else {
        reset({
          product_id: "",
          quantity: 0,
          total_price: 0,
          client_name: "",
          location: { latitude: 0, longitude: 0 },
          sale_date: new Date(),
        });
      }
    }
  }, [visible, editing]);

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
      <FlatList data={sales} keyExtractor={(item) => item.id} renderItem={renderItem} />
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
              <HelperText type="error">
                {errors.product_id.message}
              </HelperText>
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
              name="total_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Valor Total"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.total_price && (
              <HelperText type="error">
                {errors.total_price.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="client_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Cliente"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.client_name && (
              <HelperText type="error">
                {errors.client_name.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="location.latitude"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Latitude"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.location?.latitude && (
              <HelperText type="error">
                {errors.location.latitude.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="location.longitude"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Longitude"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.location?.longitude && (
              <HelperText type="error">
                {errors.location.longitude.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="sale_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Data"
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
            {errors.sale_date && (
              <HelperText type="error">{errors.sale_date.message}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(async (data) => {
                try {
                  if (editing) {
                    await updateDoc(doc(db, "sales", editing.id), data);
                  } else if (user) {
                    await addDoc(collection(db, "sales"), {
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
