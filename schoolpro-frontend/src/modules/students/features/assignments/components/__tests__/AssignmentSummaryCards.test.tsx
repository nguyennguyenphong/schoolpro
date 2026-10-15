import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AssignmentSummaryCards } from "@/modules/students/features/assignments/components/AssignmentSummaryCards";
import type { AssignmentSummary } from "@/modules/students/features/assignments/types";

describe("AssignmentSummaryCards", () => {
  const mockSummary: AssignmentSummary = {
    total: 12,
    pendingCount: 4,
    overdueCount: 2,
    gradedCount: 6,
    submittedCount: 0,
    averageScore: 8.5,
  };

  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <AssignmentSummaryCards summary={null} loading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("renders 4 summary metrics matching leave-request pattern", () => {
    render(<AssignmentSummaryCards summary={mockSummary} loading={false} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});
