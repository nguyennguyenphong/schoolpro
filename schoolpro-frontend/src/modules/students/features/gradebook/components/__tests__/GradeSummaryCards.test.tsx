import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GradeSummaryCards } from "@/modules/students/features/gradebook/components/GradeSummaryCards";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

describe("GradeSummaryCards", () => {
  const mockSummary: GradeSummary = {
    gpa: 8.92,
    academicRank: "Tốt",
    conductRank: "Tốt",
    classPosition: 3,
    totalClassStudents: 42,
    totalSubjectsCount: 13,
    passSubjectsCount: 13,
    excellentSubjectsCount: 9,
    totalCreditsOrPeriods: 29,
    attendanceRate: 98.5,
    titleAwarded: "Học sinh Giỏi",
    homeroomTeacher: "Cô Trần Thị Thu Hằng",
    homeroomComment: "Chăm ngoan, tích cực tham gia các phong trào thi đua.",
    academicYear: "2025-2026",
    semester: "HK1",
    className: "11A1",
  };

  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <GradeSummaryCards summary={null} loading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("renders GPA and key metrics correctly", () => {
    render(<GradeSummaryCards summary={mockSummary} loading={false} />);

    expect(screen.getByText("8.92")).toBeInTheDocument();
    expect(screen.getAllByText("Tốt").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/98.5/)).toBeInTheDocument();
  });
});
