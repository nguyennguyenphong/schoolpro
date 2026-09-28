import type {
  AnnouncementItem,
  AnnouncementFilter,
  AnnouncementSummary,
  AnnouncementListResult,
} from "@/modules/students/features/announcements/types";
import { mockAnnouncements } from "@/modules/students/features/announcements/services/mock/mockAnnouncementsData";

class AnnouncementService {
  private items: AnnouncementItem[] = [...mockAnnouncements];
  private latency = 150;

  async getAnnouncements(filter: AnnouncementFilter): Promise<AnnouncementListResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.items];

        // 1. Search query
        if (filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          result = result.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.summary.toLowerCase().includes(q) ||
              item.department.toLowerCase().includes(q) ||
              item.author.toLowerCase().includes(q),
          );
        }

        // 2. Category
        if (filter.category && filter.category !== "all") {
          result = result.filter((item) => item.category === filter.category);
        }

        // 3. Department
        if (filter.department && filter.department !== "all") {
          result = result.filter((item) => item.department === filter.department);
        }

        // 4. Read status
        if (filter.readStatus === "unread") {
          result = result.filter((item) => !item.isRead);
        } else if (filter.readStatus === "read") {
          result = result.filter((item) => item.isRead);
        }

        // 5. Priority
        if (filter.priority && filter.priority !== "all") {
          result = result.filter((item) => item.priority === filter.priority);
        }

        // 6. Sorting
        result.sort((a, b) => {
          // Pinned always on top
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          if (filter.sortBy === "oldest") {
            return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
          }

          if (filter.sortBy === "views") {
            return b.viewsCount - a.viewsCount;
          }

          if (filter.sortBy === "priority") {
            const priorityWeight = { urgent: 3, high: 2, normal: 1 };
            const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (diff !== 0) return diff;
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          }

          // Default: newest
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        });

        // 7. Pagination
        const total = result.length;
        const page = Math.max(1, filter.page || 1);
        const pageSize = Math.max(1, filter.pageSize || 9);
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const items = result.slice(startIndex, startIndex + pageSize);

        resolve({
          items,
          total,
          page,
          pageSize,
          totalPages,
        });
      }, this.latency);
    });
  }

  async getAnnouncementById(id: string): Promise<AnnouncementItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.items.find((ann) => ann.id === id) || null;
        resolve(item);
      }, 50);
    });
  }

  async getSummary(): Promise<AnnouncementSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = this.items.length;
        const unreadCount = this.items.filter((item) => !item.isRead).length;
        const urgentCount = this.items.filter((item) => item.priority === "urgent").length;
        const academicCount = this.items.filter((item) => item.category === "academic").length;
        const examCount = this.items.filter((item) => item.category === "exam").length;
        const activityCount = this.items.filter((item) => item.category === "activity").length;

        resolve({
          total,
          unreadCount,
          urgentCount,
          academicCount,
          examCount,
          activityCount,
        });
      }, 50);
    });
  }

  async markAsRead(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.items.find((ann) => ann.id === id);
        if (item) {
          item.isRead = true;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 50);
    });
  }

  async markMultipleAsRead(ids: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idSet = new Set(ids);
        this.items.forEach((item) => {
          if (idSet.has(item.id)) {
            item.isRead = true;
          }
        });
        resolve(true);
      }, 100);
    });
  }

  async markMultipleAsUnread(ids: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idSet = new Set(ids);
        this.items.forEach((item) => {
          if (idSet.has(item.id)) {
            item.isRead = false;
          }
        });
        resolve(true);
      }, 100);
    });
  }

  async markAllAsRead(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.items.forEach((item) => {
          item.isRead = true;
        });
        resolve(true);
      }, 100);
    });
  }

  async getDepartments(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deptSet = new Set(this.items.map((item) => item.department));
        resolve(Array.from(deptSet));
      }, 50);
    });
  }
}

export const announcementService = new AnnouncementService();
