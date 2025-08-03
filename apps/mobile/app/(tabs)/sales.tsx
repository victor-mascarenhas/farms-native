import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text, ScrollView } from "react-native";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dropdown } from "react-native-paper-dropdown";

import { Product, Sale, saleSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/sales";

const formatDateToBR = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

const formatDateToISO = (date: string) => {
  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Sale>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product_id: "",
      quantity: 0,
      total_price: 0,
      client_name: "",
      location: { latitude: 0, longitude: 0 },
      sale_date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        const foundProduct = products.find((p) => p.id === editing.product_id);
        reset({
          product_id: foundProduct ? foundProduct.id : "",
          quantity: editing.quantity,
          total_price: editing.total_price,
          client_name: editing.client_name,
          location: {
            latitude: editing.location?.latitude,
            longitude: editing.location?.longitude,
          },
          sale_date: editing.sale_date,
        });
      } else {
        reset({
          product_id: "",
          quantity: 0,
          total_price: 0,
          client_name: "",
          location: { latitude: 0, longitude: 0 },
          sale_date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [visible, editing, products]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getAllFromCollection<Sale>("sales", user.uid)
      .then((items) => setSales(items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    getAllFromCollection<Product>("products", user.uid)
      .then((items) => setProducts(items))
      .catch((err) => console.error(err));
  }, [user]);

  const renderItem = ({ item }: { item: Sale }) => {
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
                {formatDateToBR(item.sale_date)}
              </Paragraph>
            </View>

            <View style={styles.locationContainer}>
              <Paragraph style={styles.detailLabel}>Localização:</Paragraph>
              <Paragraph style={styles.locationValue}>
                {item.location?.latitude.toFixed(4)},{" "}
                {item.location?.longitude.toFixed(4)}
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

  if (visible && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Carregando lista de produtos...</Paragraph>
      </View>
    );
  }

  const handleSave = async (data: any) => {
    try {
      if (editing) {
        await updateInCollection("sales", editing.id!, data, user!.uid);
      } else {
        await addToCollection("sales", data, user!.uid);
      }
      const items = await getAllFromCollection<Sale>("sales", user!.uid);
      setSales(items);
      setVisible(false);
      setEditing(null);
    } catch (error) {
      // tratamento de erro
      console.error(error);
    }
  };

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
            <ScrollView style={styles.formScroll}>
              <Card.Content>
                <Title style={styles.formTitle}>
                  {editing ? "Editar Venda" : "Nova Venda"}
                </Title>

                <Text style={styles.label}>Nome do Cliente</Text>
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

                <Text style={styles.label}>Produto</Text>
                <Controller
                  control={control}
                  name="product_id"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      label="Produto"
                      mode="outlined"
                      value={value || ""}
                      onSelect={onChange}
                      options={products.map((p) => ({
                        label: p.name,
                        value: p.id!,
                      }))}
                      error={!!errors.product_id}
                    />
                  )}
                />
                {errors.product_id && (
                  <HelperText type="error">
                    {errors.product_id.message}
                  </HelperText>
                )}

                <Text style={styles.label}>Quantidade</Text>
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
                  <HelperText type="error">
                    {errors.quantity.message}
                  </HelperText>
                )}

                <Text style={styles.label}>Valor Total (R$)</Text>
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

                <Text style={styles.label}>Latitude</Text>
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

                <Text style={styles.label}>Longitude</Text>
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

                <Text style={styles.label}>Data da Venda</Text>
                <Controller
                  control={control}
                  name="sale_date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Data da Venda"
                      value={formatDateToBR(value)}
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(formatDateToISO(text))}
                      error={!!errors.sale_date}
                      style={styles.input}
                      placeholder="DD-MM-AAAA"
                    />
                  )}
                />
                {errors.sale_date && (
                  <HelperText type="error">
                    {errors.sale_date.message}
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
                    {editing ? "Atualizar" : "Salvar"}
                  </Button>
                </View>
              </Card.Content>
            </ScrollView>
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
