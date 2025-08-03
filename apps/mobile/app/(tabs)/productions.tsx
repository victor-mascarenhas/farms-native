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
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { productionSchema, productSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/productions";

const typedSchema = productionSchema;
type Production = z.infer<typeof typedSchema> & {
  id: string;
  productName?: string;
};
type Product = z.infer<typeof productSchema> & { id: string };

export default function ProductionsScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Production | null>(null);
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
      status: "aguardando",
      quantity: 0,
      start_date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          status: editing.status,
          quantity: editing.quantity,
          start_date: editing.start_date,
          harvest_date: editing.harvest_date,
        });
      } else {
        reset({
          product_id: "",
          status: "aguardando",
          quantity: 0,
          start_date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [visible, editing]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadData = async () => {
      try {
        const productsData = await getAllFromCollection<Product>(
          "products",
          user.uid
        );
        setProducts(productsData);

        const productionsData = await getAllFromCollection<Production>(
          "productions",
          user.uid
        );
        const productionsWithNames = productionsData.map((production) => {
          const product = productsData.find(
            (p) => p.id === production.product_id
          );
          return {
            ...production,
            productName: product?.name || "Produto não encontrado",
          };
        });

        setProductions(productionsWithNames);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const renderItem = ({ item }: { item: Production }) => {
    const [startYear, startMonth, startDay] = item.start_date.split("-");
    const startDate = new Date(
      Number(startYear),
      Number(startMonth) - 1,
      Number(startDay)
    );

    let harvestDate;
    if (item.harvest_date) {
      const [harvestYear, harvestMonth, harvestDay] =
        item.harvest_date.split("-");
      harvestDate = new Date(
        Number(harvestYear),
        Number(harvestMonth) - 1,
        Number(harvestDay)
      );
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "aguardando":
          return "#f59e0b";
        case "em_andamento":
          return "#3b82f6";
        case "concluida":
          return "#10b981";
        default:
          return "#64748b";
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "aguardando":
          return "Aguardando";
        case "em_andamento":
          return "Em Andamento";
        case "concluida":
          return "Concluída";
        default:
          return status;
      }
    };

    return (
      <Card style={styles.productionCard}>
        <Card.Content>
          <View style={styles.productionHeader}>
            <Title style={styles.productId}>Produto: {item.productName}</Title>
            <View style={styles.productionActions}>
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

          <View style={styles.productionDetails}>
            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Status:</Paragraph>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <Paragraph
                  style={[
                    styles.statusValue,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusText(item.status)}
                </Paragraph>
              </View>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Quantidade:</Paragraph>
              <Paragraph style={styles.quantityValue}>
                {item.quantity}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Data de Início:</Paragraph>
              <Paragraph style={styles.dateValue}>
                {startDate.toLocaleDateString("pt-BR")}
              </Paragraph>
            </View>

            {harvestDate && (
              <View style={styles.detailContainer}>
                <Paragraph style={styles.detailLabel}>
                  Data de Colheita:
                </Paragraph>
                <Paragraph style={styles.harvestValue}>
                  {harvestDate.toLocaleDateString("pt-BR")}
                </Paragraph>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Carregando produções...</Paragraph>
      </View>
    );
  }

  const handleSave = async (data: any) => {
    if (!user) return;
    try {
      if (editing) {
        await updateInCollection("productions", editing.id, data, user.uid);
      } else {
        await addToCollection("productions", data, user.uid);
      }
      const items = await getAllFromCollection<Production>(
        "productions",
        user.uid
      );
      setProductions(items);
      setVisible(false);
      setEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Produções</Title>
        <Paragraph style={styles.subtitle}>
          {productions.length} produção{productions.length !== 1 ? "ões" : ""}{" "}
          registrada{productions.length !== 1 ? "s" : ""}
        </Paragraph>
      </View>

      <FlatList
        data={productions}
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
                {editing ? "Editar Produção" : "Nova Produção"}
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

              <Text style={styles.label}>Status</Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Status"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.status}
                    style={styles.input}
                  />
                )}
              />
              {errors.status && (
                <HelperText type="error">{errors.status.message}</HelperText>
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
                <HelperText type="error">{errors.quantity.message}</HelperText>
              )}

              <Text style={styles.label}>Data de Início</Text>
              <Controller
                control={control}
                name="start_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Data de Início"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.start_date}
                    style={styles.input}
                    placeholder="AAAA-MM-DD"
                  />
                )}
              />
              {errors.start_date && (
                <HelperText type="error">
                  {errors.start_date.message}
                </HelperText>
              )}

              <Text style={styles.label}>Data de Colheita (opcional)</Text>
              <Controller
                control={control}
                name="harvest_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Data de Colheita (opcional)"
                    value={value || ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={styles.input}
                    placeholder="AAAA-MM-DD"
                  />
                )}
              />
              {errors.harvest_date && (
                <HelperText type="error">
                  {errors.harvest_date.message}
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
