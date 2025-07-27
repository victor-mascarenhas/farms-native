import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';

import { saleSchema } from '@/schemas/firebaseSchemas';
import { useAuth } from '@/AuthProvider';
import { db } from '@/firebaseConfig';

const schema = saleSchema.omit({ created_by: true });

type FormData = z.infer<typeof schema>;

export default function AddSaleScreen() {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      quantity: 0,
      total_price: 0,
      client_name: '',
      sale_date: new Date(),
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'sales'), {
        ...data,
        created_by: user.uid,
      });
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
        name="quantity"
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
      {errors.quantity && <HelperText type="error">{errors.quantity.message}</HelperText>}

      <Controller
        control={control}
        name="total_price"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Valor Total"
            value={value ? String(value) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.total_price && <HelperText type="error">{errors.total_price.message}</HelperText>}

      <Controller
        control={control}
        name="client_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Cliente"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.client_name && <HelperText type="error">{errors.client_name.message}</HelperText>}

      <Controller
        control={control}
        name="sale_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Data"
            value={value instanceof Date ? value.toISOString().slice(0,10) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(new Date(text))}
            style={styles.input}
          />
        )}
      />
      {errors.sale_date && <HelperText type="error">{errors.sale_date.message}</HelperText>}

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
