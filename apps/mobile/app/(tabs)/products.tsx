import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";
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

import { Product } from "@farms/schemas";
import { useProductForm } from "../hooks/useProductForm";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/products";

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
        await updateInCollection("products", editing.id!, data, user.uid);
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
        keyExtractor={(item) => item.id!}
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

              <Text style={styles.label}>Nome do Produto</Text>
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

              <Text style={styles.label}>Categoria</Text>
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

              <Text style={styles.label}>Preço de Venda (R$)</Text>
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

              <Text style={styles.label}>Preço de Custo (R$)</Text>
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
