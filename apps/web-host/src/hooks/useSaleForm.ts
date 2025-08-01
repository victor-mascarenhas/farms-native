import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const saleFormSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  total_price: z.number(),
  client_name: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
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