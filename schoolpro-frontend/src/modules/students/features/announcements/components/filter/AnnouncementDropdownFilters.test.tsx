import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementDropdownFilters } from "./AnnouncementDropdownFilters";
import type { AnnouncementFilter } from "../../types";

describe("AnnouncementDropdownFilters", () => {
  const defaultFilter: AnnouncementFilter = {
    searchQuery: "",
    category: "all",
    department: "all",
    readStatus: "all",
    priority: "all",
    sortBy: "newest",
    viewMode: "grid",
    page: 1,
    pageSize: 10,
  };

  const defaultProps = {
    filter: defaultFilter,
    categories: [],
    hasActiveFilters: false,
    onCategoryChange: vi.fn(),
    onDepartmentChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onSortByChange: vi.fn(),
    onResetFilters: vi.fn(),
  };

  it("renders all dropdown filter labels", () => {
    render(<AnnouncementDropdownFilters {...defaultProps} />);

    expect(screen.getByText("Chuyên mục:")).toBeInTheDocument();
    expect(screen.getByText("Đơn vị:")).toBeInTheDocument();
    expect(screen.getByText("Mức độ:")).toBeInTheDocument();
    expect(screen.getByText("Sắp xếp:")).toBeInTheDocument();
  });

  it("shows reset button when active filter is present", () => {
    render(
      <AnnouncementDropdownFilters
        {...defaultProps}
        filter={{
          ...defaultFilter,
          category: "exam",
        }}
      />
    );

    const resetBtn = screen.getByTitle("Đặt lại tất cả bộ lọc");
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(defaultProps.onResetFilters).toHaveBeenCalled();
  });
});
