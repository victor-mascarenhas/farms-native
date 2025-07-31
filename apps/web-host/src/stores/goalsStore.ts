import { create, StateCreator } from "zustand";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
} from "../services/firestoreService";

export type Goal = {
  id?: string;
  tipo: "venda" | "producao";
  descricao: string;
  valor: number;
  progresso: number;
  atingida: boolean;
  // Adicione outros campos necessários
};

type GoalsStore = {
  goals: Goal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (data: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
};

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [],
  loading: false,
  fetchGoals: async () => {
    set({ loading: true });
    const res = await fetch("/api/goals");
    const goals: Goal[] = await res.json();
    set({ goals, loading: false });
  },
  addGoal: async (data: Omit<Goal, "id">) => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchGoals();
  },
  updateGoal: async (id: string, data: Partial<Goal>) => {
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await get().fetchGoals();
  },
  deleteGoal: async (id: string) => {
    await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await get().fetchGoals();
  },
}));
