import type { IconName } from "@/components/ui/Icon/types";

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

export type FeatureIconName = IconName | (string & {});

export interface BackendDashboardCard {
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

export interface FeatureItem {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  translationKey?: string;
  iconName: FeatureIconName;
  iconBgColor: string;
  iconColor: string;
  color?: string;
  badgeKey?: string;
  badgeCount?: number;
  badgeColor?: "blue" | "green" | "gold" | "red" | "purple" | "cyan" | string;
  badgeText?: string;
  route?: string;
  isPinned?: boolean;
  orderNo?: number;
}

export interface HomeData {
  profile: StudentProfile;
  features: FeatureItem[];
}

// Backward compatibility alias
export type DashboardData = HomeData;
