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

import { useAuth } from "@/AuthProvider";
import { db } from "@farms/firebase";
import { Goal, goalSchema } from "@farms/schemas";
import { useGoalStore } from "@farms/state";
import { getAllFromCollection } from "@farms/firebase/src/firestoreUtils";
import { styles } from "./../styles/goals";

const formSchema = goalSchema.omit({ created_by: true });
type FormData = z.infer<typeof formSchema>;

const formatDateToBR = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

const formatDateToISO = (date: string) => {
  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const reachedGoals = useGoalStore((s) => s.reachedGoals);
  const setGoalReached = useGoalStore((s) => s.setGoalReached);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const schema = formSchema;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "venda",
      product_id: "",
      target_quantity: 0,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      notified: false,
    },
  });

  useEffect(() => {
    const user = getAuth().currentUser;
    const q = query(
      collection(db, "goals"),
      where("created_by", "==", user?.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Goal[] = [];
        querySnapshot.forEach((doc) => {
          const data = goalSchema.parse(doc.data());
          items.push({ id: doc.id, ...data });
        });
        setGoals(items);
        items.forEach((g) => {
          if (g.notified && !reachedGoals[g.id!]) {
            setGoalReached(g.id!);
          }
        });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (visible) {
      if (editing) {
        reset({
          type: editing.type,
          product_id: editing.product_id,
          target_quantity: editing.target_quantity,
          start_date: editing.start_date,
          end_date: editing.end_date,
          notified: editing.notified,
        });
      } else {
        reset({
          type: "venda",
          product_id: "",
          target_quantity: 0,
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
          notified: false,
        });
      }
    }
  }, [visible, editing]);

  const renderItem = ({ item }: { item: Goal }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case "venda":
          return "#10b981";
        case "producao":
          return "#3b82f6";
        default:
          return "#64748b";
      }
    };

    const getTypeText = (type: string) => {
      switch (type) {
        case "venda":
          return "Venda";
        case "producao":
          return "Produção";
        default:
          return type;
      }
    };

    return (
      <Card style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <Title style={styles.productId}>{item.product_id}</Title>
            <View style={styles.goalActions}>
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

          <View style={styles.goalDetails}>
            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Tipo:</Paragraph>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeColor(item.type) + "20" },
                ]}
              >
                <Paragraph
                  style={[styles.typeValue, { color: getTypeColor(item.type) }]}
                >
                  {getTypeText(item.type)}
                </Paragraph>
              </View>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Meta:</Paragraph>
              <Paragraph style={styles.targetValue}>
                {item.target_quantity}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Data de Início:</Paragraph>
              <Paragraph style={styles.dateValue}>
                {formatDateToBR(item.start_date)}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Data de Fim:</Paragraph>
              <Paragraph style={styles.endDateValue}>
                {formatDateToBR(item.end_date)}
              </Paragraph>
            </View>

            <View style={styles.detailContainer}>
              <Paragraph style={styles.detailLabel}>Notificado:</Paragraph>
              <Paragraph style={styles.notifiedValue}>
                {item.notified ? "Sim" : "Não"}
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
        <Paragraph>Carregando metas...</Paragraph>
      </View>
    );
  }

  const handleSave = async (data: any) => {
    try {
      if (editing) {
        await updateDoc(doc(db, "goals", editing.id!), data);
      } else {
        await addDoc(collection(db, "goals"), data);
      }
      const items = await getAllFromCollection<Goal>("goals", user?.uid!);
      setGoals(items);
      setVisible(false);
      setEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Metas</Title>
        <Paragraph style={styles.subtitle}>
          {goals.length} meta{goals.length !== 1 ? "s" : ""} definida
          {goals.length !== 1 ? "s" : ""}
        </Paragraph>
      </View>

      <FlatList
        data={goals}
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
                {editing ? "Editar Meta" : "Nova Meta"}
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

              <Text style={styles.label}>Tipo</Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Tipo"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.type}
                    style={styles.input}
                  />
                )}
              />
              {errors.type && (
                <HelperText type="error">{errors.type.message}</HelperText>
              )}

              <Text style={styles.label}>Meta de Quantidade</Text>
              <Controller
                control={control}
                name="target_quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Meta de Quantidade"
                    value={value ? String(value) : ""}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    error={!!errors.target_quantity}
                    style={styles.input}
                  />
                )}
              />
              {errors.target_quantity && (
                <HelperText type="error">
                  {errors.target_quantity.message}
                </HelperText>
              )}

              <Text style={styles.label}>Data de Início</Text>
              <Controller
                control={control}
                name="start_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Data de Início"
                    value={formatDateToBR(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatDateToISO(text))}
                    error={!!errors.start_date}
                    style={styles.input}
                    placeholder="DD-MM-AAAA"
                  />
                )}
              />
              {errors.start_date && (
                <HelperText type="error">
                  {errors.start_date.message}
                </HelperText>
              )}

              <Text style={styles.label}>Data de Fim</Text>
              <Controller
                control={control}
                name="end_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Data de Fim"
                    value={formatDateToBR(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatDateToISO(text))}
                    error={!!errors.end_date}
                    style={styles.input}
                    placeholder="DD-MM-AAAA"
                  />
                )}
              />
              {errors.end_date && (
                <HelperText type="error">{errors.end_date.message}</HelperText>
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
