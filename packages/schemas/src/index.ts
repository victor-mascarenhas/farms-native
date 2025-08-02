import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  created_at: z.instanceof(Timestamp),
});

export const productSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit_price: z.number(),
  cost_price: z.number(),
  created_by: z.string(),
  created_at: z.instanceof(Timestamp),
});

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
  sale_date: z.instanceof(Timestamp),
  created_by: z.string(),
});

export const productionSchema = z.object({
  product_id: z.string(),
  status: z.enum(["aguardando", "em_producao", "colhido"]),
  quantity: z.number(),
  start_date: z.instanceof(Timestamp),
  harvest_date: z.instanceof(Timestamp).nullable(),
  created_by: z.string(),
});

export const stockSchema = z.object({
  product_id: z.string(),
  available_quantity: z.number(),
  last_updated: z.instanceof(Timestamp),
});

export const goalSchema = z.object({
  type: z.enum(["venda", "producao"]),
  product_id: z.string(),
  target_quantity: z.number(),
  start_date: z.instanceof(Timestamp),
  end_date: z.instanceof(Timestamp),
  notified: z.boolean(),
  created_by: z.string(),
});

export const notificationSchema = z.object({
  user_id: z.string(),
  message: z.string(),
  created_at: z.instanceof(Timestamp),
  read: z.boolean(),
});
