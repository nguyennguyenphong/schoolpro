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
  | "download";

export interface FeatureItem {
  id: string;
  translationKey:
    | "announcements"
    | "reminders"
    | "assignments"
    | "materials"
    | "evaluations"
    | "discussions"
    | "timetable"
    | "gradebook";
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
