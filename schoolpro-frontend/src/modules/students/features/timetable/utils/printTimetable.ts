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
    { key: 2, label: "Thứ Hai", date: weekStart.add(0, "day").format("DD/MM") },
    { key: 3, label: "Thứ Ba", date: weekStart.add(1, "day").format("DD/MM") },
    { key: 4, label: "Thứ Tư", date: weekStart.add(2, "day").format("DD/MM") },
    { key: 5, label: "Thứ Năm", date: weekStart.add(3, "day").format("DD/MM") },
    { key: 6, label: "Thứ Sáu", date: weekStart.add(4, "day").format("DD/MM") },
    { key: 7, label: "Thứ Bảy", date: weekStart.add(5, "day").format("DD/MM") },
  ];

  const periods = [
    { period: 1, time: "07:15 - 08:00", shift: "morning" },
    { period: 2, time: "08:05 - 08:50", shift: "morning" },
    { period: 3, time: "09:05 - 09:50", shift: "morning" },
    { period: 4, time: "09:55 - 10:40", shift: "morning" },
    { period: 5, time: "10:45 - 11:30", shift: "morning" },
    { period: 6, time: "13:30 - 14:15", shift: "afternoon" },
    { period: 7, time: "14:20 - 15:05", shift: "afternoon" },
    { period: 8, time: "15:20 - 16:05", shift: "afternoon" },
    { period: 9, time: "16:10 - 16:55", shift: "afternoon" },
  ];

  const getSlot = (dayKey: number, periodNum: number) => {
    return slots.find((s) => {
      if (s.dayOfWeek !== dayKey) return false;
      const periodStr = String(s.periods || "");
      const match = periodStr.match(/\d+/);
      return match ? parseInt(match[0], 10) === periodNum : false;
    });
  };

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
      font-size: 10pt;
    }
    .tt-matrix-table th, .tt-matrix-table td {
      border: 1px solid #64748b;
      padding: 4px 6px;
      text-align: center;
      vertical-align: middle;
    }
    .tt-matrix-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      font-size: 10.5pt;
      color: #0f172a;
    }
    .tt-shift-col {
      width: 50px;
      font-weight: bold;
      background-color: #f8fafc;
    }
    .tt-period-col {
      width: 42px;
      font-weight: bold;
      background-color: #fafafa;
    }
    .tt-time-col {
      width: 82px;
      font-size: 9pt;
      color: #475569;
    }
    .tt-slot-cell {
      height: 44px;
      text-align: center;
    }
    .tt-slot-subject {
      font-weight: bold;
      color: #0f172a;
      font-size: 10pt;
    }
    .tt-slot-subinfo {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 1px;
    }
    .tt-slot-excused {
      background-color: #fffbeb !important;
      border: 1.5px dashed #f59e0b !important;
    }
    .tt-slot-excused .tt-slot-subject {
      color: #b45309;
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
      border-top: 1px dashed #cbd5e1;
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
          <th class="tt-shift-col">Buổi</th>
          <th class="tt-period-col">Tiết</th>
          <th class="tt-time-col">Thời gian</th>
          ${daysOfWeek
            .map(
              (d) =>
                `<th>${escapeHtml(d.label)}<br/><span style="font-weight: normal; font-size: 8.5pt; color: #475569;">(${d.date})</span></th>`,
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${periods
          .map((p) => {
            const shiftCell =
              p.period === 1
                ? '<td class="tt-shift-col" rowspan="5">Sáng</td>'
                : p.period === 6
                  ? '<td class="tt-shift-col" rowspan="4">Chiều</td>'
                  : "";

            return `
            <tr>
              ${shiftCell}
              <td class="tt-period-col">${p.period}</td>
              <td class="tt-time-col">${p.time}</td>
              ${daysOfWeek
                .map((d) => {
                  const slot = getSlot(d.key, p.period);
                  if (!slot) return '<td class="tt-slot-cell"></td>';

                  const subjName = escapeHtml(slot.courseName || "");
                  const room = escapeHtml(slot.room || "");
                  const teacher = escapeHtml(slot.instructorName || "");
                  const isOnLeave = Boolean(slot.isOnLeave);

                  const cellClass = isOnLeave ? "tt-slot-cell tt-slot-excused" : "tt-slot-cell";
                  const leaveBadge = isOnLeave
                    ? '<div class="tt-slot-subinfo" style="color: #b45309; font-weight: bold;">(Nghỉ phép)</div>'
                    : "";

                  const metaParts = [room, teacher].filter(Boolean);
                  const metaStr = metaParts.join(" &bull; ");

                  return `
                  <td class="${cellClass}">
                    <div class="tt-slot-subject">${subjName}</div>
                    ${metaStr ? `<div class="tt-slot-subinfo">${metaStr}</div>` : ""}
                    ${leaveBadge}
                  </td>
                  `;
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
