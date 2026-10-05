import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnnouncementListItem } from "./AnnouncementListItem";
import type { AnnouncementItem } from "../types";

describe("AnnouncementListItem", () => {
  const baseItem: AnnouncementItem = {
    id: "ann-2",
    title: "Thông báo lịch thi chuẩn đầu ra",
    summary: "Lịch thi tổ chức vào tháng 4",
    content: "Chi tiết phòng thi và số báo danh...",
    publishDate: "22/03/2026",
    author: "Phòng Khảo thí",
    department: "Phòng Khảo thí",
    category: "exam",
    priority: "high",
    isPinned: false,
    isRead: false,
    viewsCount: 95,
  };

  it("renders checkbox when announcement is unread (isRead: false)", () => {
    const onToggleSelect = vi.fn();
    render(
      <AnnouncementListItem
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
      <AnnouncementListItem
        item={readItem}
        onClick={vi.fn()}
        onToggleSelect={onToggleSelect}
      />,
    );

    const checkbox = screen.queryByRole("checkbox");
    expect(checkbox).not.toBeInTheDocument();
  });
});
