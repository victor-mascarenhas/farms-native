import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Button,
  Portal,
  Modal,
  TextInput,
  HelperText,
  useTheme,
  Card,
  Title,
  Paragraph,
  FAB,
} from "react-native-paper";
import {
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "@farms/firebase";
import { stockSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const typedSchema = stockSchema;
type StockItem = z.infer<typeof typedSchema> & { id: string };

export default function StockScreen() {
  const [items, setItems] = useState<StockItem[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);

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
      collection(db, "stock"),
      (querySnapshot) => {
        const result: StockItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          result.push({ id: doc.id, ...data });
        });
        setItems(result);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const renderItem = ({ item }: { item: StockItem }) => {
    const lastUpdated = item.last_updated instanceof Date 
      ? item.last_updated 
      : new Date((item.last_updated as any).seconds * 1000);

    return (
      <Card style={styles.stockCard}>
        <Card.Content>
          <View style={styles.stockHeader}>
            <Title style={styles.productId}>{item.product_id}</Title>
            <View style={styles.stockActions}>
              <Button
                mode="contained"
                compact
                onPress={() => {
                  setEditing(item);
                  setVisible(true);
                }}
                style={styles.editButton}
              >
                Editar
              </Button>
            </View>
          </View>

          <View style={styles.stockDetails}>
            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Quantidade Disponível:</Paragraph>
              <Paragraph style={styles.quantityValue}>
                {item.available_quantity}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Última Atualização:</Paragraph>
              <Paragraph style={styles.dateValue}>
                {lastUpdated.toLocaleDateString('pt-BR')}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Carregando estoque...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Estoque</Title>
        <Paragraph style={styles.subtitle}>
          {items.length} item{items.length !== 1 ? "s" : ""} em estoque
        </Paragraph>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Card style={styles.formCard}>
            <Card.Content>
              <Title style={styles.formTitle}>
                {editing ? "Editar Item" : "Novo Item"}
              </Title>

              <Controller
                control={control}
                name="product_id"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Produto"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.product_id}
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
                name="available_quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Quantidade Disponível"
                    value={value ? String(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    error={!!errors.available_quantity}
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
                    label="Data da Última Atualização"
                    value={
                      value instanceof Date
                        ? value.toISOString().slice(0, 10)
                        : ""
                    }
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(new Date(text))}
                    error={!!errors.last_updated}
                    style={styles.input}
                  />
                )}
              />
              {errors.last_updated && (
                <HelperText type="error">
                  {errors.last_updated.message}
                </HelperText>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setVisible(false)}
                  style={styles.button}
                >
                  Cancelar
                </Button>
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
                  style={styles.button}
                >
                  {editing ? "Atualizar" : "Salvar"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setEditing(null);
          setVisible(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#23272f',
  },
  subtitle: {
    color: '#64748b',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  stockCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productId: {
    fontSize: 18,
    flex: 1,
    color: '#23272f',
    fontWeight: '600',
  },
  stockActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginLeft: 8,
  },
  stockDetails: {
    gap: 8,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#64748b',
  },
  quantityValue: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dateValue: {
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  modal: {
    margin: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#23272f',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
