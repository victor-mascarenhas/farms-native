import { create } from "zustand";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
} from "../services/firestoreService";

export type Sale = {
  id?: string;
  produto: string;
  quantidade: number;
  valor: number;
  data: string;
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
    const sales = await getAllFromCollection<Sale>("sales");
    set({ sales, loading: false });
  },
  addSale: async (data) => {
    await addToCollection("sales", data);
    await get().fetchSales();
  },
  updateSale: async (id, data) => {
    await updateInCollection("sales", id, data);
    await get().fetchSales();
  },
  deleteSale: async (id) => {
    await deleteFromCollection("sales", id);
    await get().fetchSales();
  },
}));
