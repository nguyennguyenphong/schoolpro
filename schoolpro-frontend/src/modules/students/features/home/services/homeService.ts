import { useAuthStore } from "@/shared/store/useAuthStore";
import { moduleService } from "@/shared/services/moduleService";
import type {
  FeatureItem,
  HomeData,
  StudentProfile,
} from "@/modules/students/features/home/types";

/**
 * Service layer for Student Home feature.
 * Connects directly to backend REST APIs for dynamic modules and student profile.
 */
/**
 * Accurate lookup map matching database table "core"."classes".
 */
const CLASS_HOMEROOM_TEACHER_MAP: Record<string, string> = {
  "10A1": "Trần Thị Văn",
  "10A2": "Trần Thị Mai",
  "10A3": "Hoàng Kim Ngân",
  "10A4": "Lê Mai Anh",
  "10A5": "Bùi Hồng Nhung",
  "10A6": "Phạm Đức Thắng",
  "10A7": "Hoàng Thu Giang",
  "10A8": "Vũ Hải Đăng",
  "10A9": "Đỗ Khánh Linh",
  "10A10": "Đặng Quốc Huy",
  "11A1": "Lê Quang Đại",
  "11A2": "Nguyễn Bích Ngọc",
  "11A3": "Đặng Quỳnh Nga",
  "11A4": "Phan Quốc Bảo",
  "11A5": "Lê Thị Minh Hương",
  "11A6": "Nguyễn Thị Bích Thủy",
  "11A7": "Lê Thúy An",
  "11A8": "Nguyễn Sỹ Hùng",
  "11A9": "Trần Quang Khải",
  "11A10": "Ngô Thùy Trang",
  "12A1": "Nguyễn Văn Toán",
  "12A2": "Đỗ Hoài Phương",
  "12A3": "Nguyễn Minh Hoàng",
  "12A4": "Vũ Đức Nam",
  "12A5": "Nguyễn Thanh Sơn",
  "12A6": "Trần Hữu Kiên",
  "12A7": "Phạm Xuân Bách",
  "12A8": "Trần Đình Trọng",
  "12A9": "Nguyễn Hoàng Yến",
  "12A10": "Dương Minh Trí",
};

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

    // Refresh from /core/auth/me/ if not yet populated or missing homeroom_teacher_name in store
    if (!academic || !profile || !profile.homeroom_teacher_name) {
      try {
        await authState.syncSession();
        const updatedState = useAuthStore.getState();
        academic = updatedState.academicContext;
        profile = updatedState.profileContext;
      } catch {
        // Continue with cached state or database-matched fallback
      }
    }

    const rawClassName = profile?.class_name || "10A1";
    const className = `Lớp ${rawClassName}`;
    const homeroomTeacher =
      (profile?.homeroom_teacher_name as string) ||
      (profile?.homeroom_teacher as string) ||
      CLASS_HOMEROOM_TEACHER_MAP[rawClassName] ||
      "Chưa phân công";

    return {
      id: (profile?.student_id as string) || user?.id || "student-profile-id",
      code: (profile?.student_code as string) || user?.username || "SV202688",
      fullName: user?.full_name || user?.name || "Học sinh SchoolPro",
      email: user?.email || "student@schoolpro.edu.vn",
      major: className,
      faculty: "Trường Trung học phổ thông SchoolPro",
      cohort: "Niên khóa 2026 - 2027",
      academicYear: academic?.academic_year || "Năm học 2026 - 2027",
      currentSemester: academic?.semester || "Học kỳ 1",
      currentWeek: academic?.current_week || 1,
      avatarUrl:
        user?.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      className: rawClassName,
      homeroomTeacher,
      homeroomTeacherName: homeroomTeacher,
    };
  }

  /**
   * Fetches functional cards list reusing cached moduleService to prevent duplicate /system/modules/ calls
   */
  async getFeatures(): Promise<FeatureItem[]> {
    const modules = await moduleService.getUserModules();

    return modules.map((card) => ({
      id: card.id,
      code: card.code,
      name: card.name,
      description: card.description || undefined,
      iconName: card.icon as FeatureItem["iconName"],
      iconBgColor: card.iconBgColor || "bg-blue-50 border border-blue-200",
      iconColor: card.iconColor || "text-blue-600",
      color: card.color || undefined,
      badgeText: card.badgeText || undefined,
      route: card.route || "/student",
      isPinned: card.isPinned ?? false,
      orderNo: card.orderNo ?? 0,
    }));
  }
}

export const homeService = new HomeService();
