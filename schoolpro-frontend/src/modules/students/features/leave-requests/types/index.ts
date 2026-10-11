export type LeaveType =
  | "sick"
  | "family_affair"
  | "bereavement"
  | "official_competition"
  | "other";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveSessionShift = "all_day" | "morning" | "afternoon";

export type LeaveRequestViewMode = "grid" | "list";

export interface LeaveRequestAttachment {
  id?: string;
  name: string;
  url?: string;
  size?: string;
  type?: string;
}

export interface LeaveAffectedLesson {
  lessonKey: string;
  timetableId: string;
  date: string;
  dayOfWeek: number;
  dayOfWeekLabel: string;
  periodNumber: number;
  periodName: string;
  shift: "morning" | "afternoon";
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  roomName?: string;
}

export interface LeaveNotifiedTeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subjects: string[];
  lessonCount: number;
  periodsSummary?: string[];
  role: "SUBJECT_TEACHER" | "HOMEROOM_TEACHER" | "HOMEROOM_AND_SUBJECT_TEACHER";
  canApprove: boolean;
  isHomeroomTeacher?: boolean;
  notificationStatus: string;
}

export interface LeaveAffectedLessonsLookupResult {
  className: string;
  homeroomTeacherName: string;
  homeroomTeacherEmail: string;
  approvalAuthority: "HOMEROOM_TEACHER_ONLY";
  activeDaysOfWeek?: number[];
  hasLessons?: boolean;
  affectedLessons: LeaveAffectedLesson[];
  notifiedTeachers: LeaveNotifiedTeacher[];
}

export interface LeaveRequestEventLogItem {
  id: string;
  eventType: string;
  title: string;
  description: string;
  actor: string;
  actorRole?: string;
  badgeText?: string;
  badgeColor?: string;
  recipientEmail?: string;
  emailSent?: boolean;
  createdAt: string;
}

export interface LeaveRequestItem {
  id: string;
  code: string;
  requestCode: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  className: string;
  leaveType: LeaveType;
  leaveTypeCode: string;
  status: LeaveStatus;
  statusCode: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  totalDays: number;
  sessionShift: LeaveSessionShift;
  reason: string;
  commitment?: string;
  supportingDocumentUrl?: string | null;
  attachments?: LeaveRequestAttachment[];
  affectedSubjects?: string[];
  affectedLessons?: LeaveAffectedLesson[];
  notifiedTeachers?: LeaveNotifiedTeacher[];
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  homeroomTeacherName?: string;
  homeroomTeacherEmail?: string;
  homeroomTeacherPhone?: string;
  teacherNote?: string;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  firstLessonStartAt?: string | null;
  approvalDeadline?: string | null;
  isAutoApproved?: boolean;
  eventLogs?: LeaveRequestEventLogItem[];
  cancelReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestSummary {
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  totalDaysOff: number;
  maxAllowedDays: number;
  className?: string | null;
  semesterName?: string | null;
  academicYear?: string | null;
  homeroomTeacherName?: string | null;
  homeroomTeacherEmail?: string | null;
  homeroomTeacherPhone?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelationship?: string | null;
}

export interface LeaveRequestFilter {
  status: string; // "all" | LeaveStatus
  leaveType: string; // "all" | LeaveType
  searchQuery: string;
  sortBy: string; // "newest" | "oldest" | "start_date"
  page: number;
  pageSize: number;
  viewMode: LeaveRequestViewMode;
}

export interface LeaveRequestListResult {
  items: LeaveRequestItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateLeaveRequestPayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  sessionShift: LeaveSessionShift;
  reason: string;
  commitment?: string;
  attachments?: LeaveRequestAttachment[];
  selectedLessonKeys?: string[];
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
}
