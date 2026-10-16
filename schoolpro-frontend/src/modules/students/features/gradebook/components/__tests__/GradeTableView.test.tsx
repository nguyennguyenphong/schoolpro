import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import i18n from "@/i18n/i18n";
import { GradeTableView } from "@/modules/students/features/gradebook/components/GradeTableView";
import type { SubjectGradeItem, GradeSummary } from "@/modules/students/features/gradebook/types";

describe("GradeTableView i18n", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("vi");
  });

  const mockGrades: SubjectGradeItem[] = [
    {
      id: "sub-1",
      code: "MATH10",
      name: "Toán học",
      teacher: "Thầy Nguyễn Văn Nam",
      teacherTitle: "Giáo viên bộ môn",
      periodsPerWeek: 4,
      evaluationType: "score",
      regularScores: [
        { id: "s1", name: "TX1", score: 8.5, date: "2026-09-15", weight: 1 },
        { id: "s2", name: "TX2", score: 9.0, date: "2026-10-01", weight: 1 },
      ],
      midtermScore: { id: "m1", name: "GK", score: 8.5, date: "2026-10-15", weight: 2 },
      finalScore: { id: "f1", name: "CK", score: 9.0, date: "2026-12-20", weight: 3 },
      averageScore: 8.8,
      gradeLevel: "excellent",
      teacherComment: "Nắm vững kiến thức, tiếp thu bài tốt.",
      classAverage: 7.6,
      highestScore: 9.5,
    },
    {
      id: "sub-2",
      code: "PE10",
      name: "Giáo dục thể chất",
      teacher: "Thầy Trần Đức",
      teacherTitle: "Giáo viên bộ môn",
      periodsPerWeek: 2,
      evaluationType: "feedback",
      regularScores: [],
      gradeLevel: "pass",
      feedbackResult: "pass",
      teacherComment: "Tích cực rèn luyện.",
    },
  ];

  const mockSummary: GradeSummary = {
    gpa: 8.8,
    academicRank: "Học sinh Giỏi",
    conductRank: "Tốt",
    classPosition: 3,
    totalClassStudents: 40,
    totalSubjectsCount: 2,
    excellentSubjectsCount: 1,
    passSubjectsCount: 1,
    totalCreditsOrPeriods: 6,
    attendanceRate: 100,
    titleAwarded: "Học sinh Giỏi",
    homeroomTeacher: "Cô Trần Thị Thu Hằng",
    homeroomComment: "Chăm ngoan, học giỏi.",
    academicYear: "2026 - 2027",
    semester: "Học kỳ 1",
  };

  it("renders table with Vietnamese headers by default", () => {
    render(<GradeTableView grades={mockGrades} summary={mockSummary} />);

    expect(screen.getAllByText("Môn học").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Giáo viên bộ môn").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Đánh giá thường xuyên (Hệ số 1)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Đánh giá giữa kỳ (Hệ số 2)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Đánh giá cuối kỳ (Hệ số 3)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Điểm trung bình môn học").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Xếp loại môn học").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Thống kê lớp học").length).toBeGreaterThanOrEqual(1);
  });

  it("switches headers to English when language is changed to en", async () => {
    await i18n.changeLanguage("en");
    render(<GradeTableView grades={mockGrades} summary={mockSummary} />);

    expect(screen.getAllByText("Subject").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Subject Teacher").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Continuous Assessment (Weight 1)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Midterm Assessment (Weight 2)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Final Assessment (Weight 3)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Subject Average Score").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Subject Classification").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Class Statistics").length).toBeGreaterThanOrEqual(1);
  });

  it("switches headers to Japanese when language is changed to ja", async () => {
    await i18n.changeLanguage("ja");
    render(<GradeTableView grades={mockGrades} summary={mockSummary} />);

    expect(screen.getAllByText("科目").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("教科担当教員").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("平常点評価 (比重 1)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("中間評価 (比重 2)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("期末評価 (比重 3)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("科目平均点").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("科目成績区分").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("学級統計").length).toBeGreaterThanOrEqual(1);
  });

  it("switches headers to Korean when language is changed to ko", async () => {
    await i18n.changeLanguage("ko");
    render(<GradeTableView grades={mockGrades} summary={mockSummary} />);

    expect(screen.getAllByText("과목").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("담당 교과 교사").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("상시/수행평가 (가중치 1)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("과목 평균 점수").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("과목 등급").length).toBeGreaterThanOrEqual(1);
  });

  it("switches headers to Chinese when language is changed to zh", async () => {
    await i18n.changeLanguage("zh");
    render(<GradeTableView grades={mockGrades} summary={mockSummary} />);

    expect(screen.getAllByText("科目").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("学科任课教师").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("平时考核 (权重 1)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("科目平均分").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("科目评级").length).toBeGreaterThanOrEqual(1);
  });
});
