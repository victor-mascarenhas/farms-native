import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
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
import { onSnapshot, query, where, collection } from "firebase/firestore";
import { z } from "zod";
import { getAuth } from "firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { db } from "@farms/firebase";
import { productionSchema } from "@farms/schemas";
import { useAuth } from "@/AuthProvider";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
} from "@farms/firebase/src/firestoreUtils";

const typedSchema = productionSchema;
type Production = z.infer<typeof typedSchema> & { id: string };

export default function ProductionsScreen() {
  const [productions, setProductions] = useState<Production[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
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
      start_date: new Date(),
      harvest_date: null,
    },
  });

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          product_id: editing.product_id,
          status: editing.status,
          quantity: editing.quantity,
          start_date:
            editing.start_date instanceof Date
              ? editing.start_date
              : new Date((editing.start_date as any).seconds * 1000),
          harvest_date:
            editing.harvest_date instanceof Date ||
            editing.harvest_date === null
              ? editing.harvest_date
              : new Date((editing.harvest_date as any).seconds * 1000),
        });
      } else {
        reset({
          product_id: "",
          status: "aguardando",
          quantity: 0,
          start_date: new Date(),
          harvest_date: null,
        });
      }
    }
  }, [visible, editing]);

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(
      collection(db, "productions"),
      where("created_by", "==", user?.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Production[] = [];
        querySnapshot.forEach((doc) => {
          const data = typedSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setProductions(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Production }) => {
    const startDate =
      item.start_date instanceof Date
        ? item.start_date
        : new Date((item.start_date as any).seconds * 1000);

    const harvestDate =
      item.harvest_date instanceof Date
        ? item.harvest_date
        : item.harvest_date
        ? new Date((item.harvest_date as any).seconds * 1000)
        : null;

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
            <Title style={styles.productId}>Produto: {item.product_id}</Title>
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
      // Atualize a lista imediatamente após adicionar/editar, se não usar onSnapshot
      const items = await getAllFromCollection<Production>(
        "productions",
        user.uid
      );
      setProductions(items);
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
                    value={
                      value instanceof Date
                        ? value.toISOString().slice(0, 10)
                        : ""
                    }
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(new Date(text))}
                    error={!!errors.start_date}
                    style={styles.input}
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
                    value={
                      value instanceof Date
                        ? value.toISOString().slice(0, 10)
                        : ""
                    }
                    onBlur={onBlur}
                    onChangeText={(text) =>
                      onChange(text ? new Date(text) : null)
                    }
                    style={styles.input}
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
  productionCard: {
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
  productionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productId: {
    fontSize: 18,
    flex: 1,
    color: "#23272f",
    fontWeight: "600",
  },
  productionActions: {
    flexDirection: "row",
  },
  editButton: {
    marginLeft: 8,
  },
  productionDetails: {
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
  quantityValue: {
    fontWeight: "bold",
    color: "#3b82f6",
  },
  dateValue: {
    fontWeight: "bold",
    color: "#8b5cf6",
  },
  harvestValue: {
    fontWeight: "bold",
    color: "#10b981",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusValue: {
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
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#23272f",
  },
});
