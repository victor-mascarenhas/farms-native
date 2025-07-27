import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { db } from '@/firebaseConfig';
import { productSchema } from '@/schemas/firebaseSchemas';

const schema = productSchema.omit({ created_by: true, created_at: true });
type FormData = z.infer<typeof schema>;

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const data = schema.parse(snap.data());
        Object.entries(data).forEach(([key, value]) => setValue(key as keyof FormData, value));
      }
    };
    load();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'products', id), data);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
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
      {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

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
      {errors.category && <HelperText type="error">{errors.category.message}</HelperText>}

      <Controller
        control={control}
        name="unit_price"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Preço Unitário"
            value={value ? String(value) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.unit_price && <HelperText type="error">{errors.unit_price.message}</HelperText>}

      <Controller
        control={control}
        name="cost_price"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Preço de Custo"
            value={value ? String(value) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.cost_price && <HelperText type="error">{errors.cost_price.message}</HelperText>}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
});
