import { create } from "zustand";

export type Production = {
  id?: string;
  nome: string;
  status: "aguardando" | "em_producao" | "colhido";
  data: string;
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
    const res = await fetch("/api/productions");
    const productions: Production[] = await res.json();
    set({ productions, loading: false });
  },
  addProduction: async (data: Omit<Production, "id">) => {
    await fetch("/api/productions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchProductions();
  },
  updateProduction: async (id: string, data: Partial<Production>) => {
    await fetch("/api/productions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await get().fetchProductions();
  },
  deleteProduction: async (id: string) => {
    await fetch("/api/productions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await get().fetchProductions();
  },
}));
