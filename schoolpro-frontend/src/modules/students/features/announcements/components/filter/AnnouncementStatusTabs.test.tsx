import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementStatusTabs } from "./AnnouncementStatusTabs";

describe("AnnouncementStatusTabs", () => {
  it("renders tabs with correct badge counts", () => {
    const handleStatusChange = vi.fn();
    render(
      <AnnouncementStatusTabs
        readStatus="all"
        totalCount={20}
        unreadCount={5}
        onStatusChange={handleStatusChange}
      />
    );

    expect(screen.getByText("Tất cả thông báo")).toBeInTheDocument();
    expect(screen.getByText("Chưa đọc")).toBeInTheDocument();
    expect(screen.getByText("Đã đọc")).toBeInTheDocument();

    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // 20 - 5 = 15
  });

  it("calls onStatusChange when a tab is clicked", () => {
    const handleStatusChange = vi.fn();
    render(
      <AnnouncementStatusTabs
        readStatus="all"
        totalCount={10}
        unreadCount={2}
        onStatusChange={handleStatusChange}
      />
    );

    const unreadTab = screen.getByText("Chưa đọc");
    fireEvent.click(unreadTab);

    expect(handleStatusChange).toHaveBeenCalledWith("unread");
  });
});
