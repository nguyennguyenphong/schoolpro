export interface AcademicOverview {
  cumulativeGpa: number; // e.g. 3.62
  cumulativeGpaScale10: number; // e.g. 8.45
  cumulativeCredits: number; // e.g. 94
  totalRequiredCredits: number; // e.g. 135
  conductScore: number; // e.g. 92
  conductRank: string; // "Xuất sắc"
  attendanceRate: number; // e.g. 98.2%
  academicRank: string; // "Xuất sắc"
  gpaChange: number; // e.g. +0.12
}

export interface SemesterPerformance {
  semesterId: string;
  semesterName: string;
  gpa: number;
  cpa: number;
  credits: number;
  conductScore: number;
}

export interface CreditByCategory {
  category: string;
  creditsEarned: number;
  totalCredits: number;
  color: string;
}

export interface CompetencyMetric {
  subject: string;
  studentScore: number;
  facultyAverage: number;
  fullMark: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CourseResult {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  attendanceScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore10: number;
  totalScore4: number;
  letterGrade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  status: "passed" | "failed" | "in_progress";
}

export interface StudentAnalyticsData {
  overview: AcademicOverview;
  semesterHistory: SemesterPerformance[];
  creditDistribution: CreditByCategory[];
  competencyRadar: CompetencyMetric[];
  gradeDistribution: GradeDistribution[];
  recentCourses: CourseResult[];
}
