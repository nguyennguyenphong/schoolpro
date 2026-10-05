import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementDetailModal } from "./AnnouncementDetailModal";
import type { AnnouncementItem } from "../types";

// Mock @react-pdf-viewer/core & default-layout
vi.mock("@react-pdf-viewer/core", () => ({
  Worker: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-worker">{children}</div>,
  Viewer: ({ fileUrl }: { fileUrl: string }) => <div data-testid="pdf-viewer" data-url={fileUrl}>Viewer Content</div>,
}));

vi.mock("@react-pdf-viewer/default-layout", () => ({
  defaultLayoutPlugin: () => ({}),
}));

// Mock print utility
vi.mock("../utils", () => ({
  printAnnouncement: vi.fn(),
}));

describe("AnnouncementDetailModal", () => {
  const mockItem: AnnouncementItem = {
    id: "ann-detail-1",
    title: "Thông báo lịch thi giữa kỳ",
    summary: "Chi tiết phòng thi và danh sách số báo danh",
    content: "Sinh viên có mặt đúng giờ...",
    publishDate: "2026-03-25",
    author: "Phòng Khảo thí",
    department: "Phòng Khảo thí",
    category: "exam",
    priority: "urgent",
    isPinned: true,
    isRead: false,
    viewsCount: 200,
    targetAudience: "Toàn thể học sinh",
    attachments: [
      {
        id: "att-pdf-1",
        name: "Lich_Thi.pdf",
        url: "/files/lich_thi.pdf",
        size: "1.2 MB",
        fileType: "pdf",
      },
      {
        id: "att-xlsx-1",
        name: "Danh_Sach.xlsx",
        url: "/files/danh_sach.xlsx",
        size: "500 KB",
        fileType: "xlsx",
      },
    ],
  };

  it("renders announcement information and attachments correctly", () => {
    render(
      <AnnouncementDetailModal
        item={mockItem}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Thông báo lịch thi giữa kỳ")).toBeInTheDocument();
    expect(screen.getByText("Lich_Thi.pdf")).toBeInTheDocument();
    expect(screen.getByText("Danh_Sach.xlsx")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("opens PdfViewerModal when clicking on a PDF attachment", () => {
    render(
      <AnnouncementDetailModal
        item={mockItem}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const pdfCard = screen.getByText("Lich_Thi.pdf");
    fireEvent.click(pdfCard);

    // PdfViewerModal opens
    const viewer = screen.getByTestId("pdf-viewer");
    expect(viewer).toBeInTheDocument();
    expect(viewer).toHaveAttribute("data-url", "/files/lich_thi.pdf");
  });
});
