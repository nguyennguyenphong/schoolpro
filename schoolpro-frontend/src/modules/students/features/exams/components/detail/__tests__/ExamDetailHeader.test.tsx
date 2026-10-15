import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ExamDetailHeader } from "@/modules/students/features/exams/components/detail/ExamDetailHeader";
import type { ExamItem } from "@/modules/students/features/exams/types";

describe("ExamDetailHeader", () => {
  const mockExam: ExamItem = {
    id: "exam-1",
    code: "EXAM-101",
    title: "Kiểm tra 15 phút Toán học",
    courseCode: "MATH101",
    courseName: "Toán học 11",
    teacherName: "Thầy Trần Văn Bình",
    semester: "Học kỳ 1",
    academicYear: "2026-2027",
    durationMinutes: 15,
    totalQuestions: 10,
    maxScore: 10,
    passingScore: 5.0,
    startDate: "2026-10-15",
    endDate: "2026-10-25",
    status: "pending",
    questions: [],
  };

  it("renders exam title, course code, and back button", () => {
    const handleBack = vi.fn();
    render(
      <MemoryRouter>
        <ExamDetailHeader exam={mockExam} onBack={handleBack} />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Kiểm tra 15 phút Toán học").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("MATH101")).toBeInTheDocument();
    expect(screen.getByText("EXAM-101")).toBeInTheDocument();
  });
});
