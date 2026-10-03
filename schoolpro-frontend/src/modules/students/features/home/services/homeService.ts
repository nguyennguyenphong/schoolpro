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
