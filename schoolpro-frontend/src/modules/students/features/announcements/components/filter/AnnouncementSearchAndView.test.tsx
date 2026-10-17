import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementSearchAndView } from "@/modules/students/features/announcements/components/filter/AnnouncementSearchAndView";

describe("AnnouncementSearchAndView", () => {
  it("renders search input and triggers onSearchChange", () => {
    const handleSearch = vi.fn();
    const handleViewMode = vi.fn();

    render(
      <AnnouncementSearchAndView
        searchQuery=""
        viewMode="grid"
        onSearchChange={handleSearch}
        onViewModeChange={handleViewMode}
      />
    );

    const input = screen.getByPlaceholderText(
      "Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả..."
    );
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "học phí" } });
    expect(handleSearch).toHaveBeenCalledWith("học phí");
  });

  it("triggers onViewModeChange when buttons are clicked", () => {
    const handleSearch = vi.fn();
    const handleViewMode = vi.fn();

    render(
      <AnnouncementSearchAndView
        searchQuery=""
        viewMode="grid"
        onSearchChange={handleSearch}
        onViewModeChange={handleViewMode}
      />
    );

    const listBtn = screen.getByText("Danh sách");
    fireEvent.click(listBtn);
    expect(handleViewMode).toHaveBeenCalledWith("list");

    const gridBtn = screen.getByText("Lưới thẻ");
    fireEvent.click(gridBtn);
    expect(handleViewMode).toHaveBeenCalledWith("grid");
  });
});
