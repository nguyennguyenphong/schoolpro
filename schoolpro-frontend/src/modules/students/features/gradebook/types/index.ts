export type EvaluationType = "score" | "feedback";

export type GradeLevel = "excellent" | "good" | "average" | "pass" | "fail";

export type GradeClassification = "all" | "excellent" | "good" | "average" | "feedback_only";

export type GradeViewMode = "table" | "grid";

export interface ScoreItem {
  id: string;
  name: string; // "Miệng 1", "15 phút số 1", "15 phút số 2", "Thực hành"
  score: number;
  date: string; // YYYY-MM-DD
  weight: number; // 1, 2, 3
  note?: string;
}

export interface SubjectGradeItem {
  id: string;
  code: string;
  name: string;
  teacher: string;
  teacherTitle: string;
  periodsPerWeek: number;
  evaluationType: EvaluationType;
  // Thành phần điểm đánh giá thường xuyên (hệ số 1)
  regularScores: ScoreItem[];
  // Điểm đánh giá giữa kỳ (hệ số 2)
  midtermScore?: ScoreItem;
  // Điểm đánh giá cuối kỳ (hệ số 3)
  finalScore?: ScoreItem;
  // Điểm trung bình môn (ĐTBm)
  averageScore?: number;
  // Xếp loại môn học
  gradeLevel: GradeLevel;
  // Đánh giá bằng nhận xét (Đạt / Chưa đạt)
  feedbackResult?: "pass" | "not_pass";
  // Nhận xét của giáo viên bộ môn
  teacherComment: string;
  // Thống kê so sánh
  classAverage?: number;
  highestScore?: number;
  academicYear?: string;
  semester?: string;
}

export interface GradeSummary {
  gpa: number; // Điểm trung bình tất cả các môn
  academicRank: string; // "Học sinh Giỏi" | "Học sinh Xuất sắc" | "Học sinh Khá"
  conductRank: string; // "Tốt" | "Khá"
  classPosition: number; // 3
  totalClassStudents: number; // 42
  excellentSubjectsCount: number; // 11
  totalSubjectsCount: number; // 13
  passSubjectsCount: number; // 2 (các môn nhận xét)
  totalCreditsOrPeriods: number; // 29 tiết/tuần
  homeroomTeacher: string; // "ThS. Hoàng Văn Nam"
  homeroomComment: string;
  titleAwarded: string; // "Học sinh Giỏi Học kỳ 1"
  attendanceRate: number; // 98.8%
  className?: string;
  academicYear?: string;
  semester?: string;
}

export interface GradeFilter {
  searchQuery: string;
  academicYear: string; // "2025-2026"
  semester: string; // "HK1" | "HK2" | "all"
  classification: GradeClassification;
  sortBy: "gpa_desc" | "gpa_asc" | "name_asc";
  viewMode: GradeViewMode;
}

export interface TranscriptSubjectItem {
  code: string;
  name: string;
  teacher: string;
  periodsPerWeek: number;
  evaluationType: EvaluationType;
  regularScoresStr: string;
  midtermScore?: number;
  finalScore?: number;
  averageScore?: number;
  feedbackResult?: "pass" | "not_pass";
  gradeLevel: GradeLevel;
  teacherComment: string;
}

export interface TranscriptData {
  studentName: string;
  studentCode: string;
  className: string;
  academicYear: string;
  semester: string;
  schoolName: string;
  principalName: string;
  homeroomTeacher: string;
  homeroomComment: string;
  gpa: number;
  academicRank: string;
  conductRank: string;
  titleAwarded: string;
  rankInClass: number;
  totalStudents: number;
  isPromoted: boolean;
  decisionNumber: string;
  digitalSignature: string;
  verifiedAt: string;
  subjects: TranscriptSubjectItem[];
}

export interface ExportPdfResponse {
  success: boolean;
  fileName: string;
  downloadUrl: string;
  digitalSignature: string;
  verifiedAt: string;
  message: string;
}

