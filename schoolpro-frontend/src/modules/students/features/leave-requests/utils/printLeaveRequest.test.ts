import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildLeaveRequestTemplateContext,
  buildLeaveRequestFallbackHtml,
  printLeaveRequest,
} from "@/modules/students/features/leave-requests/utils/printLeaveRequest";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services/leaveRequestsService";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

describe("printLeaveRequest utils", () => {
  const mockItem: LeaveRequestItem = {
    id: "lr-test-01",
    code: "DON001",
    requestCode: "DON001",
    studentId: "student-01",
    studentCode: "HS2026001",
    studentName: "Nguyễn Văn An",
    studentDob: "2008-05-15",
    classId: "class-10a1",
    className: "10A1",
    leaveType: "sick",
    leaveTypeCode: "SICK",
    status: "approved",
    statusCode: "APPROVED",
    startDate: "2026-10-19",
    endDate: "2026-10-19",
    totalDays: 1,
    sessionShift: "all_day",
    reason: "Em bị sốt cao cần đi khám",
    commitment: "Em hứa chép bài đầy đủ",
    guardianName: "Nguyễn Văn Bình",
    guardianPhone: "0901234567",
    guardianRelationship: "Bố",
    homeroomTeacherName: "Trần Thị Mai",
    teacherNote: "Đồng ý cho học sinh nghỉ ngơi tịnh dưỡng.",
    affectedSubjects: ["Toán", "Ngữ văn", "Giáo dục thể chất"],
    affectedLessons: [
      {
        lessonKey: "les-01",
        timetableId: "tt-01",
        date: "2026-10-19",
        dayOfWeek: 2,
        dayOfWeekLabel: "Thứ Hai",
        periodNumber: 1,
        periodName: "Tiết 1",
        shift: "morning",
        startTime: "07:15",
        endTime: "08:00",
        subjectId: "sub-01",
        subjectName: "Toán",
        teacherId: "tch-01",
        teacherName: "Lý Quốc Tuấn",
        teacherEmail: "tuan@schoolpro.edu.vn",
      },
    ],
    createdAt: "2026-10-19T07:00:00Z",
    updatedAt: "2026-10-19T08:00:00Z",
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();

    const iframe = document.getElementById("schoolpro-leave-request-print-frame");
    if (iframe?.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  });

  it("buildLeaveRequestTemplateContext produces all required fields for export_templates", () => {
    const ctx = buildLeaveRequestTemplateContext(mockItem);

    expect(ctx.code).toBe("DON001");
    expect(ctx.student_name).toBe("Nguyễn Văn An");
    expect(ctx.student_code).toBe("HS2026001");
    expect(ctx.student_dob).toContain("15/05/2008");
    expect(ctx.class_name).toBe("10A1");
    expect(ctx.approval_checkboxes).toContain("[x] Đồng ý");
    expect(ctx.teacher_note_display).toContain("Đồng ý cho học sinh nghỉ ngơi");
    expect(ctx.affected_lessons_table_html).toContain("Chi tiết các tiết học xin nghỉ theo Thời khóa biểu");
    expect(ctx.affected_lessons_table_html).toContain("Lý Quốc Tuấn");
  });

  it("buildLeaveRequestFallbackHtml formats the full official document", () => {
    const html = buildLeaveRequestFallbackHtml(mockItem);

    expect(html).toContain("ĐƠN XIN PHÉP NGHỈ HỌC");
    expect(html).toContain("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
    expect(html).toContain("Nguyễn Văn An");
    expect(html).toContain("10A1");
    expect(html).toContain("Lý Quốc Tuấn");
    expect(html).toContain("Ý KIẾN PHÊ DUYỆT CỦA GIÁO VIÊN CHỦ NHIỆM");
  });

  it("printLeaveRequest opens print window and uses rendered HTML from backend", async () => {
    const focusSpy = vi.fn();
    const printSpy = vi.fn();
    const mockDoc = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
      title: "",
    };

    vi.spyOn(window, "open").mockReturnValue({
      document: mockDoc,
      focus: focusSpy,
      print: printSpy,
      closed: false,
    } as unknown as Window);

    vi.spyOn(leaveRequestsService, "renderLeaveRequestExport").mockResolvedValue({
      html: "<html><body>Official Leave Request from export_templates</body></html>",
      filename: "Don_Xin_Nghi_Phep_DON001_20261019.html",
      fileFormat: "HTML_PRINT",
      templateId: "tpl-01",
      templateCode: "LEAVE_REQUEST_OFFICIAL_A4",
      templateName: "Đơn xin phép nghỉ học chuẩn A4",
    });

    await printLeaveRequest(mockItem);

    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(leaveRequestsService.renderLeaveRequestExport).toHaveBeenCalledWith(
      "lr-test-01",
      undefined,
    );
    expect(mockDoc.write).toHaveBeenCalledWith(
      "<html><body>Official Leave Request from export_templates</body></html>",
    );

    // Fast forward for the print timeout
    vi.advanceTimersByTime(500);

    expect(focusSpy).toHaveBeenCalled();
    expect(printSpy).toHaveBeenCalled();
  });
});
