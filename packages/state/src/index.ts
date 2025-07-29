import create from 'zustand'

interface GoalState {
  reachedGoals: Record<string, boolean>
  setGoalReached: (id: string) => void
}

export const useGoalStore = create<GoalState>((set) => ({
  reachedGoals: {},
  setGoalReached: (id) => set((state) => ({
    reachedGoals: { ...state.reachedGoals, [id]: true }
  }))
}))
