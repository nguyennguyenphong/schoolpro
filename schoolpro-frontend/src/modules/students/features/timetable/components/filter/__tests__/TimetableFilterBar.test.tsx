import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimetableFilterBar } from "@/modules/students/features/timetable/components/TimetableFilterBar";
import {
  TimetableWeekNavigator,
  TimetableWeekBadge,
  TimetableActionGroup,
} from "@/modules/students/features/timetable/components/filter";

describe("TimetableFilterBar and filter sub-components", () => {
  const defaultProps = {
    selectedDate: "2026-10-14",
    currentWeekLabel: "12/10/2026 - 18/10/2026 (Tuần 5)",
    semesterLabel: "Học kỳ 1",
    minDate: "2026-09-01",
    maxDate: "2027-01-31",
    hasActiveFilters: false,
    isPrinting: false,
    onDateChange: vi.fn(),
    onResetFilters: vi.fn(),
    onTodayClick: vi.fn(),
    onPrevWeekClick: vi.fn(),
    onNextWeekClick: vi.fn(),
    onPrint: vi.fn(),
  };

  it("renders TimetableFilterBar with week navigation, badge, and print button", () => {
    render(<TimetableFilterBar {...defaultProps} />);

    // Week badge
    expect(screen.getByText("12/10/2026 - 18/10/2026 (Tuần 5)")).toBeInTheDocument();
    expect(screen.getByText("Học kỳ 1")).toBeInTheDocument();

    // Today and Print buttons
    expect(screen.getByRole("button", { name: /hôm nay|today/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /in thời khóa biểu|print/i })).toBeInTheDocument();
  });

  it("triggers onPrevWeekClick, onNextWeekClick, and onTodayClick when clicked", async () => {
    const user = userEvent.setup();
    render(<TimetableFilterBar {...defaultProps} />);

    const prevButton = screen.getByRole("button", { name: /tuần trước|previous/i });
    const nextButton = screen.getByRole("button", { name: /tuần sau|next/i });
    const todayButton = screen.getByRole("button", { name: /hôm nay|today/i });

    await user.click(prevButton);
    expect(defaultProps.onPrevWeekClick).toHaveBeenCalledTimes(1);

    await user.click(nextButton);
    expect(defaultProps.onNextWeekClick).toHaveBeenCalledTimes(1);

    await user.click(todayButton);
    expect(defaultProps.onTodayClick).toHaveBeenCalledTimes(1);
  });

  it("triggers onPrint when print button is clicked", async () => {
    const user = userEvent.setup();
    render(<TimetableFilterBar {...defaultProps} />);

    const printButton = screen.getByRole("button", { name: /in thời khóa biểu|print/i });
    await user.click(printButton);
    expect(defaultProps.onPrint).toHaveBeenCalledTimes(1);
  });

  it("shows reset button only when hasActiveFilters is true", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TimetableFilterBar {...defaultProps} hasActiveFilters={false} />,
    );

    expect(screen.queryByRole("button", { name: /về tuần này|quản về tuần/i })).not.toBeInTheDocument();

    rerender(<TimetableFilterBar {...defaultProps} hasActiveFilters={true} />);

    const resetButton = screen.getByRole("button", { name: /về tuần này|quản về tuần/i });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(defaultProps.onResetFilters).toHaveBeenCalledTimes(1);
  });

  it("disables prev button at minDate and next button at maxDate in TimetableWeekNavigator", () => {
    const onDateChange = vi.fn();
    const onTodayClick = vi.fn();
    const onPrevWeekClick = vi.fn();
    const onNextWeekClick = vi.fn();

    // At min date
    const { rerender } = render(
      <TimetableWeekNavigator
        selectedDate="2026-09-01"
        minDate="2026-09-01"
        maxDate="2027-01-31"
        onDateChange={onDateChange}
        onTodayClick={onTodayClick}
        onPrevWeekClick={onPrevWeekClick}
        onNextWeekClick={onNextWeekClick}
      />,
    );

    const prevButton = screen.getByRole("button", { name: /tuần trước|previous/i });
    expect(prevButton).toBeDisabled();

    // At max date
    rerender(
      <TimetableWeekNavigator
        selectedDate="2027-01-31"
        minDate="2026-09-01"
        maxDate="2027-01-31"
        onDateChange={onDateChange}
        onTodayClick={onTodayClick}
        onPrevWeekClick={onPrevWeekClick}
        onNextWeekClick={onNextWeekClick}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /tuần sau|next/i });
    expect(nextButton).toBeDisabled();
  });

  it("renders TimetableWeekBadge correctly and returns null when no labels provided", () => {
    const { container, rerender } = render(
      <TimetableWeekBadge currentWeekLabel="Tuần 1" semesterLabel="Học kỳ 1" />,
    );
    expect(screen.getByText("Tuần 1")).toBeInTheDocument();
    expect(screen.getByText("Học kỳ 1")).toBeInTheDocument();

    rerender(<TimetableWeekBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("disables print button when isPrinting is true in TimetableActionGroup", () => {
    render(
      <TimetableActionGroup
        hasActiveFilters={true}
        isPrinting={true}
        onResetFilters={vi.fn()}
        onPrint={vi.fn()}
      />,
    );

    const printButton = screen.getByRole("button", { name: /in thời khóa biểu|print/i });
    expect(printButton).toBeDisabled();
  });
});
