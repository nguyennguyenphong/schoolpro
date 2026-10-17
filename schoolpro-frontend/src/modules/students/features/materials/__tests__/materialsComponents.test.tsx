import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MaterialCard } from "@/modules/students/features/materials/components/MaterialCard";
import { MaterialListItem } from "@/modules/students/features/materials/components/MaterialListItem";
import { MaterialSelectionBar } from "@/modules/students/features/materials/components/MaterialSelectionBar";
import { MaterialsPagination } from "@/modules/students/features/materials/components/MaterialsPagination";
import { MaterialFilterBar } from "@/modules/students/features/materials/components/MaterialFilterBar";
import { MaterialSummaryCards } from "@/modules/students/features/materials/components/MaterialSummaryCards";
import {
  MaterialDetailHeader,
  MaterialPreviewCard,
  MaterialDetailSidebar,
} from "@/modules/students/features/materials/components/detail";
import type { MaterialItem, MaterialFilter } from "@/modules/students/features/materials/types";

const mockMaterial: MaterialItem = {
  id: "test-mat-1",
  title: "Đề thi thử học kỳ 1 môn Toán",
  subjectCode: "MATH11",
  subjectName: "Toán học",
  category: "exam_prep",
  format: "pdf",
  fileName: "de_thi_toan_hk1.pdf",
  fileSize: "2.5 MB",
  fileUrl: "#",
  author: "Thầy Nguyễn Văn Nam",
  uploadDate: "2026-10-10",
  downloadsCount: 142,
  viewsCount: 230,
  semester: "HK1",
  academicYear: "2026-2027",
  description: "Bộ 5 đề thi thử có ma trận và đáp án chi tiết.",
  tableOfContents: ["Phần 1: Trắc nghiệm", "Phần 2: Tự luận"],
  isBookmarked: false,
};

const mockFilter: MaterialFilter = {
  searchQuery: "",
  academicYear: "all",
  subject: "all",
  category: "all",
  semester: "all",
  sortBy: "newest",
  viewMode: "grid",
  page: 1,
  pageSize: 9,
};

