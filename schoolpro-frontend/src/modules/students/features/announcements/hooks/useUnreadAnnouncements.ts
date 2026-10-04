import { useEffect, useState } from "react";
import { announcementService } from "@/modules/students/features/announcements/services";

export const useUnreadAnnouncements = () => {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    const fetchUnreadCount = async () => {
      try {
        const result = await announcementService.getUnreadCount();

        if (!ignore) {
          setUnreadNotificationsCount(result);
        }
      } catch {
        // Keep current count
      }
    };

    fetchUnreadCount();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    unreadNotificationsCount: unreadNotificationsCount,
  };
};
