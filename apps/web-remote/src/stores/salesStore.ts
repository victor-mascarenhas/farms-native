import { create, StateCreator } from "zustand";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  removeFromCollection,
} from "@farms/firebase/src/firestoreUtils";

export type Sale = {
  id?: string;
  produto: string;
  quantidade: number;
  valor: number;
  data: string;
  lat?: number;
  lng?: number;
  // Adicione outros campos necessários
};

type SalesStore = {
  sales: Sale[];
  loading: boolean;
  fetchSales: () => Promise<void>;
  addSale: (data: Omit<Sale, "id">) => Promise<void>;
  updateSale: (id: string, data: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
};

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  loading: false,
  fetchSales: async () => {
    set({ loading: true });
    const res = await fetch("/api/sales");
    const sales: Sale[] = await res.json();
    set({ sales, loading: false });
  },
  addSale: async (data: Omit<Sale, "id">) => {
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchSales();
  },
  updateSale: async (id: string, data: Partial<Sale>) => {
    await fetch("/api/sales", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await get().fetchSales();
  },
  deleteSale: async (id: string) => {
    await fetch("/api/sales", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await get().fetchSales();
  },
}));
