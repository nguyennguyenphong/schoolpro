export type ExamQuestionType =
  | "radio"
  | "checkbox"
  | "input"
  | "textarea"
  | "select"
  | "rating"
  | "boolean"
  | "date"
  | "single_choice"
  | "multiple_choice"
  | "text";

export type ExamStatus = "pending" | "completed" | "expired";

export type ScoreReleaseMode = "immediate" | "hidden" | "scheduled";

export interface ExamSetting {
  scoreReleaseMode?: ScoreReleaseMode;
  scoreReleaseDate?: string;
  allowReview?: boolean;
}

export interface ExamQuestion {
  id: string;
  title: string;
  description?: string;
  type: ExamQuestionType;
  required: boolean;
  points?: number; // Điểm số từng câu (VD: 0.5 điểm, 1.0 điểm, 2.0 điểm...)
  options?: string[]; // Cho radio, checkbox, select
  correctAnswer?: string | string[] | number | boolean; // Đáp án đúng hệ thống
  explanation?: string; // Lời giải và giải thích chi tiết
  ratingMax?: number; // Cho rating/thang đo (mặc định 5 sao)
  placeholder?: string; // Gợi ý nhập cho input, textarea
  sectionName?: string; // Phân chia nhóm/phần thi (VD: Phần 1: Lý thuyết cơ bản)
}

export type ExamFormat = "essay" | "multiple_choice" | "mixed" | string;

export interface ExamItem {
  id: string;
  code: string;
  title: string;
  courseCode: string;
  courseName: string;
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  format?: ExamFormat;
  teacherName?: string;
  semester: string;
  academicYear: string;
  durationMinutes: number; // Thời gian làm bài (phút)
  totalQuestions: number;
  maxScore: number;
  passingScore?: number;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  score?: number;
  completedAt?: string;
  questions: ExamQuestion[];
  scoreReleaseMode?: ScoreReleaseMode;
  scoreReleaseDate?: string;
  settings?: ExamSetting;
}

export interface ExamSummary {
  total: number;
  pendingCount: number;
  completedCount: number;
  expiredCount: number;
  averageScore: number;
}

export interface ExamQuestionResult {
  questionId: string;
  isCorrect: boolean | null;
  awardedScore: number;
  maxPoints: number;
  studentAnswer?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
}

export interface ExamSubmission {
  submissionId?: string;
  examId: string;
  answers: Record<string, number | string | string[] | boolean>;
  score: number;
  maxScore?: number;
  isPassed?: boolean;
  submittedAt: string;
  durationSeconds?: number;
  breakdown?: ExamQuestionResult[];
  message?: string;
}

export interface ExamFilter {
  status: "all" | "pending" | "completed" | "expired";
  subject: string;
  format: "all" | "essay" | "multiple_choice" | "mixed" | string;
  sortBy: "newest" | "upcoming" | "score" | string;
  searchQuery: string;
  page: number;
  pageSize: number;
}

export interface ExamListResult {
  items: ExamItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
