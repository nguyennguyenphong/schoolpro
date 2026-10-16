import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MaterialCard } from "@/modules/students/features/materials/components/MaterialCard";
import { MaterialSelectionBar } from "@/modules/students/features/materials/components/MaterialSelectionBar";
import type { MaterialItem } from "@/modules/students/features/materials/types";

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
    expect(screen.getByText("Thầy Nguyễn Văn Nam")).toBeInTheDocument();
    expect(screen.getByText("2026-10-10")).toBeInTheDocument();

    const downloadBtn = screen.getByText(/Tải về/);
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledWith(mockMaterial);
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
});
