import dayjs from "dayjs";
import rawPrintTimetableHtml from "@/modules/students/features/timetable/templates/printTimetable.html?raw";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

export interface BuildTimetablePrintHtmlOptions {
  slots: TimetableSlot[];
  selectedDate: string;
  currentWeekLabel?: string;
  semesterLabel?: string;
  className?: string;
  templateCode?: string;
  studentName?: string;
  academicYear?: string;
  homeroomTeacher?: string;
  principalName?: string;
  schoolName?: string;
  schoolParentName?: string;
}

export const PRINT_DAYS_OF_WEEK = [
  { key: 2, label: "Thứ Hai" },
  { key: 3, label: "Thứ Ba" },
  { key: 4, label: "Thứ Tư" },
  { key: 5, label: "Thứ Năm" },
  { key: 6, label: "Thứ Sáu" },
  { key: 7, label: "Thứ Bảy" },
];

export const CLASS_TYPE_LABELS: Record<string, string> = {
  practice: "Thực hành",
  theory: "Lý thuyết",
  seminar: "Seminar",
  exam: "Kiểm tra",
};

/**
 * Builds weekly timetable print HTML by interpolating dynamic values into the A4 Landscape HTML template file:
 * src/modules/students/features/timetable/templates/printTimetable.html
 */
export function buildLocalTimetablePrintHtml(options: BuildTimetablePrintHtmlOptions): string {
  const {
    slots,
    selectedDate,
    semesterLabel = "Học kỳ 1",
    className = "10A1",
    academicYear = "2026 – 2027",
    homeroomTeacher = "Cô Trần Thị Mai",
    studentName = "Học sinh",
    schoolName = "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    schoolParentName = "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH",
  } = options;

  const cleanStudentName =
    studentName.replace(/\s*\((?:Học sinh|Student|HS)\)\s*/gi, "").trim() || studentName;

  const selectedDayjs = dayjs(selectedDate);
  const dayOfWeekNum = selectedDayjs.day();
  const diffToMonday = dayOfWeekNum === 0 ? -6 : 1 - dayOfWeekNum;
  const monday = selectedDayjs.add(diffToMonday, "day");
  const sunday = monday.add(6, "day");
  const weekStartDate = monday.format("DD/MM/YYYY");
  const weekEndDate = sunday.format("DD/MM/YYYY");
  const weekLabel = options.currentWeekLabel || `Tuần ${selectedDayjs.format("WW")}`;

  const findSlot = (dayKey: number, shiftName: "morning" | "afternoon", periodNum: number) => {
    return slots.find((s) => {
      const dow = s.dayOfWeek;
      const isDayMatched = dow === dayKey || dow === dayKey - 1;
      if (!isDayMatched) return false;

      const numMatch = s.periods?.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 0;
      const slotShift = s.shift ? s.shift.toLowerCase() : "";

      if (shiftName === "morning") {
        return (!slotShift || slotShift === "morning") && num === periodNum;
      } else {
        return (
          (slotShift === "afternoon" && (num === periodNum || num === periodNum + 5)) ||
          num === periodNum + 5
        );
      }
    });
  };

  const formatCell = (slot?: TimetableSlot) => {
    if (!slot) {
      return '<td class="lesson empty-session">Không có lịch</td>';
    }

    const courseName = slot.courseName || "—";
    const st = slot.startTime || "";
    const et = slot.endTime || "";
    const timeStr = st ? `${st} – ${et}` : ".......... – ..........";
    const room = slot.room || "—";
    const instructor = slot.instructorName || "—";
    const teachingMode = slot.onlineUrl ? "Trực tuyến" : "Trực tiếp";
    const learningMode = CLASS_TYPE_LABELS[slot.classType] || "Lý thuyết";

    let notes = "—";
    if (slot.isOnLeave || slot.attendanceStatus === "excused") {
      notes = `Nghỉ phép (${slot.leaveReason || "Nghỉ phép"})`;
    } else if (slot.notes || slot.lessonTopic) {
      notes = slot.notes || slot.lessonTopic || "—";
    }

    const linkHtml = slot.onlineUrl
      ? `<a href="${slot.onlineUrl}" target="_blank">${slot.onlineUrl}</a>`
      : "—";

    return `
      <td class="lesson">
          <div class="subject">Tên môn học: ${courseName}</div>
          <div class="detail"><strong>Thời gian:</strong> ${timeStr}</div>
          <div class="detail"><strong>Phòng học:</strong> ${room}</div>
          <div class="detail"><strong>Giáo viên:</strong> ${instructor}</div>
          <div class="detail"><strong>Hình thức dạy:</strong> ${teachingMode}</div>
          <div class="detail"><strong>Hình thức học:</strong> ${learningMode}</div>
          <div class="detail" style="font-style: italic;"><strong>Ghi chú:</strong> ${notes}</div>
          <div class="detail" style="font-style: italic;"><strong>Liên kết khác:</strong> ${linkHtml}</div>
      </td>
    `;
  };

  const dayRows: string[] = [];
  for (const day of PRINT_DAYS_OF_WEEK) {
    const morningCells = [1, 2, 3, 4, 5]
      .map((p) => formatCell(findSlot(day.key, "morning", p)))
      .join("");
    const morningRow = `
      <tr>
          <td class="day" rowspan="2">${day.label}</td>
          <td class="session">Sáng</td>
          ${morningCells}
      </tr>
    `;

    const afternoonCells = [1, 2, 3, 4, 5]
      .map((p) => formatCell(findSlot(day.key, "afternoon", p)))
      .join("");
    const afternoonRow = `
      <tr>
          <td class="session">Chiều</td>
          ${afternoonCells}
      </tr>
    `;

    dayRows.push(morningRow);
    dayRows.push(afternoonRow);
  }

  const rowsHtml = dayRows.join("\n");
  const now = dayjs();
  const createdDateFormatted = `TP. Hồ Chí Minh, ngày ${now.format("DD")} tháng ${now.format("MM")} năm ${now.format("YYYY")}`;

  return rawPrintTimetableHtml
    .replace(/\{\{schoolParentName\}\}/g, schoolParentName)
    .replace(/\{\{schoolName\}\}/g, schoolName)
    .replace(/\{\{docNumber\}\}/g, "08/TKB-THPT")
    .replace(/\{\{className\}\}/g, className)
    .replace(/\{\{gradeLevel\}\}/g, "Khối 10")
    .replace(/\{\{academicYear\}\}/g, academicYear)
    .replace(/\{\{semesterLabel\}\}/g, semesterLabel)
    .replace(/\{\{weekLabel\}\}/g, weekLabel)
    .replace(/\{\{weekStartDate\}\}/g, weekStartDate)
    .replace(/\{\{weekEndDate\}\}/g, weekEndDate)
    .replace(/\{\{rowsHtml\}\}/g, rowsHtml)
    .replace(/\{\{generalNotes\}\}/g, "Học sinh có mặt trước giờ học 15 phút, mặc đồng phục đúng quy định.")
    .replace(/\{\{homeroomTeacher\}\}/g, homeroomTeacher)
    .replace(/\{\{createdByName\}\}/g, cleanStudentName)
    .replace(/\{\{createdDateFormatted\}\}/g, createdDateFormatted);
}
