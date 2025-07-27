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
  query,
  where,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { db } from "@/firebaseConfig";
import { productSchema } from "@/schemas/firebaseSchemas";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/AuthProvider";

const typedSchema = productSchema;
type Product = z.infer<typeof typedSchema> & { id: string };
const formSchema = typedSchema.omit({ created_by: true, created_at: true });
type FormData = z.infer<typeof formSchema>;

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const schema = formSchema;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      unit_price: 0,
      cost_price: 0,
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          name: editing.name,
          category: editing.category,
          unit_price: editing.unit_price,
          cost_price: editing.cost_price,
        });
      } else {
        reset({ name: "", category: "", unit_price: 0, cost_price: 0 });
      }
    }
  }, [visible, editing]);

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(
      collection(db, "products"),
      where("created_by", "==", user?.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setProducts(items);
      },
      (err) => console.error(err)
    );
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <List.Item
      title={item.name}
      description={item.category}
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
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
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nome"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.name && (
              <HelperText type="error">{errors.name.message}</HelperText>
            )}

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Categoria"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.category && (
              <HelperText type="error">{errors.category.message}</HelperText>
            )}

            <Controller
              control={control}
              name="unit_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Preço Unitário"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.unit_price && (
              <HelperText type="error">{errors.unit_price.message}</HelperText>
            )}

            <Controller
              control={control}
              name="cost_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Preço de Custo"
                  value={value ? String(value) : ""}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.cost_price && (
              <HelperText type="error">{errors.cost_price.message}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(async (data) => {
                try {
                  if (editing) {
                    await updateDoc(doc(db, "products", editing.id), data);
                  } else if (user) {
                    await addDoc(collection(db, "products"), {
                      ...data,
                      created_by: user.uid,
                      created_at: new Date(),
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
    backgroundColor: "white",
    padding: 20,
    margin: 20,
  },
  input: {
    marginBottom: 12,
  },
});
