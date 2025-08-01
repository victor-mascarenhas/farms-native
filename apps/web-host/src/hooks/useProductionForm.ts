import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productionFormSchema = z.object({
  product_id: z.string(),
  status: z.enum(["aguardando", "em_producao", "colhido"]),
  quantity: z.number(),
  start_date: z.date(),
  harvest_date: z.date().nullable(),
});

export type ProductionFormData = z.infer<typeof productionFormSchema>;

export function useProductionForm(defaultValues?: Partial<ProductionFormData>) {
  return useForm<ProductionFormData>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      product_id: "",
      status: "aguardando",
      quantity: 0,
      start_date: new Date(),
      harvest_date: null,
      ...defaultValues,
    },
  });
}

export { productionFormSchema };
