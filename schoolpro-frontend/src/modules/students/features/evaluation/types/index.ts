export type SurveyCategory =
  | "teaching_quality"
  | "conduct_self"
  | "facilities"
  | "school_activities"
  | "general_feedback";

export type SurveyStatus = "pending" | "completed" | "expired";

export type QuestionType =
  | "checkbox"
  | "radio"
  | "input"
  | "rating"
  | "single_choice"
  | "multiple_choice"
  | "text";

export interface QuestionItem {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // Cho single_choice, multiple_choice
  ratingMax?: number; // 5 sao
}

export interface SurveyItem {
  id: string;
  code: string;
  title: string;
  category: SurveyCategory;
  categoryName: string;
  description: string;
  targetSubject?: string; // vd: "Toán học 11 - ThS. Hoàng Văn Nam"
  targetTeacher?: string;
  semester: string; // "HK1" | "HK2" | "all"
  academicYear: string; // "2025-2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isAnonymous: boolean; // Khảo sát ẩn danh
  estimatedMinutes: number; // 5 phút
  totalQuestions: number;
  status: SurveyStatus;
  completedAt?: string; // YYYY-MM-DD HH:mm
  questions: QuestionItem[];
}

export interface EvaluationSummary {
  total: number;
  pendingCount: number;
  completedCount: number;
  expiredCount: number;
  completionRate: number; // 75%
}

export interface SurveySubmission {
  surveyId: string;
  answers: Record<string, number | string | string[]>;
  submittedAt: string;
}
