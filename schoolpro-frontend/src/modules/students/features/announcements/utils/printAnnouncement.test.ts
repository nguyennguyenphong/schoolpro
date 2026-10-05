import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { printAnnouncement } from "./printAnnouncement";
import { exportTemplateService } from "@/shared/services/exportTemplateService";
import type { AnnouncementItem } from "../types";

describe("printAnnouncement", () => {
  const mockItem: AnnouncementItem = {
    id: "ann-001",
    title: "Thông báo lịch nghỉ Tết Nguyên Đán 2026",
    summary: "Thông báo về kế hoạch nghỉ Tết Nguyên Đán cho toàn thể sinh viên",
    content: "Chi tiết kế hoạch nghỉ Tết Nguyên Đán từ ngày 15/02 đến 25/02...",
    publishDate: "10/02/2026",
    author: "Phòng Công tác sinh viên",
    department: "Phòng Đào tạo",
    category: "general",
    priority: "urgent",
    isPinned: true,
    isRead: false,
    viewsCount: 150,
    targetAudience: "Toàn thể học sinh, sinh viên",
    attachments: [
      {
        id: "att-1",
        name: "Lich_Nghi_Tet_2026.pdf",
        url: "/files/lich.pdf",
        size: "1.2 MB",
        fileType: "pdf",
      },
    ],
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    const iframe = document.getElementById("schoolpro-announcement-print-frame");
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  });

  it("creates a hidden iframe with printed document content and triggers print", async () => {
    const focusSpy = vi.fn();
    const printSpy = vi.fn();

    // Mock HTMLIFrameElement in JSDOM
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "iframe") {
        Object.defineProperty(el, "contentWindow", {
          value: {
            focus: focusSpy,
            print: printSpy,
            document: {
              open: vi.fn(),
              write: vi.fn(),
              close: vi.fn(),
            },
          },
          configurable: true,
        });
      }
      return el;
    });

    await printAnnouncement(mockItem);

    const iframe = document.getElementById("schoolpro-announcement-print-frame") as HTMLIFrameElement;
    expect(iframe).toBeDefined();

    // Advance timers to trigger print
    vi.advanceTimersByTime(300);

    expect(focusSpy).toHaveBeenCalled();
    expect(printSpy).toHaveBeenCalled();
  });

  it("resolves template dynamically via exportTemplateService", async () => {
    const renderSpy = vi
      .spyOn(exportTemplateService, "renderAnnouncement")
      .mockResolvedValue("<html><body>Rendered from backend template</body></html>");

    await printAnnouncement(mockItem);

    expect(renderSpy).toHaveBeenCalledWith(mockItem);
  });
});
