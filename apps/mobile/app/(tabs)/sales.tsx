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

import { db } from "@farms/firebase";
import { saleSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  removeFromCollection,
} from "@farms/firebase/src/firestoreUtils";

const typedSchema = saleSchema;
type Sale = z.infer<typeof typedSchema> & { id: string };

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!user) return;
    setLoading(true);
    getAllFromCollection<Sale>("sales", user.uid)
      .then((items) => setSales(items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const renderItem = ({ item }: { item: Sale }) => {
    const saleDate =
      item.sale_date instanceof Date
        ? item.sale_date
        : new Date((item.sale_date as any).seconds * 1000);

    return (
      <Card style={styles.saleCard}>
        <Card.Content>
          <View style={styles.saleHeader}>
            <Title style={styles.clientName}>{item.client_name}</Title>
            <View style={styles.saleActions}>
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

          <Paragraph style={styles.productId}>
            Produto: {item.product_id}
          </Paragraph>

          <View style={styles.saleDetails}>
            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Quantidade:</Paragraph>
              <Paragraph style={styles.detailValue}>{item.quantity}</Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Valor Total:</Paragraph>
              <Paragraph style={styles.priceValue}>
                R$ {item.total_price.toFixed(2)}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Data da Venda:</Paragraph>
              <Paragraph style={styles.dateValue}>
                {saleDate.toLocaleDateString("pt-BR")}
              </Paragraph>
            </View>

            <View style={styles.locationContainer}>
              <Paragraph style={styles.detailLabel}>Localização:</Paragraph>
              <Paragraph style={styles.locationValue}>
                {item.location.latitude.toFixed(4)},{" "}
                {item.location.longitude.toFixed(4)}
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
        <Paragraph>Carregando vendas...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Vendas</Title>
        <Paragraph style={styles.subtitle}>
          {sales.length} venda{sales.length !== 1 ? "s" : ""} registrada
          {sales.length !== 1 ? "s" : ""}
        </Paragraph>
      </View>

      <FlatList
        data={sales}
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
                {editing ? "Editar Venda" : "Nova Venda"}
              </Title>

              <Controller
                control={control}
                name="client_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Nome do Cliente"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.client_name}
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
                name="quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Quantidade"
                    value={value ? String(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    error={!!errors.quantity}
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
                    label="Valor Total (R$)"
                    value={value ? String(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    error={!!errors.total_price}
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
                name="location.latitude"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Latitude"
                    value={value ? String(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    error={!!errors.location?.latitude}
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
                    error={!!errors.location?.longitude}
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
                    label="Data da Venda"
                    value={
                      value instanceof Date
                        ? value.toISOString().slice(0, 10)
                        : ""
                    }
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(new Date(text))}
                    error={!!errors.sale_date}
                    style={styles.input}
                  />
                )}
              />
              {errors.sale_date && (
                <HelperText type="error">{errors.sale_date.message}</HelperText>
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
                        await updateInCollection(
                          "sales",
                          editing.id,
                          data,
                          user.uid
                        );
                      } else if (user) {
                        await addToCollection("sales", data, user.uid);
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
    backgroundColor: "#f4f6fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#23272f",
  },
  subtitle: {
    color: "#64748b",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  saleCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    flex: 1,
    color: "#23272f",
    fontWeight: "600",
  },
  saleActions: {
    flexDirection: "row",
  },
  editButton: {
    marginLeft: 8,
  },
  productId: {
    color: "#64748b",
    marginBottom: 12,
  },
  saleDetails: {
    gap: 8,
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "#64748b",
  },
  detailValue: {
    fontWeight: "bold",
    color: "#3b82f6",
  },
  priceValue: {
    fontWeight: "bold",
    color: "#10b981",
  },
  dateValue: {
    fontWeight: "bold",
    color: "#8b5cf6",
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationValue: {
    fontWeight: "bold",
    color: "#f59e0b",
    fontSize: 12,
  },
  modal: {
    margin: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formTitle: {
    marginBottom: 20,
    textAlign: "center",
    color: "#23272f",
    fontWeight: "600",
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
