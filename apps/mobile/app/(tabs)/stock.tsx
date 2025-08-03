import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
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

import { Product, Stock, stockSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/stock";

const formatDateToDisplay = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

const formatDateToStore = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};

export default function StockScreen() {
  const [items, setItems] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Stock>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      product_id: "",
      available_quantity: 0,
      last_updated: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          available_quantity: editing.available_quantity,
          last_updated: editing.last_updated,
        });
      } else {
        reset({
          product_id: "",
          available_quantity: 0,
          last_updated: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [visible, editing]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // First get all products
    getAllFromCollection<Product>("products", user.uid)
      .then((productsData) => {
        setProducts(productsData);
        // Then get stock items
        return getAllFromCollection<Stock>("stock", user.uid);
      })
      .then((stockItems) => {
        setItems(stockItems);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  const renderItem = ({ item }: { item: Stock }) => {
    return (
      <Card style={styles.stockCard}>
        <Card.Content>
          <View style={styles.stockHeader}>
            <Title style={styles.productId}>
              {getProductName(item.product_id)}
            </Title>
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
              <Paragraph style={styles.detailLabel}>
                Quantidade Disponível:
              </Paragraph>
              <Paragraph style={styles.quantityValue}>
                {item.available_quantity}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>
                Última Atualização:
              </Paragraph>
              <Paragraph style={styles.dateValue}>
                {formatDateToDisplay(item.last_updated)}
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

  const handleSave = async (data: any) => {
    if (!user) return;
    try {
      if (editing) {
        await updateInCollection("stock", editing.id!, data, user.uid);
      } else {
        await addToCollection("stock", data, user.uid);
      }
      const items = await getAllFromCollection<Stock>("stock", user.uid);
      setItems(items);
      setVisible(false);
      setEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

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
                {editing ? "Editar Item" : "Novo Item"}
              </Title>

              <Text style={styles.label}>Produto</Text>
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

              <Text style={styles.label}>Quantidade Disponível</Text>
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

              <Text style={styles.label}>Data da Última Atualização</Text>
              <Controller
                control={control}
                name="last_updated"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Data da Última Atualização"
                    value={value ? formatDateToDisplay(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatDateToStore(text))}
                    error={!!errors.last_updated}
                    style={styles.input}
                    placeholder="DD-MM-AAAA"
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
                  onPress={handleSubmit(handleSave)}
                  loading={isSubmitting}
                  style={styles.button}
                >
                  {editing ? "Salvar" : "Adicionar"}
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
