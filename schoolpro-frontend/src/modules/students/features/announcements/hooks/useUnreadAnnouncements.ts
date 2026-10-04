import { useEffect } from "react";
import { useNotificationStore } from "@/shared/store/useNotificationStore";

export const useUnreadAnnouncements = () => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadNotificationsCount: unreadCount,
  };
};
