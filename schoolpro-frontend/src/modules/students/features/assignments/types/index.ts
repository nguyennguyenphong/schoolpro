export type AssignmentStatus = "pending" | "submitted" | "graded" | "overdue";
export type AssignmentType = "homework" | "quiz" | "project" | "essay";
export type AssignmentViewMode = "grid" | "list";

export interface AssignmentAttachment {
  name: string;
  size: string;
  url: string;
}

export interface AssignmentExtension {
  level: number;
  dueDate: string;
  reason?: string;
}

export interface AssignmentRubricCriterion {
  id: string;
  criterion: string;
  maxPoints: number;
  description?: string;
  earnedPoints?: number | null;
  comment?: string | null;
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
  id?: string;
  attemptNumber?: number;
  submissionStatus?: string;
  submittedAt: string;
  isLate?: boolean;
  lateMinutes?: number;
  penaltyDeduction?: number;
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
  approvedAt?: string | null;
}

export interface AssignmentEventLogItem {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  actorName?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AssignmentSubjectOption {
  code: string;
  name: string;
  count: number;
}

export interface AssignmentItem {
  id: string;
  code?: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  className?: string;
  teacherName: string;
  teacherEmail?: string;
  type: AssignmentType;
  format?: string;
  status: AssignmentStatus;
  dueDate: string; // YYYY-MM-DD HH:mm (Effective due date)
  originalDueDate?: string; // YYYY-MM-DD HH:mm
  isExtended?: boolean;
  extensions?: AssignmentExtension[];
  assignedDate: string; // YYYY-MM-DD
  description: string;
  pointsPossible: number;
  passScore?: number;
  weightPercent?: number;
  score?: number | null;
  rawScore?: number | null;
  penaltyDeduction?: number;
  teacherFeedback?: string | null;
  gradedAt?: string | null;
  gradedByName?: string | null;
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
  maxFilesCount?: number;
  fileNamingRule?: string | null;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number;
  allowResubmission?: boolean;
  maxResubmissionCount?: number;
  attachments?: AssignmentAttachment[];
  rubric?: AssignmentRubricCriterion[];
  solutionAttachments?: AssignmentAttachment[];
  submission?: AssignmentSubmission | null;
  reopenRequest?: ReopenRequest | null;
  eventLogs?: AssignmentEventLogItem[];
}

export interface AssignmentSummary {
  total: number;
  pendingCount: number;
  submittedCount: number;
  gradedCount: number;
  overdueCount: number;
  averageScore: number;
  className?: string | null;
  semesterName?: string | null;
  academicYear?: string | null;
  subjects?: AssignmentSubjectOption[];
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
