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

  describe("renderLeaveRequest & resolveExportFilename", () => {
    const sampleLeaveRequest = {
      id: "lr-01",
      code: "261012000189",
      requestCode: "261012000189",
      studentId: "st-01",
      studentName: "Đỗ Minh Quân",
      studentCode: "HS20260001",
      classId: "cls-01",
      className: "10A1",
      leaveType: "sick" as const,
      leaveTypeCode: "SICK",
      sessionShift: "all_day" as const,
      startDate: "2026-10-15",
      endDate: "2026-10-15",
      totalDays: 1,
      reason: "Em bị sốt virus cần nghỉ ngơi theo chỉ định bác sĩ.",
      status: "approved" as const,
      statusCode: "APPROVED",
      createdAt: "2026-10-12 08:30",
      updatedAt: "2026-10-12 09:00",
      homeroomTeacherName: "Nguyễn Thị Mai",
      guardianName: "Đỗ Văn Hùng",
      guardianRelationship: "Bố",
      guardianPhone: "0912345678",
    };

    it("resolves dynamic filename from template sample_data.filename_pattern and file_format", () => {
      const customTemplate = {
        id: "tpl-lr-1",
        code: "LEAVE_REQUEST_OFFICIAL_A4",
        name: "Đơn xin nghỉ phép tùy chỉnh",
        template_type: "LEAVE_REQUEST" as const,
        file_format: "WORD" as const,
        content: "<div>{{student_name}}</div>",
        sample_data: {
          filename_pattern: "DonXinNghi_{{student_code}}_{{code}}",
        },
        is_default: true,
        is_active: true,
      };

      const ctx = exportTemplateService.buildLeaveRequestContext(sampleLeaveRequest);
      const filename = exportTemplateService.resolveExportFilename(
        customTemplate,
        ctx,
        "Don_Xin_Nghi_Phep",
      );
      expect(filename).toBe("DonXinNghi_HS20260001_261012000189.doc");
    });

    it("renders custom CSS, watermark, margins, and placeholders via client-side ExportTemplate", async () => {
      vi.spyOn(httpClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "",
            code: "LEAVE_REQUEST_CUSTOM",
            name: "Mẫu Đơn Tùy Biến",
            template_type: "LEAVE_REQUEST",
            file_format: "HTML_PRINT",
            header_content: "<header>{{school_name}} - {{code}}</header>",
            content: "<main>Học sinh: {{student_name}} - Lớp: {{class_name}}</main>",
            footer_content: "<footer>GVCN: {{homeroom_teacher_name}}</footer>",
            style_content: ".custom-leave { color: #0f172a; }",
            watermark_text: "SCHOOLPRO {{code}}",
            page_size: "A4",
            page_orientation: "LANDSCAPE",
            margins: { top: "12mm", right: "14mm", bottom: "12mm", left: "18mm" },
            is_default: true,
            is_active: true,
          },
        },
      } as any);

      const html = await exportTemplateService.renderLeaveRequest(sampleLeaveRequest, {
        templateCode: "LEAVE_REQUEST_CUSTOM",
      });

      expect(html).toContain("size: A4 landscape;");
      expect(html).toContain("margin: 12mm 14mm 12mm 18mm;");
      expect(html).toContain(".custom-leave { color: #0f172a; }");
      expect(html).toContain("SCHOOLPRO 261012000189");
      expect(html).toContain("Học sinh: Đỗ Minh Quân - Lớp: 10A1");
    });
  });
});
