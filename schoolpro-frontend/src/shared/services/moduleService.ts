import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type { IconName } from "@/components/ui/Icon/types";

export interface UserModuleItem {
  id: string;
  moduleId?: string;
  code: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  icon: IconName;
  route: string;
  category: string;
  color?: string | null;
  badgeText?: string | null;
  isPinned?: boolean;
  orderNo?: number;
}

export interface BackendModuleCard {
  id: string;
  module_id: string;
  code: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
  icon: string;
  route: string;
  module_type: string;
  category: string;
  default_color?: string | null;
  default_badge?: string | null;
  badge_text?: string | null;
  is_pinned: boolean;
  is_hidden: boolean;
  order_no: number;
  config?: Record<string, unknown> | null;
}

const VALID_ICONS: Record<string, IconName> = {
  home: "home",
  calendar: "calendar",
  check: "check",
  chart: "chart",
  edit: "edit",
  file: "file",
  "file-text": "file-text",
  download: "download",
  info: "info",
  book: "book",
  settings: "settings",
  user: "user",
  clock: "clock",
  search: "search",
  filter: "filter",
  video: "video",
  image: "image",
  paperclip: "paperclip",
  upload: "upload",
  copy: "copy",
  delete: "delete",
  refresh: "refresh",
  dashboard: "chart",
  survey: "edit",
  exam: "file",
  gradebook: "chart",
  timetable: "calendar",
  attendance: "check",
  materials: "download",
  announcement: "info",
  notification: "info",
};

const sanitizeIcon = (rawIcon?: string | null): IconName => {
  if (!rawIcon) return "file";
  const normalized = rawIcon.toLowerCase().trim();
  return VALID_ICONS[normalized] || "file";
};

const FALLBACK_STUDENT_MODULES: UserModuleItem[] = [
  {
    id: "mod-home",
    code: "home",
    name: "Trang chủ",
    icon: "home",
    route: "/student/home",
    category: "general",
  },
  {
    id: "mod-timetable",
    code: "academic_timetable",
    name: "Thời khóa biểu",
    icon: "calendar",
    route: "/student/timetable",
    category: "academic",
  },
  {
    id: "mod-attendance",
    code: "academic_attendance",
    name: "Điểm danh",
    icon: "check",
    route: "/student/attendance",
    category: "academic",
  },
  {
    id: "mod-gradebook",
    code: "academic_gradebook",
    name: "Bảng điểm",
    icon: "chart",
    route: "/student/gradebook",
    category: "academic",
  },
  {
    id: "mod-assignments",
    code: "academic_assignments",
    name: "Bài tập",
    icon: "edit",
    route: "/student/assignments",
    category: "academic",
  },
  {
    id: "mod-exams",
    code: "academic_exams",
    name: "Lịch thi",
    icon: "file",
    route: "/student/exams",
    category: "academic",
  },
  {
    id: "mod-materials",
    code: "academic_materials",
    name: "Tài liệu học tập",
    icon: "download",
    route: "/student/materials",
    category: "academic",
  },
  {
    id: "mod-notices",
    code: "notification_announcements",
    name: "Thông báo",
    icon: "info",
    route: "/student/notices",
    category: "notification",
  },
  {
    id: "mod-contact",
    code: "communication_contact_book",
    name: "Sổ liên lạc",
    icon: "book",
    route: "/student/contact-book",
    category: "communication",
  },
  {
    id: "mod-evaluations",
    code: "evaluation_surveys",
    name: "Khảo sát & Đánh giá",
    icon: "edit",
    route: "/student/evaluations",
    category: "evaluation",
  },
  {
    id: "mod-profile",
    code: "core_profile",
    name: "Hồ sơ cá nhân",
    icon: "user",
    route: "/student/profile",
    category: "system",
  },
  {
    id: "mod-settings",
    code: "system_settings",
    name: "Cài đặt hệ thống",
    icon: "settings",
    route: "/student/settings",
    category: "system",
  },
];

class ModuleService {
  /**
   * Fetches active user modules from backend API /system/modules/
   */
  async getUserModules(): Promise<UserModuleItem[]> {
    try {
      const response = await httpClient.get<ApiResponse<BackendModuleCard[]>>(
        "/system/modules/"
      );

      const cards = response.data?.data;
      if (!Array.isArray(cards) || cards.length === 0) {
        return FALLBACK_STUDENT_MODULES;
      }

      return cards
        .filter((card) => !card.is_hidden)
        .map((card) => {
          return {
            id: card.id || card.code,
            moduleId: card.module_id,
            code: card.code,
            name: card.name,
            shortName: card.short_name,
            description: card.description,
            icon: sanitizeIcon(card.icon),
            route: card.route || "/student/home",
            category: card.category || "general",
            color: card.default_color,
            badgeText: card.badge_text || card.default_badge || undefined,
            isPinned: card.is_pinned ?? false,
            orderNo: card.order_no ?? 0,
          };
        });
    } catch {
      // In case network or API is temporarily unavailable, gracefully fallback
      return FALLBACK_STUDENT_MODULES;
    }
  }
}

export const moduleService = new ModuleService();
