import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productFormSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit_price: z.number(),
  cost_price: z.number(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export function useProductForm(defaultValues?: Partial<ProductFormData>) {
  return useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      unit_price: 0,
      cost_price: 0,
      ...defaultValues,
    },
  });
}

export { productFormSchema }; 