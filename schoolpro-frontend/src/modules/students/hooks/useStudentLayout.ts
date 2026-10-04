import { useEffect } from "react";
import { useAuthStore } from "@/shared/store/useAuthStore";

export const useStudentLayout = () => {
  const {
    user,
    academicContext,
    profileContext,
    roleDetail,
    syncSession,
  } = useAuthStore();

  useEffect(() => {
    if (!academicContext || !profileContext) {
      syncSession();
    }
  }, [academicContext, profileContext, syncSession]);

  const studentName =
    user?.full_name ||
    user?.name ||
    "Học sinh";

  const studentCode =
    profileContext?.student_code ||
    user?.username ||
    "Chưa có mã HS";

  const studentClass = profileContext?.class_name
    ? `Lớp ${profileContext.class_name}`
    : profileContext?.class_code
      ? `Lớp ${profileContext.class_code}`
      : "Trường THPT SchoolPro";

  const studentRoleTag =
    roleDetail?.name === "Học sinh"
      ? "HS"
      : roleDetail?.name || "HS";

  const semesterText = academicContext?.semester
    ? academicContext.semester.includes("Học kỳ 1")
      ? "HK1"
      : academicContext.semester.includes("Học kỳ 2")
        ? "HK2"
        : academicContext.semester
    : "HK1";

  const academicYearText =
    academicContext?.academic_year
      ? academicContext.academic_year.replace("Năm học ", "")
      : "2026 - 2027";

  const currentWeekText =
    `Tuần ${academicContext?.current_week ?? 1}`;

  const academicBadgeString =
    `${semesterText} • ${academicYearText} • ${currentWeekText}`;

  return {
    user,
    studentName,
    studentCode,
    studentClass,
    studentRoleTag,
    academicBadgeString,
  };
};
