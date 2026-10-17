import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components/StudentMetricCard";

describe("StudentMetricCard", () => {
  it("renders metric title, value, and optional unit", () => {
    const handleClick = vi.fn();
    render(
      <StudentMetricCard
        title="Tổng số bài tập"
        value={15}
        unit="bài"
        iconName="file-text"
        onClick={handleClick}
      />
    );

    expect(screen.getByText("Tổng số bài tập")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("bài")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tổng số bài tập"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders StudentMetricSkeleton with requested count of placeholders", () => {
    const { container } = render(<StudentMetricSkeleton count={4} />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBe(4);
  });
});
