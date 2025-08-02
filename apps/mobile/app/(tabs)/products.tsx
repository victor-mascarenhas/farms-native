import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Button,
  Portal,
  Modal,
  TextInput,
  HelperText,
  Card,
  Title,
  Paragraph,
  FAB,
} from "react-native-paper";
import { z } from "zod";

import { productSchema } from "@farms/schemas";
import { useProductForm } from "../hooks/useProductForm";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";

const typedSchema = productSchema;
type Product = z.infer<typeof typedSchema> & { id: string };

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useProductForm();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getAllFromCollection<Product>("products", user.uid)
      .then((items) => setProducts(items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (visible) {
      if (editing) {
        form.reset({
          name: editing.name,
          category: editing.category,
          unit_price: editing.unit_price,
          cost_price: editing.cost_price,
        });
      } else {
        form.reset();
      }
    }
  }, [visible, editing]);

  const renderItem = ({ item }: { item: Product }) => {
    const margin =
      ((item.unit_price - item.cost_price) / item.unit_price) * 100;

    return (
      <Card style={styles.productCard}>
        <Card.Content>
          <View style={styles.productHeader}>
            <Title style={styles.productName}>{item.name}</Title>
            <View style={styles.productActions}>
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

          <Paragraph style={styles.productCategory}>{item.category}</Paragraph>

          <View style={styles.productDetails}>
            <View style={styles.priceContainer}>
              <Paragraph style={styles.priceLabel}>Preço de Venda:</Paragraph>
              <Paragraph style={styles.priceValue}>
                R$ {item.unit_price.toFixed(2)}
              </Paragraph>
            </View>

            <View style={styles.priceContainer}>
              <Paragraph style={styles.priceLabel}>Preço de Custo:</Paragraph>
              <Paragraph style={styles.costValue}>
                R$ {item.cost_price.toFixed(2)}
              </Paragraph>
            </View>

            <View style={styles.marginContainer}>
              <Paragraph style={styles.marginLabel}>Margem:</Paragraph>
              <View
                style={[
                  styles.marginBadge,
                  {
                    backgroundColor:
                      margin > 50
                        ? "#dcfce7"
                        : margin > 30
                        ? "#fef3c7"
                        : "#fef2f2",
                  },
                ]}
              >
                <Paragraph
                  style={[
                    styles.marginValue,
                    {
                      color:
                        margin > 50
                          ? "#166534"
                          : margin > 30
                          ? "#92400e"
                          : "#991b1b",
                    },
                  ]}
                >
                  {margin.toFixed(1)}%
                </Paragraph>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleSave = async (data: any) => {
    try {
      if (!user) return;
      if (editing) {
        await updateInCollection("products", editing.id, data, user.uid);
      } else {
        await addToCollection("products", data, user.uid);
      }
      // Atualize a lista imediatamente após adicionar/editar
      const items = await getAllFromCollection<Product>("products", user.uid);
      setProducts(items);
      setVisible(false);
      setEditing(null);
    } catch (error) {
      // tratamento de erro
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Carregando produtos...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Produtos</Title>
        <Paragraph style={styles.subtitle}>
          {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado
          {products.length !== 1 ? "s" : ""}
        </Paragraph>
      </View>

      <FlatList
        data={products}
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
                {editing ? "Editar Produto" : "Novo Produto"}
              </Title>

              <TextInput
                label="Nome do Produto"
                value={form.watch("name")}
                onChangeText={(text) => form.setValue("name", text)}
                error={!!form.formState.errors.name}
                style={styles.input}
              />
              {form.formState.errors.name && (
                <HelperText type="error">
                  {form.formState.errors.name.message}
                </HelperText>
              )}

              <TextInput
                label="Categoria"
                value={form.watch("category")}
                onChangeText={(text) => form.setValue("category", text)}
                error={!!form.formState.errors.category}
                style={styles.input}
              />
              {form.formState.errors.category && (
                <HelperText type="error">
                  {form.formState.errors.category.message}
                </HelperText>
              )}

              <TextInput
                label="Preço de Venda (R$)"
                value={form.watch("unit_price")?.toString()}
                onChangeText={(text) =>
                  form.setValue("unit_price", parseFloat(text) || 0)
                }
                keyboardType="numeric"
                error={!!form.formState.errors.unit_price}
                style={styles.input}
              />
              {form.formState.errors.unit_price && (
                <HelperText type="error">
                  {form.formState.errors.unit_price.message}
                </HelperText>
              )}

              <TextInput
                label="Preço de Custo (R$)"
                value={form.watch("cost_price")?.toString()}
                onChangeText={(text) =>
                  form.setValue("cost_price", parseFloat(text) || 0)
                }
                keyboardType="numeric"
                error={!!form.formState.errors.cost_price}
                style={styles.input}
              />
              {form.formState.errors.cost_price && (
                <HelperText type="error">
                  {form.formState.errors.cost_price.message}
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
                  onPress={form.handleSubmit(handleSave)}
                  loading={form.formState.isSubmitting}
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
  productCard: {
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
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    flex: 1,
    color: "#23272f",
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "row",
  },
  editButton: {
    marginLeft: 8,
  },
  productCategory: {
    color: "#64748b",
    marginBottom: 12,
  },
  productDetails: {
    gap: 8,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "#64748b",
  },
  priceValue: {
    fontWeight: "bold",
    color: "#10b981",
  },
  costValue: {
    fontWeight: "bold",
    color: "#ef4444",
  },
  marginContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  marginLabel: {
    color: "#64748b",
  },
  marginBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  marginValue: {
    fontSize: 12,
    fontWeight: "bold",
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
