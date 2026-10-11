import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  AnnouncementCategoryOption,
  AnnouncementFilter,
  AnnouncementItem,
  AnnouncementListResult,
  AnnouncementSummary,
} from "@/modules/students/features/announcements/types";
import { mockAnnouncements } from "@/modules/students/features/announcements/services/mock/mockAnnouncementsData";

class AnnouncementService {
  /**
   * Fetch announcements list with filtering, sorting and pagination.
   */
  async getAnnouncements(filter: AnnouncementFilter): Promise<AnnouncementListResult> {
    try {
      const params: Record<string, string | number | undefined> = {
        page: filter.page || 1,
        pageSize: filter.pageSize || 9,
      };

      if (filter.searchQuery?.trim()) {
        params.q = filter.searchQuery.trim();
        params.search = filter.searchQuery.trim();
      }
      if (filter.category && filter.category !== "all") {
        params.category = filter.category;
      }
      if (filter.department && filter.department !== "all") {
        params.department = filter.department;
      }
      if (filter.priority && filter.priority !== "all") {
        params.priority = filter.priority;
      }
      if (filter.readStatus && filter.readStatus !== "all") {
        params.readStatus = filter.readStatus;
      }
      if (filter.sortBy) {
        params.sortBy = filter.sortBy;
      }

      const response = await httpClient.get<ApiResponse<AnnouncementListResult>>(
        "/notification/announcements/",
        { params }
      );

      if (response.data?.data) {
        return response.data.data;
      }

      throw new Error("Không có dữ liệu thông báo trả về từ máy chủ.");
    } catch {
      // Fallback to local mock data if backend request fails
      return this.mockGetAnnouncements(filter);
    }
  }

  /**
   * Fetch detailed announcement by ID.
   */
  async getAnnouncementById(id: string): Promise<AnnouncementItem | null> {
    try {
      const response = await httpClient.get<ApiResponse<AnnouncementItem>>(
        `/notification/announcements/${id}/`
      );
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return mockAnnouncements.find((item) => item.id === id) || null;
    }
  }

  /**
   * Fetch statistical breakdown and counters for announcements.
   */
  async getSummary(): Promise<AnnouncementSummary> {
    try {
      const response = await httpClient.get<ApiResponse<AnnouncementSummary>>(
        "/notification/announcements/summary/"
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error("Không thể tải thống kê thông báo");
    } catch {
      const total = mockAnnouncements.length;
      const unreadCount = mockAnnouncements.filter((i) => !i.isRead).length;
      const urgentCount = mockAnnouncements.filter((i) => i.priority === "urgent").length;
      const academicCount = mockAnnouncements.filter((i) => i.category === "academic").length;
      const examCount = mockAnnouncements.filter((i) => i.category === "exam").length;
      const activityCount = mockAnnouncements.filter((i) => i.category === "activity").length;

      return {
        total,
        unreadCount,
        urgentCount,
        academicCount,
        examCount,
        activityCount,
      };
    }
  }

  /**
   * Fetch unread notifications count for header navigation badge.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await httpClient.get<ApiResponse<{ unreadCount: number }>>(
        "/notification/announcements/unread-count/"
      );
      return response.data?.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Mark a specific announcement as read.
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await httpClient.post<ApiResponse<{ success: boolean }>>(
        `/notification/announcements/${id}/read/`
      );
      return !!response.data?.success;
    } catch {
      const item = mockAnnouncements.find((i) => i.id === id);
      if (item) item.isRead = true;
      return true;
    }
  }

  /**
   * Mark multiple announcements as read.
   */
  async markMultipleAsRead(ids: string[]): Promise<boolean> {
    try {
      await Promise.all(
        ids.map((id) =>
          httpClient.post<ApiResponse<{ success: boolean }>>(
            `/notification/announcements/${id}/read/`
          )
        )
      );
      return true;
    } catch {
      ids.forEach((id) => {
        const item = mockAnnouncements.find((i) => i.id === id);
        if (item) item.isRead = true;
      });
      return true;
    }
  }

  /**
   * Mark multiple announcements as unread (client-side state simulation).
   */
  async markMultipleAsUnread(ids: string[]): Promise<boolean> {
    ids.forEach((id) => {
      const item = mockAnnouncements.find((i) => i.id === id);
      if (item) item.isRead = false;
    });
    return true;
  }

  /**
   * Mark all eligible announcements as read for the current user.
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await httpClient.post<ApiResponse<{ success: boolean; markedCount: number }>>(
        "/notification/announcements/read-all/"
      );
      return !!response.data?.success;
    } catch {
      mockAnnouncements.forEach((i) => {
        i.isRead = true;
      });
      return true;
    }
  }

  /**
   * Get dynamic list of announcement categories for current school.
   */
  async getCategories(): Promise<AnnouncementCategoryOption[]> {
    try {
      const response = await httpClient.get<ApiResponse<AnnouncementCategoryOption[]>>(
        "/notification/announcements/categories/"
      );
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error("Không có dữ liệu chuyên mục trả về.");
    } catch {
      // Mock fallback: distinct categories from mockAnnouncements
      const catCountMap = new Map<string, number>();
      mockAnnouncements.forEach((item) => {
        catCountMap.set(item.category, (catCountMap.get(item.category) ?? 0) + 1);
      });

      const labelMap: Record<string, string> = {
        exam: "Khảo thí & Lịch thi",
        academic: "Đào tạo & Học vụ",
        tuition: "Học phí & Khoản thu",
        activity: "Đoàn trường & Ngoại khóa",
        homeroom: "Lớp & Giáo viên chủ nhiệm",
        general: "Thông báo chung",
      };

      return Array.from(catCountMap.entries()).map(([cat, count]) => ({
        value: cat,
        label: labelMap[cat] ?? cat.toUpperCase(),
        count,
      }));
    }
  }

  /**
   * Get list of issuing school departments.
   */
  async getDepartments(): Promise<string[]> {
    try {
      const response = await httpClient.get<ApiResponse<string[]>>(
        "/notification/announcements/departments/"
      );
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      throw new Error("Không có dữ liệu phòng ban trả về.");
    } catch {
      return [
        "Ban Giám Hiệu",
        "Phòng Đào Tạo",
        "Đoàn Thanh Niên",
        "Phòng Tài Vụ",
        "Ban Giám Thị",
        "Phòng Công Tác Học Sinh",
        "Tổ Thể Dục - Giáo Dục Quốc Phòng",
      ];
    }
  }

  /**
   * Fallback mock retrieval
   */
  private mockGetAnnouncements(filter: AnnouncementFilter): AnnouncementListResult {
    let result = [...mockAnnouncements];

    if (filter.searchQuery?.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      );
    }

    if (filter.category && filter.category !== "all") {
      result = result.filter((item) => item.category === filter.category);
    }
    if (filter.department && filter.department !== "all") {
      result = result.filter((item) => item.department === filter.department);
    }
    if (filter.readStatus === "unread") {
      result = result.filter((item) => !item.isRead);
    } else if (filter.readStatus === "read") {
      result = result.filter((item) => item.isRead);
    }
    if (filter.priority && filter.priority !== "all") {
      result = result.filter((item) => item.priority === filter.priority);
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    const total = result.length;
    const page = Math.max(1, filter.page || 1);
    const pageSize = Math.max(1, filter.pageSize || 9);
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = result.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}

export const announcementService = new AnnouncementService();
