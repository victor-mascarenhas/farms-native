import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';

import { stockSchema } from '@/schemas/firebaseSchemas';
import { db } from '@/firebaseConfig';

const schema = stockSchema;

type FormData = z.infer<typeof schema>;

export default function AddStockScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      available_quantity: 0,
      last_updated: new Date(),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addDoc(collection(db, 'stock'), data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="product_id"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Produto"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.product_id && <HelperText type="error">{errors.product_id.message}</HelperText>}

      <Controller
        control={control}
        name="available_quantity"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Quantidade"
            value={value ? String(value) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.available_quantity && <HelperText type="error">{errors.available_quantity.message}</HelperText>}

      <Controller
        control={control}
        name="last_updated"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Atualizado em"
            value={value instanceof Date ? value.toISOString().slice(0,10) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(new Date(text))}
            style={styles.input}
          />
        )}
      />
      {errors.last_updated && <HelperText type="error">{errors.last_updated.message}</HelperText>}

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
