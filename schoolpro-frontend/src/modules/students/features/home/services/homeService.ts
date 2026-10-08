import { httpClient } from "@/shared/api/httpClient";
import { useAuthStore } from "@/shared/store/useAuthStore";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  BackendDashboardCard,
  FeatureItem,
  HomeData,
  StudentProfile,
} from "@/modules/students/features/home/types";

/**
 * Service layer for Student Home feature.
 * Connects directly to backend REST APIs for dynamic modules and student profile.
 */
class HomeService {
  /**
   * Fetches full home page data for student (profile and dynamic functional cards)
   */
  async getHomeData(): Promise<HomeData> {
    const [profile, features] = await Promise.all([
      this.getProfile(),
      this.getFeatures(),
    ]);

    return {
      profile,
      features,
    };
  }

  // Backward compatibility method
  async getDashboardData(): Promise<HomeData> {
    return this.getHomeData();
  }

  /**
   * Resolves student profile from active user session or user profile service
   */
  async getProfile(): Promise<StudentProfile> {
    const authState = useAuthStore.getState();
    const user = authState.user;
    let academic = authState.academicContext;
    let profile = authState.profileContext;

    // Refresh from /core/auth/me/ if not yet populated in store
    if (!academic || !profile) {
      await authState.syncSession();
      const updatedState = useAuthStore.getState();
      academic = updatedState.academicContext;
      profile = updatedState.profileContext;
    }

    const className = profile?.class_name ? `Lớp ${profile.class_name}` : "Lớp 10A1";

    return {
      id: (profile?.student_id as string) || user?.id || "student-profile-id",
      code: (profile?.student_code as string) || user?.username || "SV202688",
      fullName: user?.full_name || user?.name || "Học sinh SchoolPro",
      email: user?.email || "student@schoolpro.edu.vn",
      major: className,
      faculty: "Trường THPT SchoolPro",
      cohort: "Niên khóa 2026 - 2027",
      academicYear: academic?.academic_year || "Năm học 2026 - 2027",
      currentSemester: academic?.semester || "Học kỳ 1",
      currentWeek: academic?.current_week || 1,
      avatarUrl:
        user?.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    };
  }

  /**
   * Fetches functional cards list from backend API endpoint /system/modules/
   */
  async getFeatures(): Promise<FeatureItem[]> {
    const response = await httpClient.get<ApiResponse<BackendDashboardCard[]>>(
      "/system/modules/"
    );

    const cards = response.data?.data || [];

    const resolveColorStyles = (colorHex?: string | null, category?: string) => {
      // 1. Prioritize module's dedicated default_color from DB
      if (colorHex) {
        const hex = colorHex.toUpperCase();
        const hexMap: Record<string, { bg: string; text: string }> = {
          "#10B981": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-600" },
          "#06B6D4": { bg: "bg-cyan-50 border border-cyan-200", text: "text-cyan-600" },
          "#14B8A6": { bg: "bg-teal-50 border border-teal-200", text: "text-teal-600" },
          "#E11D48": { bg: "bg-rose-50 border border-rose-200", text: "text-rose-600" },
          "#F43F5E": { bg: "bg-red-50 border border-red-200", text: "text-red-500" },
          "#DB2777": { bg: "bg-pink-50 border border-pink-200", text: "text-pink-600" },
          "#7C3AED": { bg: "bg-violet-50 border border-violet-200", text: "text-violet-600" },
          "#9333EA": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-600" },
          "#6366F1": { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-600" },
          "#3B82F6": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600" },
          "#0284C7": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-600" },
          "#0EA5E9": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-500" },
          "#CA8A04": { bg: "bg-yellow-50 border border-yellow-200", text: "text-yellow-600" },
          "#D97706": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-600" },
          "#8B5CF6": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-500" },
          "#0D9488": { bg: "bg-teal-50 border border-teal-200", text: "text-teal-700" },
          "#059669": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700" },
          "#0F172A": { bg: "bg-slate-100 border border-slate-300", text: "text-slate-800" },
          "#64748B": { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600" },
          "#EA580C": { bg: "bg-orange-50 border border-orange-200", text: "text-orange-600" },
          "#EAB308": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-500" },
        };

        if (hexMap[hex]) {
          return hexMap[hex];
        }
      }

      // 2. Fallback to broad category styling
      switch (category?.toUpperCase()) {
        case "ACADEMIC":
          return { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600" };
        case "EMULATION":
          return { bg: "bg-amber-50 border border-amber-200", text: "text-amber-600" };
        case "COMMUNICATION":
          return { bg: "bg-sky-50 border border-sky-200", text: "text-sky-600" };
        case "EVALUATION":
          return { bg: "bg-rose-50 border border-rose-200", text: "text-rose-600" };
        case "MANAGEMENT":
          return { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-600" };
        default:
          return { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600" };
      }
    };

    return cards.map((card) => {
      const iconName = (card.icon || "info") as FeatureItem["iconName"];
      const { bg: iconBgColor, text: iconColor } = resolveColorStyles(
        card.default_color,
        card.category
      );
      const badgeText = card.badge_text || card.default_badge || undefined;

      return {
        id: card.id || card.code,
        code: card.code,
        name: card.name,
        description: card.description || undefined,
        iconName,
        iconBgColor,
        iconColor,
        color: card.default_color || undefined,
        badgeText,
        route: card.route || "/student",
        isPinned: card.is_pinned ?? false,
        orderNo: card.order_no ?? 0,
      };
    });
  }
}

export const homeService = new HomeService();
