import { useEffect } from "react";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useNotificationStore } from "@/shared/store/useNotificationStore";
import { useLogout } from "@/hooks/useLogout";
import { useUserModules } from "@/hooks/useUserModules";
import { getRoleHomeRoute, normalizeRoleSlug } from "@/shared/utils/roleRoutes";

/**
 * Universal layout state & metadata hook.
 * Dynamically resolves identity, academic context, unread notifications,
 * dynamic modules navigation, and routes across all organizational roles.
 */
export const useMainLayout = () => {
  const {
    user,
    role,
    roleDetail,
    academicContext,
    profileContext,
    syncSession,
  } = useAuthStore();

  const { logout } = useLogout();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  const {
    modules,
    loading: loadingModules,
    error: modulesError,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    refetch: refetchModules,
  } = useUserModules();

  useEffect(() => {
    if (!academicContext || !profileContext) {
      syncSession();
    }
  }, [academicContext, profileContext, syncSession]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const roleSlug = normalizeRoleSlug(role);

  // User display name
  const displayName =
    user?.full_name ||
    user?.name ||
    (roleSlug === "student" ? "Học sinh" : "Người dùng");

  // Identification code (Student Code, Staff Code, or Username)
  const userCode =
    (profileContext?.student_code as string) ||
    (profileContext?.staff_code as string) ||
    user?.username ||
    "";

  // Sub-information description (Class for student, Department for staff, etc.)
  let subInfo = "Trường Trung học phổ thông SchoolPro";
  if (roleSlug === "student") {
    subInfo = profileContext?.class_name
      ? `Lớp ${profileContext.class_name}`
      : profileContext?.class_code
        ? `Lớp ${profileContext.class_code}`
        : "Trường Trung học phổ thông SchoolPro";
  } else if (profileContext?.department_name) {
    subInfo = String(profileContext.department_name);
  } else if (roleDetail?.name) {
    subInfo = roleDetail.name;
  }

  // Short role tag abbreviation for badge
  const roleTag =
    roleDetail?.name ||
    (roleSlug === "student"
      ? "Học sinh"
      : roleSlug === "teacher"
        ? "Giáo viên"
        : roleSlug === "staff"
          ? "CB"
          : roleSlug === "admin"
            ? "QTV"
            : roleSlug === "principal"
              ? "BGH"
              : roleSlug === "parent"
                ? "PH"
                : roleSlug === "supervisor"
                  ? "GS"
                  : "USER");

  // Academic Semester & Year String
  const semesterText = academicContext?.semester
    ? academicContext.semester.includes("Học kỳ 1")
      ? "HK1"
      : academicContext.semester.includes("Học kỳ 2")
        ? "HK2"
        : academicContext.semester
    : "HK1";

  const academicYearText = academicContext?.academic_year
    ? academicContext.academic_year.replace("Năm học ", "")
    : "2026 - 2027";

  const currentWeekText = `Tuần ${academicContext?.current_week ?? 1}`;

  const academicBadgeString = `${semesterText} • ${academicYearText} • ${currentWeekText}`;

  // Default routes based on role
  const defaultHomeRoute = getRoleHomeRoute(role);
  const defaultNoticesRoute = roleSlug === "student" ? "/student/notices" : "/notifications";
  const defaultProfileRoute = roleSlug === "student" ? "/student/profile" : "/profile";
  const defaultChangePasswordRoute =
    roleSlug === "student" ? "/student/change-password" : "/change-password";
  const defaultSettingsRoute = roleSlug === "student" ? "/student/settings" : "/settings";

  return {
    user,
    role,
    roleSlug,
    roleDetail,
    displayName,
    userCode,
    subInfo,
    roleTag,
    academicBadgeString,
    unreadNotificationsCount: unreadCount,
    logout,
    // Modules navigation
    modules,
    loadingModules,
    modulesError,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    refetchModules,
    routes: {
      home: defaultHomeRoute,
      notices: defaultNoticesRoute,
      profile: defaultProfileRoute,
      changePassword: defaultChangePasswordRoute,
      settings: defaultSettingsRoute,
    },
  };
};
