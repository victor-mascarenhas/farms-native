import { create } from "zustand";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
} from "../services/firestoreService";

export type Production = {
  id?: string;
  nome: string;
  status: "aguardando" | "em_producao" | "colhido";
  data: string;
  // Adicione outros campos necessários
};

type ProductionStore = {
  productions: Production[];
  loading: boolean;
  fetchProductions: () => Promise<void>;
  addProduction: (data: Omit<Production, "id">) => Promise<void>;
  updateProduction: (id: string, data: Partial<Production>) => Promise<void>;
  deleteProduction: (id: string) => Promise<void>;
};

export const useProductionStore = create<ProductionStore>((set, get) => ({
  productions: [],
  loading: false,
  fetchProductions: async () => {
    set({ loading: true });
    const productions = await getAllFromCollection<Production>("productions");
    set({ productions, loading: false });
  },
  addProduction: async (data) => {
    await addToCollection("productions", data);
    await get().fetchProductions();
  },
  updateProduction: async (id, data) => {
    await updateInCollection("productions", id, data);
    await get().fetchProductions();
  },
  deleteProduction: async (id) => {
    await deleteFromCollection("productions", id);
    await get().fetchProductions();
  },
}));
