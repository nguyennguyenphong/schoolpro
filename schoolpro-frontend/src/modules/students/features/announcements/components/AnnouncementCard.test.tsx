import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnnouncementCard } from "@/modules/students/features/announcements/components/AnnouncementCard";
import type { AnnouncementItem } from "@/modules/students/features/announcements/types";

describe("AnnouncementCard", () => {
  const baseItem: AnnouncementItem = {
    id: "ann-1",
    title: "Thông báo nộp học phí học kỳ 2",
    summary: "Hạn cuối nộp học phí là ngày 30/03/2026",
    content: "Chi tiết hướng dẫn nộp học phí qua cổng thanh toán...",
    publishDate: "20/03/2026",
    author: "Phòng Tài chính - Kế toán",
    department: "Phòng Kế toán",
    category: "tuition",
    priority: "normal",
    isPinned: false,
    isRead: false,
    viewsCount: 120,
  };

  it("renders checkbox when announcement is unread (isRead: false)", () => {
    const onToggleSelect = vi.fn();
    render(
      <AnnouncementCard
        item={baseItem}
        onClick={vi.fn()}
        onToggleSelect={onToggleSelect}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("hides checkbox when announcement is read (isRead: true)", () => {
    const readItem: AnnouncementItem = {
      ...baseItem,
      isRead: true,
    };
    const onToggleSelect = vi.fn();
    render(
      <AnnouncementCard
        item={readItem}
        onClick={vi.fn()}
        onToggleSelect={onToggleSelect}
      />,
    );

    const checkbox = screen.queryByRole("checkbox");
    expect(checkbox).not.toBeInTheDocument();
  });
});
