import { create } from "zustand";
import { announcementService } from "@/modules/students/features/announcements/services";

interface NotificationStoreState {
  unreadCount: number;
  isLoading: boolean;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount?: number) => void;
  incrementUnreadCount: (amount?: number) => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    if (useNotificationStore.getState().isLoading) return;
    try {
      set({ isLoading: true });
      const count = await announcementService.getUnreadCount();
      set({ unreadCount: Math.max(0, count), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: Math.max(0, count) });
  },

  decrementUnreadCount: (amount = 1) => {
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) }));
  },

  incrementUnreadCount: (amount = 1) => {
    set((state) => ({ unreadCount: state.unreadCount + amount }));
  },
}));
