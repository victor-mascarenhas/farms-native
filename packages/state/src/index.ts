import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GoalState {
  reachedGoals: Record<string, boolean>;
  setGoalReached: (id: string) => void;
  clearReachedGoals: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      reachedGoals: {},
      setGoalReached: (id) => set((state) => ({
        reachedGoals: { ...state.reachedGoals, [id]: true }
      })),
      clearReachedGoals: () => set({ reachedGoals: {} }),
    }),
    {
      name: 'goal-storage',
    }
  )
);

// Notification state
interface NotificationState {
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false,
          }
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
