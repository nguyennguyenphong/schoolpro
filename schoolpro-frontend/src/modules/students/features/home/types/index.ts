export interface StudentProfile {
  id: string;
  code: string;
  fullName: string;
  email: string;
  major: string;
  faculty: string;
  cohort: string;
  academicYear: string;
  currentSemester: string;
  currentWeek: number;
  avatarUrl: string;
}

export type FeatureIconName =
  | "info"
  | "check"
  | "edit"
  | "file"
  | "settings"
  | "user"
  | "book"
  | "download"
  | "calendar"
  | "clock"
  | "chart";

export interface FeatureItem {
  id: string;
  translationKey:
    | "announcements"
    | "reminders"
    | "timetable"
    | "assignments"
    | "exams"
    | "gradebook"
    | "materials"
    | "attendance"
    | "contactBook"
    | "emulation"
    | "fees"
    | "evaluations"
    | "discussions";
  iconName: FeatureIconName;
  iconBgColor: string;
  iconColor: string;
  badgeKey?: string;
  badgeCount?: number;
  badgeColor?: "blue" | "green" | "gold" | "red" | "purple" | "cyan";
  route?: string;
}

export interface HomeData {
  profile: StudentProfile;
  features: FeatureItem[];
}

// Backward compatibility alias
export type DashboardData = HomeData;
