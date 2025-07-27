import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';

import { goalSchema } from '@/schemas/firebaseSchemas';
import { useAuth } from '@/AuthProvider';
import { db } from '@/firebaseConfig';

const schema = goalSchema.omit({ created_by: true });

type FormData = z.infer<typeof schema>;

export default function AddGoalScreen() {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'venda',
      product_id: '',
      target_quantity: 0,
      start_date: new Date(),
      end_date: new Date(),
      notified: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
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
        name="type"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Tipo"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.type && <HelperText type="error">{errors.type.message}</HelperText>}

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
        name="target_quantity"
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
      {errors.target_quantity && <HelperText type="error">{errors.target_quantity.message}</HelperText>}

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
        name="end_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Fim"
            value={value instanceof Date ? value.toISOString().slice(0,10) : ''}
            onBlur={onBlur}
            onChangeText={text => onChange(new Date(text))}
            style={styles.input}
          />
        )}
      />
      {errors.end_date && <HelperText type="error">{errors.end_date.message}</HelperText>}

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

