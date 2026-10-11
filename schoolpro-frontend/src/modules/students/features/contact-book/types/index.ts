export type ContactBookTab = "overview" | "weekly" | "subjects" | "feedback";

export interface HomeroomTeacherInfo {
  name: string;
  phone: string;
  email: string;
  subject: string;
  avatar?: string;
}

export interface ParentContactInfo {
  fatherName: string;
  fatherPhone: string;
  fatherJob: string;
  motherName: string;
  motherPhone: string;
  motherJob: string;
  address: string;
}

export interface ContactBookSummary {
  studentName: string;
  studentCode: string;
  dateOfBirth?: string;
  gender?: "Nam" | "Nữ";
  className: string;
  academicYear: string;
  semester: string;
  homeroomTeacher: HomeroomTeacherInfo;
  parentInfo: ParentContactInfo;
  currentGpa: number;
  conduct: "Tốt" | "Khá" | "Đạt" | "Chưa đạt";
  ranking: number;
  totalStudents: number;
  attendanceRate: number;
  excusedAbsence: number;
  unexcusedAbsence: number;
  lateCount: number;
  disciplineScore: number;
  latestTeacherComment: string;
  parentConfirmed: boolean;
  parentFeedbackCount: number;
}

export interface SubjectFeedbackItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  regularScores: number[];
  midtermScore: number | null;
  finalScore: number | null;
  averageScore: number | null;
  teacherComment: string;
  status: "excellent" | "good" | "improving" | "needs_attention";
}

export interface WeeklyReportItem {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  studyComment: string;
  disciplineComment: string;
  attendanceSummary: {
    present: number;
    excused: number;
    unexcused: number;
    late: number;
  };
  disciplinePoints: number;
  teacherSignature: string;
  signedDate: string;
  parentFeedback?: {
    content: string;
    senderName: string;
    submittedAt: string;
    isConfirmed: boolean;
  };
}

export interface ParentNoteItem {
  id: string;
  weekNumber: number;
  parentName: string;
  parentRole: string; // "Bố học sinh" | "Mẹ học sinh" | "Người giám hộ"
  phone: string;
  homeStudyComment: string; // Tình hình học tập & sinh hoạt tại nhà
  generalOpinion: string; // Ý kiến đóng góp hoặc đề xuất với nhà trường & Giáo viên chủ nhiệm
  signedAt: string;
  isConfirmed: boolean;
  teacherResponse?: {
    teacherName: string;
    content: string;
    respondedAt: string;
  };
}

// Giữ lại alias để tương thích ngược nếu cần
export type ParentMessage = ParentNoteItem;

export interface ContactBookFilter {
  tab: ContactBookTab;
  semester: string;
  week: number | "all";
  searchQuery: string;
}

export interface SendFeedbackPayload {
  weekNumber?: number;
  parentName: string;
  parentRole?: string;
  phone: string;
  homeStudyComment?: string;
  generalOpinion?: string;
  content?: string;
}
