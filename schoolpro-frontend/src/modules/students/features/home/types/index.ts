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
    | "schedule360"
    | "gradebook360";
  iconName: FeatureIconName;
  iconBgColor: string;
  iconColor: string;
  badgeKey?: string;
  badgeCount?: number;
  badgeColor?: "blue" | "green" | "gold" | "red" | "purple" | "cyan";
  route?: string;
}

export interface ClassScheduleItem {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  timeRange: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  instructorName: string;
  instructorEmail?: string;
  status: "upcoming" | "ongoing" | "completed";
  onlineMeetingUrl?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  dueDate: string;
  dueDaysLeft: number;
  priority: "critical" | "urgent" | "normal";
  isSubmitted: boolean;
  maxScore: number;
}

export interface UpcomingExamItem {
  id: string;
  courseCode: string;
  courseName: string;
  examDate: string;
  examTime: string;
  room: string;
  building: string;
  seatNumber: string;
  format: "essay" | "multiple_choice" | "practice";
}

export interface AcademicNoticeItem {
  id: string;
  title: string;
  summary: string;
  publishDate: string;
  department: string;
  isImportant: boolean;
  category: "registration" | "exam" | "scholarship" | "finance" | "activity" | "general";
}

export interface HomeData {
  profile: StudentProfile;
  features: FeatureItem[];
  todaySchedule: ClassScheduleItem[];
  urgentAssignments: AssignmentItem[];
  upcomingExams: UpcomingExamItem[];
  notices: AcademicNoticeItem[];
}

// Backward compatibility alias
export type DashboardData = HomeData;
