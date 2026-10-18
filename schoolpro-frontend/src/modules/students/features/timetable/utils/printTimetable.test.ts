import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildLocalTimetablePrintHtml,
  downloadTimetableFile,
  printTimetable,
} from "@/modules/students/features/timetable/utils/printTimetable";
import { timetableService } from "@/modules/students/features/timetable/services/timetableService";
import { httpClient } from "@/shared/api/httpClient";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

describe("printTimetable & downloadTimetableFile", () => {
  const mockSlots: TimetableSlot[] = [
    {
      id: "slot-01",
      courseCode: "MATH10",
      courseName: "Toán học 10",
      classCode: "10A1",
      className: "10A1",
      credits: 3,
      dayOfWeek: 2,
      date: "2026-10-12",
      periods: "Tiết 1",
      startTime: "07:15",
      endTime: "08:00",
      shift: "morning",
      room: "Phòng A203",
      building: "Tòa A",
      campus: "Cơ sở 1",
      instructorName: "Thầy Hoàng Văn Nam",
      instructorEmail: "nam@schoolpro.edu.vn",
      instructorPhone: "",
      classType: "theory",
      status: "completed",
      attendanceStatus: "present",
      isOnLeave: false,
      leaveStatus: null,
      leaveSessionShift: "all_day",
      leaveType: null,
      leaveReason: "",
      leaveRequestCode: "",
      onlineUrl: undefined,
      lessonTopic: "Hàm số bậc nhất",
      notes: "",
      colorTheme: "blue",
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();

    vi.restoreAllMocks();

    const iframe = document.getElementById("schoolpro-timetable-print-frame");
    if (iframe?.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  });

  it("builds valid local HTML with matrix table, class and semester info", () => {
    const html = buildLocalTimetablePrintHtml({
      slots: mockSlots,
      selectedDate: "2026-10-12",
      currentWeekLabel: "Tuần 06",
      semesterLabel: "Học kỳ 1",
      className: "10A1",
      templateCode: "749596971572",
      studentName: "Trần Minh Quân (Học sinh)",
    });

    expect(html).toContain("THỜI KHÓA BIỂU HỌC TẬP");
    expect(html).not.toContain("Tuần 06");
    expect(html).toContain("10A1");
    expect(html).toContain("Toán học 10");
    expect(html).toContain("Học kỳ 1");
    expect(html).toContain("Thứ Hai");
    expect(html).toContain("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
    expect(html).toContain("Mã biểu mẫu: 749596971572");
    expect(html).toContain("Ghi chú:</strong> Thời khóa biểu này có hiệu lực từ ngày");
    expect(html).toContain("Trần Minh Quân");
    expect(html).not.toContain("(Học sinh)");
    expect(html).not.toContain("Bộ phận Giáo vụ");
    expect(html).toContain("Phòng học:</span>");
    expect(html).toContain("Giáo viên:</span>");
    expect(html).toContain("Hình thức học:</span>");
    expect(html).toContain("Hình thức dạy:</span>");
    expect(html).toContain("Ghi chú:</span>");
    expect(html).toContain("Liên kết khác:</span>");
    expect(html).not.toContain("•");
    expect(html).not.toContain("&bull;");
  });

  it("creates print window and triggers browser print using backend template render", async () => {
    const focusSpy = vi.fn();
    const printSpy = vi.fn();
    const mockDoc = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    };

    vi.spyOn(window, "open").mockReturnValue({
      document: mockDoc,
      focus: focusSpy,
      print: printSpy,
      closed: false,
    } as unknown as Window);

    vi.spyOn(timetableService, "renderTimetablePrint").mockResolvedValue({
      html: "<!DOCTYPE html><html><body><h1>Bản in thời khóa biểu backend</h1></body></html>",
      filename: "Thoi_Khoa_Bieu_10A1_Tuan_06.html",
      template_code: "TIMETABLE_WEEKLY_A4_LANDSCAPE",
    });

    const printPromise = printTimetable({
      selectedDate: "2026-10-12",
      slots: mockSlots,
      className: "10A1",
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(focusSpy).toHaveBeenCalled();
    expect(printSpy).toHaveBeenCalled();
    expect(mockDoc.write).toHaveBeenCalled();
    await printPromise;
  });

  it("downloads timetable file using authenticated blob request", async () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    vi.spyOn(httpClient, "get").mockResolvedValue({
      data: new Blob(["pdf content"], { type: "application/pdf" }),
      headers: {
        "content-disposition": 'attachment; filename="Thoi_Khoa_Bieu_10A1_20261012.pdf"',
        "content-type": "application/pdf",
      },
    });

    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/test");
    } else {
      vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:http://localhost/test");
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
    }

    await downloadTimetableFile({
      selectedDate: "2026-10-12",
      format: "pdf",
    });

    expect(httpClient.get).toHaveBeenCalledWith(
      "/academic/timetable/download/",
      expect.objectContaining({
        params: expect.objectContaining({
          date: "2026-10-12",
          format: "pdf",
        }),
        responseType: "blob",
      })
    );
    expect(clickSpy).toHaveBeenCalled();
  });
});
