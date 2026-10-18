export type ClassShift = "morning" | "afternoon" | "evening";

export type ClassType = "theory" | "practice" | "seminar" | "exam";

export type ClassStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "not_yet";

export interface TimetableSlot {
  id: string;
  courseCode: string;
  courseName: string;
  classCode: string;
  className?: string;
  credits: number;
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7 | 8; // 2 = Monday, ..., 8 = Sunday
  date: string; // "YYYY-MM-DD"
  periods: string; // e.g. "Period 1 - 3"
  startTime: string; // "07:30"
  endTime: string; // "10:00"
  shift: ClassShift;
  room: string; // e.g. "Room 402"
  building: string; // e.g. "Building A"
  instructorName: string;
  instructorEmail: string;
  instructorPhone?: string;
  classType: ClassType;
  status: ClassStatus;
  attendanceStatus: AttendanceStatus;
  isOnLeave?: boolean;
  leaveStatus?: "approved" | "pending" | null;
  leaveSessionShift?: "all_day" | "morning" | "afternoon" | null;
  leaveType?: string | null;
  leaveReason?: string | null;
  leaveRequestCode?: string | null;
  onlineUrl?: string;
  lessonTopic?: string;
  notes?: string;
  colorTheme?: "blue" | "emerald" | "violet" | "amber" | "rose" | "indigo" | "cyan";
}

export type TimetableFilterMode = "date" | "week" | "month" | "year";

export interface TimetableFilter {
  selectedDate: string; // "YYYY-MM-DD"
  searchQuery?: string;
  filterMode?: TimetableFilterMode;
  courseCode?: string;
  shift?: "all" | ClassShift;
  classType?: "all" | ClassType;
  status?: "all" | ClassStatus;
}

export interface AcademicYearMeta {
  id: string | null;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SemesterMeta {
  id: string | null;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SelectedWeekMeta {
  startDate: string;
  endDate: string;
  selectedDate: string;
  isOutside: boolean;
  vacationReason?: string | null;
}

export interface TimetableMeta {
  academicYear?: AcademicYearMeta | null;
  semester?: SemesterMeta | null;
  selectedWeek?: SelectedWeekMeta | null;
}

export interface TimetableResponseData {
  slots: TimetableSlot[];
  meta?: TimetableMeta | null;
}

export interface TimetableSummary {
  totalSessions: number;
  totalCredits: number;
  totalTheorySessions: number;
  totalPracticeSessions: number;
  attendanceRate: number;
  upcomingSessions: number;
  ongoingSessions: number;
  completedSessions: number;
}
