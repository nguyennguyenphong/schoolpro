import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExamSummaryCards } from "@/modules/students/features/exams/components/ExamSummaryCards";
import type { ExamSummary } from "@/modules/students/features/exams/types";

describe("ExamSummaryCards", () => {
  const mockSummary: ExamSummary = {
    total: 8,
    pendingCount: 3,
    completedCount: 4,
    expiredCount: 1,
    averageScore: 8.5,
  };

  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <ExamSummaryCards summary={null} loading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("renders 4 summary metrics matching leave-request and attendance pattern", () => {
    render(<ExamSummaryCards summary={mockSummary} loading={false} />);

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });
});
