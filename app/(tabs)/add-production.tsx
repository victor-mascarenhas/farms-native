import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';

import { productionSchema } from '@/schemas/firebaseSchemas';
import { useAuth } from '@/AuthProvider';
import { db } from '@/firebaseConfig';

const schema = productionSchema.omit({ created_by: true });

type FormData = z.infer<typeof schema>;

export default function AddProductionScreen() {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      status: 'aguardando',
      quantity: 0,
      start_date: new Date(),
      harvest_date: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'productions'), {
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
        name="status"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Status"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.status && <HelperText type="error">{errors.status.message}</HelperText>}

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
        name="start_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Início"
            value={value instanceof Date ? value.toISOString().slice(0,10) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(new Date(text))}
            style={styles.input}
          />
        )}
      />
      {errors.start_date && <HelperText type="error">{errors.start_date.message}</HelperText>}

      <Controller
        control={control}
        name="harvest_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Colheita"
            value={value instanceof Date ? value.toISOString().slice(0,10) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(text ? new Date(text) : null)}
            style={styles.input}
          />
        )}
      />
      {errors.harvest_date && <HelperText type="error">{errors.harvest_date.message}</HelperText>}

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
