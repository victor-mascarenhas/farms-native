import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema } from '@farms/schemas';
import { z } from 'zod';

const goalFormSchema = goalSchema.omit({ 
  created_by: true 
}).extend({
  start_date: z.date(),
  end_date: z.date(),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;

export function useGoalForm(defaultValues?: Partial<GoalFormData>) {
  return useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      type: 'venda',
      product_id: '',
      target_quantity: 0,
      start_date: new Date(),
      end_date: new Date(),
      notified: false,
      ...defaultValues,
    },
  });
}

export { goalFormSchema };