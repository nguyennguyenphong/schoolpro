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
    const user = useAuthStore.getState().user;

    return {
      id: user?.id || "student-profile-id",
      code: user?.username || "SV202688",
      fullName: user?.full_name || user?.name || "Học sinh SchoolPro",
      email: user?.email || "student@schoolpro.edu.vn",
      major: "Kỹ thuật Phần mềm",
      faculty: "Khoa Công nghệ Thông tin",
      cohort: "Khóa 2023 - 2027",
      academicYear: "2026 - 2027",
      currentSemester: "Học kỳ 1",
      currentWeek: 4,
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

    return cards.map((card) => {
      const iconName = (card.icon_name || card.icon || "info") as FeatureItem["iconName"];
      const iconBgColor =
        card.icon_bg_color || "bg-blue-50 border border-blue-200";
      const iconColor = card.icon_color || "text-blue-600";

      return {
        id: card.id || card.code,
        code: card.code,
        name: card.name,
        description: card.description || undefined,
        translationKey: card.translation_key || undefined,
        iconName,
        iconBgColor,
        iconColor,
        badgeCount: card.badge_count ?? undefined,
        badgeColor: (card.badge_color as FeatureItem["badgeColor"]) || "blue",
        badgeText: card.badge_text ?? undefined,
        route: card.route || "/student",
        isPinned: card.is_pinned ?? false,
        orderNo: card.order_no ?? 0,
      };
    });
  }
}

export const homeService = new HomeService();
