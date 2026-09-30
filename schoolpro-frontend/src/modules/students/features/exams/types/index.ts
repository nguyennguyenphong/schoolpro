export type ExamQuestionType =
  | "radio"
  | "checkbox"
  | "input"
  | "rating"
  | "single_choice"
  | "multiple_choice"
  | "text";

export type ExamStatus = "pending" | "completed" | "expired";

export interface ExamQuestion {
  id: string;
  title: string;
  description?: string;
  type: ExamQuestionType;
  required: boolean;
  options?: string[]; // Cho radio, checkbox
  correctAnswer?: string | string[] | number; // Đáp án đúng hệ thống
  explanation?: string; // Giải thích chi tiết
  points?: number; // Điểm số câu hỏi (VD: 0.5 điểm hoặc 1 điểm)
  ratingMax?: number; // Cho rating (mặc định 5 sao)
  placeholder?: string; // Cho input
}

export interface ExamItem {
  id: string;
  code: string;
  title: string;
  courseCode: string;
  courseName: string;
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
}

export interface ExamSummary {
  total: number;
  pendingCount: number;
  completedCount: number;
  expiredCount: number;
  averageScore: number;
}

export interface ExamSubmission {
  examId: string;
  answers: Record<string, number | string | string[]>;
  score: number;
  submittedAt: string;
}

export interface ExamFilter {
  status: "all" | "pending" | "completed" | "expired";
  searchQuery: string;
  semester: string;
}