describe("Materials Components", () => {
  it("renders MaterialCard with proper details and no abbreviations", () => {
    const handleDownload = vi.fn();
    const handleBookmark = vi.fn();

    render(
      <MemoryRouter>
        <MaterialCard
          item={mockMaterial}
          onDownload={handleDownload}
          onToggleBookmark={handleBookmark}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Đề thi thử học kỳ 1 môn Toán")).toBeInTheDocument();
    expect(screen.getByText("Toán học")).toBeInTheDocument();
    expect(screen.getByText("2026-10-10")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();

    const downloadBtn = screen.getByText(/Tải về/);
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledWith(mockMaterial);
  });

  it("renders MaterialListItem with unified layout and meta info", () => {
    const handleDownload = vi.fn();
    const handleBookmark = vi.fn();

    render(
      <MemoryRouter>
        <MaterialListItem
          item={mockMaterial}
          onDownload={handleDownload}
          onToggleBookmark={handleBookmark}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Đề thi thử học kỳ 1 môn Toán")).toBeInTheDocument();
    expect(screen.getByText("Toán học")).toBeInTheDocument();
    expect(screen.getByText("2026-10-10")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
    expect(screen.getByText(/Tải về/)).toBeInTheDocument();
  });

  it("renders MaterialSelectionBar when items are selected", () => {
    const handleSelectAll = vi.fn();
    const handleClear = vi.fn();
    const handleDownloadSelected = vi.fn();

    const { rerender } = render(
      <MaterialSelectionBar
        selectedCount={0}
        totalOnPage={10}
        isAllSelected={false}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClear}
        onDownloadSelected={handleDownloadSelected}
      />,
    );

    // When 0 selected, nothing rendered
    expect(screen.queryByText(/Đã chọn/)).not.toBeInTheDocument();

    rerender(
      <MaterialSelectionBar
        selectedCount={3}
        totalOnPage={10}
        isAllSelected={false}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClear}
        onDownloadSelected={handleDownloadSelected}
      />,
    );

    expect(screen.getByText(/Đã chọn: 3 tài liệu/)).toBeInTheDocument();
    const clearBtn = screen.getByText(/Bỏ chọn/);
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });

  it("renders MaterialsPagination with count and total", () => {
    const handleChange = vi.fn();

    render(
      <MaterialsPagination
        current={1}
        pageSize={9}
        total={25}
        itemsCount={9}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText(/trên tổng số 25/)).toBeInTheDocument();
  });

  it("renders MaterialFilterBar with category tabs and search input", () => {
    const handleSearchChange = vi.fn();
    const handleCategoryChange = vi.fn();

    render(
      <MaterialFilterBar
        filter={mockFilter}
        onSearchChange={handleSearchChange}
        onAcademicYearChange={vi.fn()}
        onSemesterChange={vi.fn()}
        onSubjectChange={vi.fn()}
        onCategoryChange={handleCategoryChange}
        onSortByChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    expect(screen.getByPlaceholderText(/Tìm kiếm bài giảng/)).toBeInTheDocument();
    const lectureTab = screen.getByText("Bài giảng");
    expect(lectureTab).toBeInTheDocument();
    fireEvent.click(lectureTab);
    expect(handleCategoryChange).toHaveBeenCalledWith("lecture");
  });

  it("renders MaterialSummaryCards with 4 unified metric cards", () => {
    const mockSummary = {
      total: 45,
      lecturesCount: 15,
      outlinesCount: 10,
      textbooksCount: 8,
      examPrepsCount: 12,
      totalDownloads: 1250,
    };

    render(<MaterialSummaryCards summary={mockSummary} />);

    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("triggers onClick when MaterialCard is clicked", () => {
    const handleClick = vi.fn();
    const handleDownload = vi.fn();
    const handleBookmark = vi.fn();

    render(
      <MemoryRouter>
        <MaterialCard
          item={mockMaterial}
          onDownload={handleDownload}
          onToggleBookmark={handleBookmark}
          onClick={handleClick}
        />
      </MemoryRouter>,
    );

    const titleEl = screen.getByText("Đề thi thử học kỳ 1 môn Toán");
    fireEvent.click(titleEl);
    expect(handleClick).toHaveBeenCalledWith(mockMaterial);
  });

  it("renders MaterialDetailHeader with breadcrumbs and actions", () => {
    const handleBack = vi.fn();
    const handleDownload = vi.fn();
    const handleBookmark = vi.fn();

    render(
      <MemoryRouter>
        <MaterialDetailHeader
          item={mockMaterial}
          downloading={false}
          onBack={handleBack}
          onDownload={handleDownload}
          onToggleBookmark={handleBookmark}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Đề thi thử học kỳ 1 môn Toán" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Toán học (MATH11)")).toBeInTheDocument();
    expect(screen.getByText("Thầy Nguyễn Văn Nam")).toBeInTheDocument();
    expect(screen.getByText("Quay lại")).toBeInTheDocument();
  });

  it("renders MaterialPreviewCard with pedagogy certification badge", () => {
    render(
      <MaterialPreviewCard
        item={mockMaterial}
        downloading={false}
        onDownload={vi.fn()}
      />,
    );

    expect(screen.getByText("Đạt chuẩn sư phạm số")).toBeInTheDocument();
    expect(screen.getByText(mockMaterial.description)).toBeInTheDocument();
  });

  it("renders MaterialDetailSidebar with file specifications and teacher info", () => {
    render(
      <MaterialDetailSidebar
        item={mockMaterial}
        downloading={false}
        onDownload={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText("Thông số kỹ thuật tài liệu")).toBeInTheDocument();
    expect(screen.getByText("Giáo viên & Tổ bộ môn")).toBeInTheDocument();
    expect(screen.getByText(mockMaterial.fileName)).toBeInTheDocument();
  });
});

