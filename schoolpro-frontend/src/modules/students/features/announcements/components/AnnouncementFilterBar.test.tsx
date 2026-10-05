import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementFilterBar } from "./AnnouncementFilterBar";
import type { AnnouncementFilter } from "../types";

describe("AnnouncementFilterBar", () => {
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
    summary: {
      total: 10,
      unreadCount: 3,
      urgentCount: 1,
      academicCount: 4,
      examCount: 2,
      activityCount: 3,
    },
    departments: ["Ban Giám Hiệu", "Phòng Đào Tạo"],
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onDepartmentChange: vi.fn(),
    onReadStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onSortByChange: vi.fn(),
    onViewModeChange: vi.fn(),
    onResetFilters: vi.fn(),
    hasActiveFilters: false,
  };

  it("renders status tabs with correct counts", () => {
    render(<AnnouncementFilterBar {...defaultProps} />);

    expect(screen.getByText("Tất cả thông báo")).toBeInTheDocument();
    expect(screen.getByText("Chưa đọc")).toBeInTheDocument();
    expect(screen.getByText("Đã đọc")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument(); // total
    expect(screen.getByText("3")).toBeInTheDocument(); // unread
    expect(screen.getByText("7")).toBeInTheDocument(); // read: 10 - 3 = 7
  });

  it("renders search input and triggers onSearchChange", () => {
    render(<AnnouncementFilterBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(
      "Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả..."
    );
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "lịch thi" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("lịch thi");
  });

  it("renders dynamic category options from categories prop", () => {
    const dynamicCategories = [
      { value: "exam", label: "Lịch thi học kỳ", count: 5 },
      { value: "tuition", label: "Thu học phí", count: 2 },
    ];

    render(
      <AnnouncementFilterBar
        {...defaultProps}
        categories={dynamicCategories}
      />
    );

    expect(screen.getByText("Chuyên mục:")).toBeInTheDocument();
    expect(screen.getByText("Đơn vị:")).toBeInTheDocument();
  });

  it("renders SelectDepartment component with placeholder", () => {
    render(<AnnouncementFilterBar {...defaultProps} />);

    expect(screen.getByText("Tất cả đơn vị")).toBeInTheDocument();
  });

  it("renders reset button when active filter is present", () => {
    render(
      <AnnouncementFilterBar
        {...defaultProps}
        filter={{
          ...defaultFilter,
          department: "Phòng Đào Tạo",
        }}
      />
    );

    const resetBtn = screen.getByTitle("Đặt lại tất cả bộ lọc");
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(defaultProps.onResetFilters).toHaveBeenCalled();
  });

  it("renders SelectPriority and SelectSort filters", () => {
    render(<AnnouncementFilterBar {...defaultProps} />);

    expect(screen.getByText("Mức độ:")).toBeInTheDocument();
    expect(screen.getByText("Tất cả mức độ")).toBeInTheDocument();
    expect(screen.getByText("Sắp xếp:")).toBeInTheDocument();
    expect(screen.getByText("Mới nhất trước")).toBeInTheDocument();
  });
});
