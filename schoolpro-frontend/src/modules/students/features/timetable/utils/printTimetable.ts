import dayjs from "dayjs";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services/timetableService";

export interface PrintTimetableParams {
  selectedDate: string;
  slots: TimetableSlot[];
  currentWeekLabel?: string;
  semesterLabel?: string;
  className?: string;
  templateCode?: string;
  format?: string;
}

/**
 * Escapes HTML characters for safe injection.
 */
function escapeHtml(text?: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Builds fallback printable HTML when offline or backend template API is unreachable.
 */
export function buildTimetableFallbackHtml(params: PrintTimetableParams): string {
  const { slots, selectedDate, currentWeekLabel, semesterLabel, className = "10A1" } = params;
  const printDateStr = dayjs().format("DD/MM/YYYY HH:mm");

  const targetDate = dayjs(selectedDate);
  const weekStart = targetDate.subtract(targetDate.isoWeekday() - 1, "day");

  const daysOfWeek = [
    { key: 2, label: "Thứ Hai", short: "T2", date: weekStart.add(0, "day").format("DD/MM"), dateStr: weekStart.add(0, "day").format("YYYY-MM-DD") },
    { key: 3, label: "Thứ Ba", short: "T3", date: weekStart.add(1, "day").format("DD/MM"), dateStr: weekStart.add(1, "day").format("YYYY-MM-DD") },
    { key: 4, label: "Thứ Tư", short: "T4", date: weekStart.add(2, "day").format("DD/MM"), dateStr: weekStart.add(2, "day").format("YYYY-MM-DD") },
    { key: 5, label: "Thứ Năm", short: "T5", date: weekStart.add(3, "day").format("DD/MM"), dateStr: weekStart.add(3, "day").format("YYYY-MM-DD") },
    { key: 6, label: "Thứ Sáu", short: "T6", date: weekStart.add(4, "day").format("DD/MM"), dateStr: weekStart.add(4, "day").format("YYYY-MM-DD") },
    { key: 7, label: "Thứ Bảy", short: "T7", date: weekStart.add(5, "day").format("DD/MM"), dateStr: weekStart.add(5, "day").format("YYYY-MM-DD") },
    { key: 8, label: "Chủ Nhật", short: "CN", date: weekStart.add(6, "day").format("DD/MM"), dateStr: weekStart.add(6, "day").format("YYYY-MM-DD") },
  ];

  const shifts = [
    { key: "morning", label: "Buổi Sáng", timeRange: "07:00 - 11:30" },
    { key: "afternoon", label: "Buổi Chiều", timeRange: "12:30 - 17:30" },
    { key: "evening", label: "Buổi Tối", timeRange: "17:45 - 21:00" },
  ];

  // Calculate leave status per day
  const dayLeaveMap = new Map<string, { hasLeave: boolean; isPending: boolean }>();
  daysOfWeek.forEach((d) => {
    const daySlots = slots.filter((s) => s.date === d.dateStr || s.dayOfWeek === d.key);
    const leaveSlots = daySlots.filter((s) => s.isOnLeave || s.attendanceStatus === "excused");
    dayLeaveMap.set(d.dateStr, {
      hasLeave: leaveSlots.length > 0,
      isPending: leaveSlots.some((s) => s.leaveStatus === "pending"),
    });
  });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Thời khóa biểu - ${escapeHtml(className)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 0;
      color: #000;
      font-size: 11pt;
      background: #fff;
    }
    .print-container {
      width: 100%;
      max-width: 297mm;
      margin: 0 auto;
      padding: 4px;
    }
    .tt-header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      border-bottom: 1.5px solid #334155;
      padding-bottom: 6px;
    }
    .tt-header-left {
      width: 50%;
      text-align: left;
      vertical-align: top;
    }
    .tt-header-right {
      width: 50%;
      text-align: right;
      vertical-align: top;
    }
    .tt-org-parent {
      font-size: 10pt;
      text-transform: uppercase;
      color: #475569;
    }
    .tt-school-name {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #0f172a;
    }
    .tt-class-meta {
      font-size: 11pt;
      margin-top: 2px;
    }
    .tt-motto-country {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .tt-motto-sub {
      font-size: 10pt;
      font-style: italic;
      margin-bottom: 2px;
    }
    .tt-admin-date {
      font-size: 9.5pt;
      color: #475569;
    }
    .tt-title-block {
      text-align: center;
      margin: 8px 0 10px 0;
    }
    .tt-doc-title {
      font-size: 17pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e3a8a;
    }
    .tt-doc-subtitle {
      font-size: 11pt;
      font-style: italic;
      color: #334155;
      margin-top: 2px;
    }
    .tt-matrix-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8pt;
    }
    .tt-matrix-table th, .tt-matrix-table td {
      border: 1px solid #cbd5e1;
      padding: 4px;
      vertical-align: top;
    }
    .tt-matrix-table th {
      background-color: #f8fafc;
      font-weight: bold;
      text-align: center;
      color: #1e293b;
      padding: 6px 4px;
    }
    .tt-header-leave {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }
    .tt-shift-col {
      width: 52px;
      font-weight: bold;
      text-align: center !important;
      vertical-align: middle !important;
      background-color: #f8fafc;
      font-size: 9pt;
    }
    .tt-shift-timerange {
      font-size: 7.5pt;
      color: #64748b;
      font-weight: normal;
      display: block;
      margin-top: 2px;
    }
    .tt-day-col {
      width: calc((100% - 52px) / 7);
    }
    .tt-slot-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px;
      background-color: #ffffff;
      margin-bottom: 5px;
      font-size: 7.5pt;
      line-height: 1.35;
    }
    .tt-slot-card:last-child {
      margin-bottom: 0;
    }
    .tt-slot-excused {
      background-color: #fffbeb !important;
      border: 1px solid #f59e0b !important;
    }
    .tt-card-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }
    .tt-class-badge {
      font-size: 7.5pt;
      font-weight: bold;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 3px;
      padding: 1px 4px;
      display: inline-block;
    }
    .tt-leave-badge {
      font-size: 7pt;
      font-weight: bold;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 3px;
      padding: 1px 4px;
      display: inline-block;
    }
    .tt-slot-subject {
      font-size: 8.5pt;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 3px;
      line-height: 1.25;
    }
    .tt-slot-row {
      font-size: 7.5pt;
      color: #334155;
      margin-top: 2px;
    }
    .tt-slot-row strong {
      color: #0f172a;
    }
    .tt-slot-instructor {
      font-size: 7.5pt;
      color: #1e293b;
      margin-top: 2px;
    }
    .tt-slot-email {
      font-size: 7pt;
      color: #2563eb;
      word-break: break-all;
    }
    .tt-slot-tags {
      margin-top: 3px;
      display: flex;
      gap: 3px;
      flex-wrap: wrap;
    }
    .tt-type-tag {
      font-size: 7pt;
      padding: 1px 3px;
      border-radius: 2px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
    }
    .tt-topic-note {
      font-size: 7pt;
      font-style: italic;
      color: #475569;
      margin-top: 3px;
      padding: 2px 4px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 2px;
    }
    .tt-empty-cell {
      text-align: center;
      color: #94a3b8;
      font-size: 8pt;
      font-style: italic;
      padding: 14px 2px;
    }
    .tt-signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .tt-signature-table td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
    }
    .tt-sig-title {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .tt-sig-note {
      font-size: 9.5pt;
      font-style: italic;
      color: #475569;
    }
    .tt-sig-space {
      height: 48px;
    }
    .tt-sig-name {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .tt-meta-footer {
      margin-top: 16px;
      padding-top: 4px;
      border-top: 1px solid #cbd5e1;
      font-size: 8.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <table class="tt-header-table">
      <tr>
        <td class="tt-header-left">
          <div class="tt-org-parent">SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI</div>
          <div class="tt-school-name">TRƯỜNG THPT CHUYÊN SCHOOLPRO</div>
          <div class="tt-class-meta">LỚP: <strong>${escapeHtml(className)}</strong> &bull; NIÊN KHÓA: <strong>2026 - 2027</strong></div>
        </td>
        <td class="tt-header-right">
          <div class="tt-motto-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="tt-motto-sub">Độc lập - Tự do - Hạnh phúc</div>
          <div class="tt-admin-date">Học kỳ: <strong>${escapeHtml(semesterLabel || "Học kỳ 1")}</strong> &bull; Thời gian in: ${printDateStr}</div>
        </td>
      </tr>
    </table>

    <div class="tt-title-block">
      <div class="tt-doc-title">THỜI KHÓA BIỂU HỌC TẬP</div>
      <div class="tt-doc-subtitle">${escapeHtml(currentWeekLabel || `Tuần học áp dụng ngày ${targetDate.format("DD/MM/YYYY")}`)}</div>
    </div>

    <table class="tt-matrix-table">
      <thead>
        <tr>
          <th class="tt-shift-col">Ca học</th>
          ${daysOfWeek
            .map((d) => {
              const leaveMeta = dayLeaveMap.get(d.dateStr);
              const hasLeave = Boolean(leaveMeta?.hasLeave);
              const thClass = hasLeave ? "tt-day-col tt-header-leave" : "tt-day-col";
              const leaveBadge = hasLeave
                ? `<div style="margin-top: 2px;"><span class="tt-leave-badge">${leaveMeta?.isPending ? "Nghỉ phép: Chờ duyệt" : "Nghỉ phép: Đã duyệt"}</span></div>`
                : "";

              return `
              <th class="${thClass}">
                <div style="font-size: 9.5pt; font-weight: bold;">${escapeHtml(d.label)} (${d.short})</div>
                <div style="font-size: 8pt; font-weight: normal; color: #475569;">${d.date}</div>
                ${leaveBadge}
              </th>
              `;
            })
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${shifts
          .map((shift) => {
            return `
            <tr>
              <td class="tt-shift-col">
                <span style="font-weight: bold; font-size: 8.5pt;">${escapeHtml(shift.label)}</span>
                <span class="tt-shift-timerange">${shift.timeRange}</span>
              </td>
              ${daysOfWeek
                .map((d) => {
                  const daySlots = slots.filter(
                    (s) => (s.date === d.dateStr || s.dayOfWeek === d.key) && s.shift === shift.key,
                  );

                  if (daySlots.length === 0) {
                    return '<td class="tt-day-col"><div class="tt-empty-cell">—</div></td>';
                  }

                  daySlots.sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));

                  const cardsHtml = daySlots
                    .map((s) => {
                      const subjName = escapeHtml(s.courseName || "Môn học");
                      const clsName = escapeHtml(s.className || s.classCode || className);
                      const room = escapeHtml(s.room || "Phòng học");
                      const bld = escapeHtml(s.building || "");
                      const campus = escapeHtml(s.campus || "");
                      const startT = escapeHtml(s.startTime || "");
                      const endT = escapeHtml(s.endTime || "");
                      const periodsStr = escapeHtml(s.periods || "");
                      const instructor = escapeHtml(s.instructorName || "Giáo viên");
                      const email = escapeHtml(s.instructorEmail || "");
                      const isPractice = s.classType === "practice";
                      const typeLabel = isPractice ? "Thực hành" : "Lý thuyết";
                      const isOnline = Boolean(s.onlineUrl);
                      const modeLabel = isOnline ? "Trực tuyến" : "Trực tiếp";
                      const topicOrNotes = escapeHtml(String(s.lessonTopic || s.notes || "").trim());

                      const isOnLeave = Boolean(s.isOnLeave || s.attendanceStatus === "excused");
                      const cardClass = isOnLeave ? "tt-slot-card tt-slot-excused" : "tt-slot-card";
                      const leaveBadge = isOnLeave
                        ? `<span class="tt-leave-badge">${s.leaveStatus === "pending" ? "Nghỉ phép (Chờ duyệt)" : "Nghỉ phép (Đã duyệt)"}</span>`
                        : "";

                      const locationParts = [`Phòng: ${room}`];
                      if (bld) locationParts.push(bld);
                      if (campus) locationParts.push(`(${campus})`);
                      const roomLine = locationParts.join(" &bull; ");

                      const timeParts = [];
                      if (startT && endT) timeParts.push(`${startT} - ${endT}`);
                      if (periodsStr) timeParts.push(`(${periodsStr})`);
                      const timeLine = timeParts.join(" ") || "Theo thời khóa biểu";

                      let instructorLine = `GV: ${instructor}`;
                      if (email) {
                        instructorLine += ` &bull; <span class="tt-slot-email">${email}</span>`;
                      }

                      const topicHtml = topicOrNotes
                        ? `<div class="tt-topic-note">Bài học / Ghi chú: ${topicOrNotes}</div>`
                        : "";

                      return `
                      <div class="${cardClass}">
                        <div class="tt-card-badge-row">
                          <span class="tt-class-badge">Lớp: ${clsName}</span>
                          ${leaveBadge}
                        </div>
                        <div class="tt-slot-subject">${subjName}</div>
                        <div class="tt-slot-row"><strong>Địa điểm:</strong> ${roomLine}</div>
                        <div class="tt-slot-row"><strong>Thời gian:</strong> ${timeLine}</div>
                        <div class="tt-slot-instructor">${instructorLine}</div>
                        <div class="tt-slot-tags">
                          <span class="tt-type-tag">${typeLabel}</span>
                          <span class="tt-type-tag">${modeLabel}</span>
                        </div>
                        ${topicHtml}
                      </div>
                      `;
                    })
                    .join("");

                  return `<td class="tt-day-col">${cardsHtml}</td>`;
                })
                .join("")}
            </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>

    <table class="tt-signature-table">
      <tr>
        <td>
          <div class="tt-sig-title">NGƯỜI LẬP BIỂU</div>
          <div class="tt-sig-note">(Ký và ghi rõ họ tên)</div>
          <div class="tt-sig-space"></div>
          <div class="tt-sig-name">Bộ phận Giáo vụ</div>
        </td>
        <td>
          <div class="tt-sig-title">GIÁO VIÊN CHỦ NHIỆM</div>
          <div class="tt-sig-note">(Ký và ghi rõ họ tên)</div>
          <div class="tt-sig-space"></div>
          <div class="tt-sig-name">ThS. Hoàng Văn Nam</div>
        </td>
        <td>
          <div class="tt-sig-title">HIỆU TRƯỞNG / BGH</div>
          <div class="tt-sig-note">(Ký tên và đóng dấu)</div>
          <div class="tt-sig-space"></div>
          <div class="tt-sig-name">TS. Lê Hồng Sơn</div>
        </td>
      </tr>
    </table>

    <div class="tt-meta-footer">
      <span>Hệ thống Quản lý Học vụ SchoolPro &bull; Mẫu in chuẩn A4 ngang</span>
      <span>Mã tra cứu: #TT-${escapeHtml(className)}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers browser print dialog for Timetable using the active backend ExportTemplate.
 */
export async function printTimetable(params: PrintTimetableParams): Promise<void> {
  // 1. Fetch live template rendering from backend sys.export_templates
  const serverDoc = await timetableService.printOrExportTimetable({
    date: params.selectedDate,
    templateCode: params.templateCode,
    format: params.format,
  });

  const htmlContent = serverDoc?.html || buildTimetableFallbackHtml(params);

  // 2. Remove existing print iframe if any
  const existingFrame = document.getElementById("schoolpro-timetable-print-frame");
  if (existingFrame) existingFrame.remove();

  // 3. Create isolated hidden print iframe
  const printIframe = document.createElement("iframe");
  printIframe.id = "schoolpro-timetable-print-frame";
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "none";
  printIframe.style.visibility = "hidden";
  document.body.appendChild(printIframe);

  const printDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!printDoc) {
    window.print();
    return;
  }

  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (printIframe.parentNode) {
        printIframe.parentNode.removeChild(printIframe);
      }
    }, 1000);
  };

  // Wait for resources to load, then trigger print
  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 250);

  if (printIframe.contentWindow) {
    printIframe.contentWindow.onafterprint = cleanup;
  }
}
