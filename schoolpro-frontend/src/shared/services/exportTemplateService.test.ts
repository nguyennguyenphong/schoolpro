import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  exportTemplateService,
  formatAdminDate,
  escapeHtml,
} from "./exportTemplateService";
import { httpClient } from "@/shared/api/httpClient";
import type { AnnouncementItem } from "@/modules/students/features/announcements/types";

describe("exportTemplateService", () => {
  const sampleAnnouncement: AnnouncementItem = {
    id: "ann-01",
    title: "Thông báo tuyển sinh năm học 2026 - 2027",
    summary: "Kế hoạch chi tiết tiếp nhận hồ sơ",
    content: "Chi tiết các chỉ tiêu xét tuyển khối 10...",
    publishDate: "2026-05-15",
    author: "Hội đồng Tuyển sinh",
    department: "Phòng Tuyển sinh & Truyền thông",
    category: "general",
    priority: "normal",
    isPinned: false,
    isRead: false,
    viewsCount: 300,
    targetAudience: "Phụ huynh và Học sinh",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatAdminDate", () => {
    it("formats YYYY-MM-DD date into Vietnamese administrative style", () => {
      const result = formatAdminDate("2026-05-15");
      expect(result).toBe("Hà Nội, ngày 15 tháng 05 năm 2026");
    });

    it("formats DD/MM/YYYY date correctly", () => {
      const result = formatAdminDate("08/03/2026");
      expect(result).toBe("Hà Nội, ngày 08 tháng 03 năm 2026");
    });
  });

  describe("escapeHtml", () => {
    it("escapes dangerous HTML characters", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
      );
    });
  });

  describe("getActiveTemplateByCode", () => {
    it("fetches template successfully from backend API", async () => {
      const mockTemplate = {
        id: "tpl-123",
        code: "ANNOUNCEMENT_OFFICIAL_A4",
        name: "Mẫu A4 Chuẩn",
        content: "<div>{{ title }}</div>",
        template_type: "ANNOUNCEMENT",
        file_format: "HTML_PRINT",
        is_default: true,
        is_active: true,
      };

      vi.spyOn(httpClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockTemplate,
        },
      } as any);

      const result = await exportTemplateService.getActiveTemplateByCode("ANNOUNCEMENT_OFFICIAL_A4");
      expect(result).toEqual(mockTemplate);
      expect(httpClient.get).toHaveBeenCalledWith(
        "/system/export-templates/active-by-code/",
        { params: { code: "ANNOUNCEMENT_OFFICIAL_A4" } }
      );
    });

    it("returns null when API call fails", async () => {
      vi.spyOn(httpClient, "get").mockRejectedValueOnce(new Error("Network error"));
      const result = await exportTemplateService.getActiveTemplateByCode("NON_EXISTENT");
      expect(result).toBeNull();
    });
  });

  describe("renderTemplateOnServer", () => {
    it("calls render endpoint and returns rendered html", async () => {
      vi.spyOn(httpClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            html: "<html><body>Rendered on Server</body></html>",
            template_id: "tpl-123",
            template_code: "ANNOUNCEMENT_OFFICIAL_A4",
            template_name: "Mẫu A4 Chuẩn",
          },
        },
      } as any);

      const html = await exportTemplateService.renderTemplateOnServer("tpl-123", { title: "Test" });
      expect(html).toBe("<html><body>Rendered on Server</body></html>");
    });
  });

  describe("renderAnnouncement", () => {
    it("uses backend template server render when available", async () => {
      vi.spyOn(httpClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "tpl-server",
            code: "ANNOUNCEMENT_OFFICIAL_A4",
            name: "Mẫu A4",
            content: "<div>{{ title }}</div>",
          },
        },
      } as any);

      vi.spyOn(httpClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            html: "<html><body>Server rendered: Thông báo tuyển sinh</body></html>",
          },
        },
      } as any);

      const result = await exportTemplateService.renderAnnouncement(sampleAnnouncement);
      expect(result).toContain("Server rendered: Thông báo tuyển sinh");
    });

    it("falls back to local fallback html when network fails", async () => {
      vi.spyOn(httpClient, "get").mockRejectedValue(new Error("Offline"));

      const result = await exportTemplateService.renderAnnouncement(sampleAnnouncement);
      expect(result).toContain("HỆ THỐNG GIÁO DỤC SCHOOLPRO");
      expect(result).toContain("Thông báo tuyển sinh năm học 2026 - 2027");
    });
  });
});
