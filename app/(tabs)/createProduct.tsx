import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const formSchema = z.object({
  name: z.string().nonempty('Nome é obrigatório'),
  category: z.string().nonempty('Categoria é obrigatória'),
  unit_price: z.preprocess((v) => Number(v), z.number().positive('Preço de venda inválido')),
  cost_price: z.preprocess((v) => Number(v), z.number().nonnegative('Custo inválido')),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateProduct() {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      unit_price: 0,
      cost_price: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    await addDoc(collection(db, 'products'), {
      name: data.name,
      category: data.category,
      unit_price: data.unit_price,
      cost_price: data.cost_price,
      created_by: auth.currentUser?.uid || '',
      created_at: serverTimestamp(),
    });
    reset();
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput label="Nome" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>
          </>
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput label="Categoria" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
            <HelperText type="error" visible={!!errors.category}>{errors.category?.message}</HelperText>
          </>
        )}
      />
      <Controller
        control={control}
        name="unit_price"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput label="Preço de venda" mode="outlined" keyboardType="numeric" value={String(value)} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
            <HelperText type="error" visible={!!errors.unit_price}>{errors.unit_price?.message}</HelperText>
          </>
        )}
      />
      <Controller
        control={control}
        name="cost_price"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput label="Custo" mode="outlined" keyboardType="numeric" value={String(value)} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
            <HelperText type="error" visible={!!errors.cost_price}>{errors.cost_price?.message}</HelperText>
          </>
        )}
      />
      <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
        Salvar Produto
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});
