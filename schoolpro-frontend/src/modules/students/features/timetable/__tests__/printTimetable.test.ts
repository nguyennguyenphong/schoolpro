import { describe, expect, it, vi } from "vitest";
import {
  buildTimetableFallbackHtml,
  printTimetable,
} from "@/modules/students/features/timetable/utils";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services/timetableService";

const mockSlots: TimetableSlot[] = [
  {
    id: "tt-slot-01",
    courseCode: "MATH10",
    courseName: "Toán học 10",
    classCode: "10A1",
    className: "10A1",
    credits: 2,
    dayOfWeek: 2,
    date: "2026-10-12",
    periods: "Tiết 1",
    startTime: "07:15",
    endTime: "08:00",
    shift: "morning",
    room: "Phòng A201",
    building: "Tòa A",
    campus: "Cơ sở chính",
    instructorName: "ThS. Hoàng Văn Nam",
    instructorEmail: "nam.hoang@schoolpro.edu.vn",
    classType: "theory",
    status: "completed",
    attendanceStatus: "present",
    isOnLeave: false,
  },
  {
    id: "tt-slot-02",
    courseCode: "PHY10",
    courseName: "Vật lý 10",
    classCode: "10A1",
    className: "10A1",
    credits: 2,
    dayOfWeek: 3,
    date: "2026-10-13",
    periods: "Tiết 6",
    startTime: "13:30",
    endTime: "14:15",
    shift: "afternoon",
    room: "Phòng Thực hành Lý",
    building: "Tòa B",
    campus: "Cơ sở chính",
    instructorName: "TS. Nguyễn Minh Tuấn",
    instructorEmail: "tuan.nguyen@schoolpro.edu.vn",
    classType: "practice",
    status: "upcoming",
    attendanceStatus: "excused",
    isOnLeave: true,
  },
];

describe("Timetable Print & Export Document Utility", () => {
  it("builds clean fallback HTML when offline or backend unreachable", () => {
    const html = buildTimetableFallbackHtml({
      selectedDate: "2026-10-12",
      slots: mockSlots,
      currentWeekLabel: "Tuần 06 (12/10/2026 - 18/10/2026)",
      semesterLabel: "Học kỳ 1",
      className: "10A1",
    });

    expect(html).toContain("THỜI KHÓA BIỂU HỌC TẬP");
    expect(html).toContain("Toán học 10");
    expect(html).toContain("Phòng A201");
    expect(html).toContain("Tòa A");
    expect(html).toContain("ThS. Hoàng Văn Nam");
    expect(html).toContain("nam.hoang@schoolpro.edu.vn");
    expect(html).toContain("Vật lý 10");
    expect(html).toContain("Nghỉ phép");
    expect(html).toContain("A4 landscape");
    // Verify strict requirement: Solid borders only, absolutely NO dashed or dotted
    expect(html).not.toContain("dashed");
    expect(html).not.toContain("dotted");
  });

  it("calls printOrExportTimetable from timetableService and creates print iframe", async () => {
    const mockServerDoc = {
      html: "<!DOCTYPE html><html><body><h1>Bản in thời khóa biểu từ Backend</h1></body></html>",
      filename: "Thoi_Khoa_Bieu_10A1_Tuan_06.html",
      fileFormat: "HTML_PRINT",
    };

    const spyService = vi
      .spyOn(timetableService, "printOrExportTimetable")
      .mockResolvedValueOnce(mockServerDoc);

    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    await printTimetable({
      selectedDate: "2026-10-12",
      slots: mockSlots,
      currentWeekLabel: "Tuần 06",
      className: "10A1",
    });

    expect(spyService).toHaveBeenCalledWith({
      date: "2026-10-12",
      templateCode: undefined,
      format: undefined,
    });

    expect(appendChildSpy).toHaveBeenCalled();
    const createdFrame = document.getElementById("schoolpro-timetable-print-frame");
    expect(createdFrame).not.toBeNull();
  });
});
