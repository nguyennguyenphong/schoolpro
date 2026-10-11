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
  iconBgColor?: string;
  iconColor?: string;
  route: string;
  category: string;
  color?: string | null;
  badgeText?: string | null;
  badgeColor?: string;
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
  leave: "file-text",
  send: "send",
};

const sanitizeIcon = (rawIcon?: string | null): IconName => {
  if (!rawIcon) return "file";
  const normalized = rawIcon.toLowerCase().trim();
  return VALID_ICONS[normalized] || "file";
};

export const resolveModuleColorStyles = (
  colorHex?: string | null,
  category?: string
): { bg: string; text: string; badge: string } => {
  if (colorHex) {
    const hex = colorHex.toUpperCase();
    const hexMap: Record<string, { bg: string; text: string; badge: string }> = {
      "#10B981": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-600", badge: "green" },
      "#06B6D4": { bg: "bg-cyan-50 border border-cyan-200", text: "text-cyan-600", badge: "cyan" },
      "#14B8A6": { bg: "bg-teal-50 border border-teal-200", text: "text-teal-600", badge: "cyan" },
      "#E11D48": { bg: "bg-rose-50 border border-rose-200", text: "text-rose-600", badge: "red" },
      "#F43F5E": { bg: "bg-red-50 border border-red-200", text: "text-red-500", badge: "red" },
      "#DB2777": { bg: "bg-pink-50 border border-pink-200", text: "text-pink-600", badge: "magenta" },
      "#7C3AED": { bg: "bg-violet-50 border border-violet-200", text: "text-violet-600", badge: "purple" },
      "#9333EA": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-600", badge: "purple" },
      "#6366F1": { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-600", badge: "blue" },
      "#3B82F6": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600", badge: "blue" },
      "#0284C7": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-600", badge: "geekblue" },
      "#0EA5E9": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-500", badge: "geekblue" },
      "#CA8A04": { bg: "bg-yellow-50 border border-yellow-200", text: "text-yellow-600", badge: "gold" },
      "#D97706": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-600", badge: "gold" },
      "#8B5CF6": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-500", badge: "purple" },
      "#0D9488": { bg: "bg-teal-50 border border-teal-200", text: "text-teal-700", badge: "cyan" },
      "#059669": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", badge: "green" },
      "#EA580C": { bg: "bg-orange-50 border border-orange-200", text: "text-orange-600", badge: "orange" },
      "#EAB308": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-500", badge: "gold" },
    };

    if (hexMap[hex]) {
      return hexMap[hex];
    }
  }

  switch (category?.toUpperCase()) {
    case "ACADEMIC":
      return { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600", badge: "blue" };
    case "EMULATION":
      return { bg: "bg-amber-50 border border-amber-200", text: "text-amber-600", badge: "gold" };
    case "COMMUNICATION":
      return { bg: "bg-sky-50 border border-sky-200", text: "text-sky-600", badge: "geekblue" };
    case "EVALUATION":
      return { bg: "bg-rose-50 border border-rose-200", text: "text-rose-600", badge: "red" };
    case "MANAGEMENT":
      return { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-600", badge: "green" };
    default:
      return { bg: "bg-slate-50 border border-[#f0f0f0]", text: "text-slate-600", badge: "default" };
  }
};

const FALLBACK_STUDENT_MODULES: UserModuleItem[] = [
  {
    id: "mod-home",
    code: "home",
    name: "Trang chủ",
    icon: "home",
    iconBgColor: "bg-blue-50 border border-blue-200",
    iconColor: "text-blue-600",
    route: "/student/home",
    category: "general",
    color: "#3B82F6",
    badgeColor: "blue",
  },
  {
    id: "mod-timetable",
    code: "academic_timetable",
    name: "Thời khóa biểu",
    icon: "calendar",
    iconBgColor: "bg-emerald-50 border border-emerald-200",
    iconColor: "text-emerald-600",
    route: "/student/timetable",
    category: "academic",
    color: "#10B981",
    badgeColor: "green",
  },
  {
    id: "mod-attendance",
    code: "academic_attendance",
    name: "Điểm danh",
    icon: "check",
    iconBgColor: "bg-cyan-50 border border-cyan-200",
    iconColor: "text-cyan-600",
    route: "/student/attendance",
    category: "academic",
    color: "#06B6D4",
    badgeColor: "cyan",
  },
  {
    id: "mod-gradebook",
    code: "academic_gradebook",
    name: "Bảng điểm",
    icon: "chart",
    iconBgColor: "bg-violet-50 border border-violet-200",
    iconColor: "text-violet-600",
    route: "/student/gradebook",
    category: "academic",
    color: "#7C3AED",
    badgeColor: "purple",
  },
  {
    id: "mod-assignments",
    code: "academic_assignments",
    name: "Bài tập",
    icon: "edit",
    iconBgColor: "bg-rose-50 border border-rose-200",
    iconColor: "text-rose-600",
    route: "/student/assignments",
    category: "academic",
    color: "#E11D48",
    badgeColor: "red",
  },
  {
    id: "mod-exams",
    code: "academic_exams",
    name: "Lịch thi",
    icon: "file",
    iconBgColor: "bg-pink-50 border border-pink-200",
    iconColor: "text-pink-600",
    route: "/student/exams",
    category: "academic",
    color: "#DB2777",
    badgeColor: "magenta",
  },
  {
    id: "mod-materials",
    code: "academic_materials",
    name: "Tài liệu học tập",
    icon: "download",
    iconBgColor: "bg-purple-50 border border-purple-200",
    iconColor: "text-purple-600",
    route: "/student/materials",
    category: "academic",
    color: "#9333EA",
    badgeColor: "purple",
  },
  {
    id: "mod-notices",
    code: "notification_announcements",
    name: "Thông báo",
    icon: "info",
    iconBgColor: "bg-sky-50 border border-sky-200",
    iconColor: "text-sky-600",
    route: "/student/notices",
    category: "notification",
    color: "#0284C7",
    badgeColor: "geekblue",
  },
  {
    id: "mod-contact",
    code: "communication_contact_book",
    name: "Sổ liên lạc",
    icon: "book",
    iconBgColor: "bg-indigo-50 border border-indigo-200",
    iconColor: "text-indigo-600",
    route: "/student/contact-book",
    category: "communication",
    color: "#6366F1",
    badgeColor: "blue",
  },
  {
    id: "mod-evaluations",
    code: "evaluation_surveys",
    name: "Khảo sát & Đánh giá",
    icon: "edit",
    iconBgColor: "bg-orange-50 border border-orange-200",
    iconColor: "text-orange-600",
    route: "/student/evaluations",
    category: "evaluation",
    color: "#EA580C",
    badgeColor: "orange",
  },
  {
    id: "mod-profile",
    code: "core_profile",
    name: "Hồ sơ cá nhân",
    icon: "user",
    iconBgColor: "bg-slate-100 border border-slate-200",
    iconColor: "text-slate-700",
    route: "/student/profile",
    category: "system",
    color: "#64748B",
    badgeColor: "default",
  },
  {
    id: "mod-settings",
    code: "system_settings",
    name: "Cài đặt hệ thống",
    icon: "settings",
    iconBgColor: "bg-slate-100 border border-slate-200",
    iconColor: "text-slate-700",
    route: "/student/settings",
    category: "system",
    color: "#64748B",
    badgeColor: "default",
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
          const { bg, text, badge } = resolveModuleColorStyles(
            card.default_color,
            card.category
          );

          return {
            id: card.id || card.code,
            moduleId: card.module_id,
            code: card.code,
            name: card.name,
            shortName: card.short_name,
            description: card.description,
            icon: sanitizeIcon(card.icon),
            iconBgColor: bg,
            iconColor: text,
            route: card.route || "/student/home",
            category: card.category || "general",
            color: card.default_color,
            badgeText: card.badge_text || card.default_badge || undefined,
            badgeColor: badge,
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
