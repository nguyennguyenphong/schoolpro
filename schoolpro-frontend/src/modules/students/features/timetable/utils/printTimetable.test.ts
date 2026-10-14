import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildLocalTimetablePrintHtml,
  downloadTimetableFile,
  printTimetable,
} from "./printTimetable";
import { timetableService } from "@/modules/students/features/timetable/services/timetableService";
import type { TimetableSlot } from "../types";

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
    });

    expect(html).toContain("THỜI KHÓA BIỂU HỌC TẬP THEO TUẦN");
    expect(html).toContain("10A1");
    expect(html).toContain("Toán học 10");
    expect(html).toContain("Học kỳ 1");
    expect(html).toContain("Thứ Hai");
  });

  it("creates hidden iframe and triggers browser print using backend template render", async () => {
    const focusSpy = vi.fn();
    const printSpy = vi.fn();

    vi.spyOn(timetableService, "renderTimetablePrint").mockResolvedValue({
      html: "<!DOCTYPE html><html><body><h1>Bản in thời khóa biểu backend</h1></body></html>",
      filename: "Thoi_Khoa_Bieu_10A1_Tuan_06.html",
      template_code: "TIMETABLE_WEEKLY_A4_LANDSCAPE",
    });

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

    await printTimetable({
      selectedDate: "2026-10-12",
      slots: mockSlots,
      className: "10A1",
    });

    vi.advanceTimersByTime(300);

    expect(focusSpy).toHaveBeenCalled();
    expect(printSpy).toHaveBeenCalled();
  });

  it("downloads timetable file using direct URL", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    downloadTimetableFile({
      selectedDate: "2026-10-12",
      format: "pdf",
    });

    expect(clickSpy).toHaveBeenCalled();
  });
});
