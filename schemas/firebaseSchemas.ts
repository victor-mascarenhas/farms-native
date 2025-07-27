import { z } from "zod";

// 📌 users
export const timestampSchema = z.union([
  z.date(),
  z.object({ seconds: z.number(), nanoseconds: z.number() }),
]);

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  created_at: timestampSchema,
});

// 📌 products
export const productSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit_price: z.number(),
  cost_price: z.number(),
  created_by: z.string(),
  created_at: timestampSchema,
});

// 📌 sales
export const saleSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  total_price: z.number(),
  client_name: z.string(),
  sale_date: timestampSchema,
  created_by: z.string(),
});

// 📌 productions
export const productionSchema = z.object({
  product_id: z.string(),
  status: z.enum(["aguardando", "em_producao", "colhido"]),
  quantity: z.number(),
  start_date: timestampSchema,
  harvest_date: timestampSchema.nullable(),
  created_by: z.string(),
});

// 📌 stock
export const stockSchema = z.object({
  product_id: z.string(),
  available_quantity: z.number(),
  last_updated: timestampSchema,
});

// 📌 goals
export const goalSchema = z.object({
  type: z.enum(["venda", "producao"]),
  product_id: z.string(),
  target_quantity: z.number(),
  start_date: timestampSchema,
  end_date: timestampSchema,
  notified: z.boolean(),
  created_by: z.string(),
});

// 📌 notifications (opcional)
export const notificationSchema = z.object({
  user_id: z.string(),
  message: z.string(),
  created_at: timestampSchema,
  read: z.boolean(),
});
