import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@farms/schemas';
import { z } from 'zod';

const productFormSchema = productSchema.omit({ 
  created_by: true, 
  created_at: true 
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