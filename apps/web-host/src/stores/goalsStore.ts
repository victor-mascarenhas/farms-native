import { create } from "zustand";
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
    const goals = await getAllFromCollection<Goal>("goals");
    set({ goals, loading: false });
  },
  addGoal: async (data) => {
    await addToCollection("goals", data);
    await get().fetchGoals();
  },
  updateGoal: async (id, data) => {
    await updateInCollection("goals", id, data);
    await get().fetchGoals();
  },
  deleteGoal: async (id) => {
    await deleteFromCollection("goals", id);
    await get().fetchGoals();
  },
}));
