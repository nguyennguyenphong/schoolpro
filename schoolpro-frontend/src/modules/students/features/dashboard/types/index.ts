export interface StudentProfileInfo {
  id: string;
  studentCode: string; // e.g. "HS-2025-1104"
  fullName: string; // e.g. "Trần Minh Đức"
  gender: "Nam" | "Nữ";
  dob: string; // e.g. "15/10/2009"
  className: string; // e.g. "11A1"
  gradeLevel: number; // 11
  stream: string; // e.g. "Khoa học Tự nhiên"
  schoolName: string; // e.g. "Trường THPT Chu Văn An"
  academicYear: string; // e.g. "2025 - 2026"
  homeroomTeacher: string; // e.g. "Cô Nguyễn Thị Mai Hoa"
  teacherPhone: string; // e.g. "0912.345.678"
  room: string; // e.g. "Phòng A2-304"
  status: "Đang học" | "Bảo lưu" | "Chuyển trường";
  avatarUrl?: string;
}

export interface StudentAcademicOverview {
  gpa10: number; // Điểm trung bình học kỳ thang 10, e.g. 8.65
  gpaChange: number; // e.g. +0.35 so với kỳ trước
  academicRank: "Xuất sắc" | "Giỏi" | "Khá" | "Đạt" | "Chưa đạt";
  conductRank: "Tốt" | "Khá" | "Đạt" | "Chưa đạt";
  conductScore: number; // 96 / 100 điểm nề nếp thi đua
  attendanceRate: number; // 98.5%
  attendedSessions: number; // 130 buổi
  totalSessions: number; // 132 buổi
  excusedAbsences: number; // 2 buổi
  unexcusedAbsences: number; // 0 buổi
  lateCount: number; // 1 lần
  classRank: number; // 4
  totalStudentsInClass: number; // 42
  gradeRank: number; // 18
  totalStudentsInGrade: number; // 380
  awards: string[]; // ["Học sinh Giỏi HK1", "Giải Nhì HSG Tin học cấp Trường"]
}

export interface SemesterTrend {
  semesterId: string;
  semesterName: string; // e.g. "HK1 (2024-2025)"
  studentGpa: number; // e.g. 8.20
  classAverageGpa: number; // e.g. 7.60
  conductRank: string; // "Tốt"
}

export interface SubjectGroupPerformance {
  groupName: string; // "KHTN (Toán, Lý, Hóa, Sinh, Tin)", "KHXH (Văn, Sử, Địa, GDCD)", etc.
  studentScore: number;
  classAverage: number;
  subjectCount: number;
}

export interface SubjectScoreComparison {
  subjectName: string;
  studentScore: number;
  classAverage: number;
}

export interface ClassDistributionItem {
  rankName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CompetencyAssessment {
  competency: string; // "Tự chủ & Tự học", "Giao tiếp & Hợp tác", v.v.
  score: number; // thang 100
  level: "Tốt" | "Khá" | "Đạt";
  category: "pham_chat" | "nang_luc";
}

export interface AttendanceDetail {
  attended: number;
  excused: number;
  unexcused: number;
  late: number;
  disciplineScore: number;
  homeroomEvaluation: string;
}

export interface SubjectGradeDetail {
  id: string;
  stt: number;
  subjectCode: string;
  subjectName: string;
  category: "khtn" | "khxh" | "khac";
  teacherName: string;
  periodsPerWeek: number; // Số tiết / tuần
  regularScores: number[]; // Điểm đánh giá thường xuyên: [TX1, TX2, TX3, TX4]
  midtermScore: number; // Điểm kiểm tra giữa kỳ (ĐGGK - hệ số 2)
  finalScore: number; // Điểm kiểm tra cuối kỳ (ĐGCK - hệ số 3)
  averageScore: number; // Điểm trung bình môn HK1
  annualAverageScore: number; // Điểm trung bình môn Cả năm (dự kiến)
  rank: "Tốt" | "Khá" | "Đạt" | "Chưa đạt";
  feedback: string;
}

export interface StudentAnalyticsData {
  studentProfile: StudentProfileInfo;
  overview: StudentAcademicOverview;
  semesterHistory: SemesterTrend[];
  subjectGroupPerformance: SubjectGroupPerformance[];
  subjectScoreComparisons: SubjectScoreComparison[];
  classGradeDistribution: ClassDistributionItem[];
  competencyAssessments: CompetencyAssessment[];
  attendanceDetail: AttendanceDetail;
  subjectGrades: SubjectGradeDetail[];
}
