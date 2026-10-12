export type SubjectAttendanceStatus =
  | "open"
  | "present"
  | "upcoming"
  | "absent"
  | "excused";

export type AttendanceStatusFilter =
  | "all"
  | "open"
  | "present"
  | "upcoming"
  | "excused"
  | "absent";

export type AttendanceShiftFilter =
  | "all"
  | "morning"
  | "afternoon"
  | "evening";

export type AttendanceMethod = "qr_scan" | "qr_upload" | "code";

export type AttendanceViewMode = "grid" | "list";

export interface AttendanceFilter {
  selectedDate: string;
  shift: AttendanceShiftFilter;
  status: AttendanceStatusFilter;
  searchQuery: string;
  viewMode: AttendanceViewMode;
}

export interface DailyAttendanceQueryParams {
  date: string;
  shift?: AttendanceShiftFilter;
  status?: AttendanceStatusFilter;
  search?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId?: string | null;
  timetableId?: string;
  attendanceId?: string | null;
  date: string; // YYYY-MM-DD
  subjectId?: string;
  subjectCode: string; // e.g. "MATH11"
  subjectName: string; // e.g. "Toán học 11 - Giải tích & Đại số"
  classId?: string;
  className?: string;
  teacherId?: string;
  teacherName: string; // e.g. "Thạc sĩ Hoàng Văn Nam"
  teacherEmail?: string;
  teacherAvatar?: string;
  room: string; // e.g. "Phòng A203"
  building?: string;
  campus?: string;
  timeSlot: string; // e.g. "07:30 - 09:00"
  startTime?: string;
  endTime?: string;
  period: string; // e.g. "Tiết 1 - 2"
  periodNumber?: number;
  shift?: "morning" | "afternoon" | "evening";
  classType?: "theory" | "practice";
  lessonTopic?: string;
  status: SubjectAttendanceStatus;
  /** 6-digit numeric PIN code created by teacher */
  attendanceCode: string;
  /** Cryptographic QR token for QR camera scan / QR image upload */
  qrToken: string;
  /** ISO timestamp when teacher opened the session */
  openedAt?: string | null;
  /** ISO timestamp when the 6-digit PIN & QR code strictly expire */
  expiresAt?: string | null;
  /** Formatted HH:mm:ss deadline */
  deadlineTime?: string;
  /** Remaining seconds before session expires */
  remainingSeconds?: number;
  /** Total duration in seconds configured by teacher */
  durationSeconds?: number;
  /** Teacher scanning device GPS Latitude */
  teacherLatitude: number;
  /** Teacher scanning device GPS Longitude */
  teacherLongitude: number;
  /** Allowed scan radius in meters configured by teacher */
  allowedRadiusMeters: number;
  /** Student check-in time (HH:mm:ss) */
  checkInTime?: string;
  /** Method used by student to check in */
  checkInMethod?: AttendanceMethod;
  /** Student GPS Latitude captured at check-in */
  studentLatitude?: number | null;
  /** Student GPS Longitude captured at check-in */
  studentLongitude?: number | null;
  /** Calculated Haversine distance in meters between student and teacher device */
  distanceMeters?: number | null;
  /** Whether student was within allowedRadiusMeters */
  isWithinRadius?: boolean;
  /** Browser/Device GPS accuracy in meters */
  gpsAccuracyMeters?: number | null;
  /** Linked Leave Request ID when student has an approved/pending leave request */
  leaveRequestId?: string | null;
  /** Linked Leave Request Code (e.g. "LR-20260929-001") */
  leaveRequestCode?: string | null;
  /** Note from teacher or system */
  note?: string;
}

export interface AttendanceSummary {
  totalToday: number;
  attendedToday: number;
  openToday?: number;
  upcomingToday?: number;
  pendingToday: number;
  absentToday: number;
  excusedToday?: number;
  overallRate: number;
  disciplineScore: number;
  className?: string;
  semesterName?: string;
  academicYear?: string;
}

export interface CheckInPayload {
  recordId: string;
  method: AttendanceMethod;
  code?: string;
  qrData?: string;
  imageName?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
  distanceMeters?: number;
  allowedRadiusMeters?: number;
}

export interface OpenAttendanceSessionPayload {
  recordId: string;
  timetableId?: string;
  sessionId?: string | null;
  date: string;
  pinCode?: string;
  allowedRadiusMeters: number;
  durationSeconds: number;
  teacherLatitude: number;
  teacherLongitude: number;
  note?: string;
}

export type AttendanceRealtimeEventType =
  | "ATTENDANCE_SESSION_OPENED"
  | "ATTENDANCE_SESSION_UPDATED"
  | "ATTENDANCE_SESSION_EXPIRED"
  | "ATTENDANCE_CODE_REGENERATED"
  | "STUDENT_CHECKED_IN";

export interface AttendanceRealtimePayload {
  type?: string;
  eventType: AttendanceRealtimeEventType;
  sessionId?: string | null;
  timetableId?: string | null;
  attendanceId?: string | null;
  studentId?: string | null;
  classId?: string | null;
  sessionDate?: string | null;
  status?: string | null;
  pinCode?: string | null;
  qrToken?: string | null;
  allowedRadiusMeters?: number | null;
  teacherLatitude?: number | null;
  teacherLongitude?: number | null;
  expiresAt?: string | null;
  message?: string;
  actorName?: string;
  timestamp: string;
  record?: AttendanceRecord | null;
  session?: Record<string, unknown> | null;
}

export interface AttendanceRealtimeSyncSnapshot {
  syncVersion: string;
  activeSessionsCount: number;
  expiredNowCount: number;
  latestSessionUpdate: string | null;
  latestAttendanceUpdate: string | null;
  serverTime: string;
}

export type GpsSimulationPresetId =
  | "in_classroom"
  | "near_corridor"
  | "outside_school"
  | "browser_gps"
  | "custom";

export interface GpsCoordinateState {
  presetId: GpsSimulationPresetId;
  latitude: number;
  longitude: number;
  accuracy: number;
  locating: boolean;
  error?: string | null;
}
