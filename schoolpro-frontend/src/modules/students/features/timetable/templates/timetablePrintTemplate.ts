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
}

export const PRINT_PERIODS_DEFINITION = [
  { period: 1, time: "07:15 - 08:00", shift: "morning" as const },
  { period: 2, time: "08:05 - 08:50", shift: "morning" as const },
  { period: 3, time: "09:05 - 09:50", shift: "morning" as const },
  { period: 4, time: "09:55 - 10:40", shift: "morning" as const },
  { period: 5, time: "10:45 - 11:30", shift: "morning" as const },
  { period: 6, time: "13:30 - 14:15", shift: "afternoon" as const },
  { period: 7, time: "14:20 - 15:05", shift: "afternoon" as const },
  { period: 8, time: "15:20 - 16:05", shift: "afternoon" as const },
  { period: 9, time: "16:10 - 16:55", shift: "afternoon" as const },
];

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
 * Builds weekly timetable print HTML by interpolating dynamic values into the fixed HTML template file:
 * src/modules/students/features/timetable/templates/printTimetable.html
 */
export function buildLocalTimetablePrintHtml(options: BuildTimetablePrintHtmlOptions): string {
  const {
    slots,
    selectedDate,
    semesterLabel = "Học kỳ 1",
    className = "10A1",
    templateCode = "749596971572",
    studentName = "Học sinh",
    academicYear = "2026 - 2027",
    homeroomTeacher = "ThS. Hoàng Văn Nam",
    principalName = "TS. Lê Hồng Sơn",
  } = options;

  const printDateStr = dayjs().format("DD/MM/YYYY HH:mm");
  const cleanStudentName = studentName.replace(/\s*\((?:Học sinh|Student|HS)\)\s*/gi, "").trim() || studentName;

  const selectedDayjs = dayjs(selectedDate);
  const dayOfWeekNum = selectedDayjs.day();
  const diffToMonday = dayOfWeekNum === 0 ? -6 : 1 - dayOfWeekNum;
  const monday = selectedDayjs.add(diffToMonday, "day");
  const sunday = monday.add(6, "day");
  const weekStartDate = monday.format("DD/MM/YYYY");
  const weekEndDate = sunday.format("DD/MM/YYYY");

  const findSlot = (dayKey: number, periodNum: number) => {
    return slots.find((s) => {
      const dow = s.dayOfWeek;
      const isDayMatched = dow === dayKey || dow === dayKey - 1;
      const numMatch = s.periods?.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 0;
      return isDayMatched && num === periodNum;
    });
  };

  const tableHeaderDays = PRINT_DAYS_OF_WEEK.map((d) => `<th>${d.label}</th>`).join("");

  const rowsHtml = PRINT_PERIODS_DEFINITION
    .map((p) => {
      const shiftTd =
        p.period === 1
          ? '<td rowspan="5" class="shift-col">Sáng</td>'
          : p.period === 6
          ? '<td rowspan="4" class="shift-col">Chiều</td>'
          : "";

      const dayTds = PRINT_DAYS_OF_WEEK
        .map((d) => {
          const slot = findSlot(d.key, p.period);
          if (!slot) return "<td></td>";

          const leaveBadge = slot.isOnLeave
            ? `<div class="tt-slot-excused">Nghỉ phép</div>`
            : "";

          const learningMode = CLASS_TYPE_LABELS[slot.classType] || "Lý thuyết";
          const teachingMode = slot.onlineUrl ? "Trực tuyến" : "Trực tiếp";
          const notesText = slot.notes || slot.lessonTopic || "Không có";
          const linkHtml = slot.onlineUrl
            ? `<a href="${slot.onlineUrl}" target="_blank" class="tt-slot-link" title="${slot.onlineUrl}">Liên kết trực tuyến</a>`
            : "Không có";

          return `
            <td>
              <div class="tt-slot-card">
                <div class="tt-slot-subject">${slot.courseName}</div>
                <div class="tt-slot-row"><span class="tt-slot-lbl">Phòng học:</span> <span class="tt-slot-val">${slot.room || "-"}</span> - <span class="tt-slot-lbl">Giáo viên:</span> <span class="tt-slot-val">${slot.instructorName || "-"}</span></div>
                <div class="tt-slot-row"><span class="tt-slot-lbl">Hình thức học:</span> <span class="tt-slot-val">${learningMode}</span> - <span class="tt-slot-lbl">Hình thức dạy:</span> <span class="tt-slot-val">${teachingMode}</span></div>
                <div class="tt-slot-row"><span class="tt-slot-lbl">Ghi chú:</span> <span class="tt-slot-val tt-slot-note">${notesText}</span> - <span class="tt-slot-lbl">Liên kết khác:</span> <span class="tt-slot-val">${linkHtml}</span></div>
                ${leaveBadge}
              </div>
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          ${shiftTd}
          <td class="period-col">${p.period}</td>
          <td class="time-col">${p.time}</td>
          ${dayTds}
        </tr>
      `;
    })
    .join("");

  return rawPrintTimetableHtml
    .replace(/\{\{className\}\}/g, className)
    .replace(/\{\{academicYear\}\}/g, academicYear)
    .replace(/\{\{semesterLabel\}\}/g, semesterLabel)
    .replace(/\{\{printDateStr\}\}/g, printDateStr)
    .replace(/\{\{weekStartDate\}\}/g, weekStartDate)
    .replace(/\{\{weekEndDate\}\}/g, weekEndDate)
    .replace(/\{\{tableHeaderDays\}\}/g, tableHeaderDays)
    .replace(/\{\{rowsHtml\}\}/g, rowsHtml)
    .replace(/\{\{cleanStudentName\}\}/g, cleanStudentName)
    .replace(/\{\{homeroomTeacher\}\}/g, homeroomTeacher)
    .replace(/\{\{principalName\}\}/g, principalName)
    .replace(/\{\{templateCode\}\}/g, templateCode);
}
