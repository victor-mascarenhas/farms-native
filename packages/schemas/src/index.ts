import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  created_at: z.instanceof(Timestamp),
  id: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export const productSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit_price: z.number(),
  cost_price: z.number(),
  created_by: z.string(),
  created_at: z.instanceof(Timestamp),
  id: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const saleSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  total_price: z.number(),
  client_name: z.string(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  sale_date: z.string(),
  created_by: z.string(),
  id: z.string().optional(),
});

export type Sale = z.infer<typeof saleSchema>;

export const productionSchema = z.object({
  product_id: z.string(),
  status: z.enum(["aguardando", "em_producao", "colhido"]),
  quantity: z.number(),
  start_date: z.string(),
  harvest_date: z.string(),
  created_by: z.string(),
  id: z.string().optional(),
});

export type Production = z.infer<typeof productionSchema>;

export const stockSchema = z.object({
  product_id: z.string(),
  available_quantity: z.number(),
  last_updated: z.string(),
  id: z.string().optional(),
});

export type Stock = z.infer<typeof stockSchema>;

export const goalSchema = z.object({
  type: z.enum(["venda", "producao"]),
  product_id: z.string(),
  target_quantity: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  notified: z.boolean(),
  created_by: z.string(),
  id: z.string().optional(),
});

export type Goal = z.infer<typeof goalSchema>;

export const notificationSchema = z.object({
  user_id: z.string(),
  message: z.string(),
  created_at: z.instanceof(Timestamp),
  read: z.boolean(),
  id: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;
