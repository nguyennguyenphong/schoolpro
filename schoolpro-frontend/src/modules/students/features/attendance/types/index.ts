export type SubjectAttendanceStatus = "open" | "present" | "upcoming" | "absent" | "excused";

export type AttendanceMethod = "qr_scan" | "qr_upload" | "code";

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  subjectCode: string; // vd: "MATH11"
  subjectName: string; // vd: "Toán học 11 - Giải tích & Đại số"
  teacherName: string; // vd: "ThS. Hoàng Văn Nam"
  teacherAvatar?: string;
  room: string; // vd: "Phòng A203"
  timeSlot: string; // vd: "07:30 - 09:10"
  period: string; // vd: "Tiết 1 - 2"
  status: SubjectAttendanceStatus;
  attendanceCode: string; // Mã số bí mật giáo viên tạo vd: "849201"
  qrToken: string; // Mã QR token định danh phiên học
  checkInTime?: string; // HH:mm đã điểm danh vd: "07:34"
  checkInMethod?: AttendanceMethod; // Hình thức điểm danh đã dùng
  deadlineTime?: string; // Hạn cuối điểm danh vd: "07:45"
  note?: string; // Ghi chú từ giáo viên hoặc hệ thống
}

export interface AttendanceSummary {
  totalToday: number;
  attendedToday: number;
  pendingToday: number;
  absentToday: number;
  overallRate: number; // Tỷ lệ chuyên cần chung (vd: 98.5%)
  disciplineScore: number; // Điểm rèn luyện chuyên cần (vd: 95/100)
}

export interface CheckInPayload {
  recordId: string;
  method: AttendanceMethod;
  code?: string;
  qrData?: string;
  imageName?: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
}
