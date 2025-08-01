import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema } from '@farms/schemas';
import { z } from 'zod';

const saleFormSchema = saleSchema.omit({ 
  created_by: true 
}).extend({
  sale_date: z.date(),
});

export type SaleFormData = z.infer<typeof saleFormSchema>;

export function useSaleForm(defaultValues?: Partial<SaleFormData>) {
  return useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      product_id: '',
      quantity: 0,
      total_price: 0,
      client_name: '',
      location: {
        latitude: 0,
        longitude: 0,
      },
      sale_date: new Date(),
      ...defaultValues,
    },
  });
}

export { saleFormSchema };