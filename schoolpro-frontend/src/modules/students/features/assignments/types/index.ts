export type AssignmentStatus = "pending" | "submitted" | "graded" | "overdue";
export type AssignmentType = "homework" | "quiz" | "project" | "essay";
export type AssignmentViewMode = "grid" | "list";

export interface AssignmentAttachment {
  name: string;
  size: string;
  url: string;
}

export type FileCategory =
  | "word"
  | "excel"
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "other";

export interface SubmittedFile {
  id: string;
  name: string;
  size: string;
  sizeBytes?: number;
  type: FileCategory;
  url?: string;
  uploadedAt?: string;
  previewUrl?: string;
}

export interface AssignmentSubmission {
  submittedAt: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  files?: SubmittedFile[];
}

export interface ReopenRequest {
  requestedAt: string;
  reason: string;
  teacherEmail: string;
  status: "pending" | "approved" | "rejected";
}

export interface AssignmentItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  teacherEmail?: string;
  type: AssignmentType;
  status: AssignmentStatus;
  dueDate: string; // YYYY-MM-DD HH:mm
  assignedDate: string; // YYYY-MM-DD
  description: string;
  pointsPossible: number; // Thang điểm (thường là 10)
  score?: number | null; // Điểm số đạt được (nếu đã chấm)
  teacherFeedback?: string | null; // Nhận xét của giáo viên
  attachments?: AssignmentAttachment[];
  submission?: AssignmentSubmission | null;
  reopenRequest?: ReopenRequest | null;
}

export interface AssignmentSummary {
  total: number;
  pendingCount: number; // Chưa nộp
  submittedCount: number; // Đã nộp, chờ chấm
  gradedCount: number; // Đã chấm điểm
  overdueCount: number; // Quá hạn
  averageScore: number; // Điểm trung bình bài tập
  className?: string | null;
  semesterName?: string | null;
  academicYear?: string | null;
}

export interface AssignmentFilter {
  subject: string; // "all" | subjectCode
  status: string; // "all" | AssignmentStatus
  type: string; // "all" | AssignmentType
  searchQuery: string;
  viewMode: AssignmentViewMode;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface AssignmentListResult {
  items: AssignmentItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
