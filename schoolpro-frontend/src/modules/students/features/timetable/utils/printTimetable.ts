import dayjs from "dayjs";
import { timetableService } from "@/modules/students/features/timetable/services/timetableService";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

export interface PrintTimetableOptions {
  selectedDate: string;
  slots?: TimetableSlot[];
  templateCode?: string;
  templateId?: string;
  currentWeekLabel?: string;
  semesterLabel?: string;
  className?: string;
}

/**
 * Builds local fallback HTML for weekly timetable in case of network unavailability.
 */
export function buildLocalTimetablePrintHtml(options: {
  slots: TimetableSlot[];
  selectedDate: string;
  currentWeekLabel?: string;
  semesterLabel?: string;
  className?: string;
}): string {
  const { slots, selectedDate, currentWeekLabel, semesterLabel, className = "10A1" } = options;
  const printDateStr = dayjs().format("DD/MM/YYYY HH:mm");

  const daysOfWeek = [
    { key: 2, label: "Thứ Hai" },
    { key: 3, label: "Thứ Ba" },
    { key: 4, label: "Thứ Tư" },
    { key: 5, label: "Thứ Năm" },
    { key: 6, label: "Thứ Sáu" },
    { key: 7, label: "Thứ Bảy" },
  ];

  const periodsDefinition = [
    { period: 1, time: "07:15 - 08:00" },
    { period: 2, time: "08:05 - 08:50" },
    { period: 3, time: "09:05 - 09:50" },
    { period: 4, time: "09:55 - 10:40" },
    { period: 5, time: "10:45 - 11:30" },
    { period: 6, time: "13:30 - 14:15" },
    { period: 7, time: "14:20 - 15:05" },
    { period: 8, time: "15:20 - 16:05" },
    { period: 9, time: "16:10 - 16:55" },
  ];

  const findSlot = (dayKey: number, periodNum: number) => {
    return slots.find((s) => {
      const dow = s.dayOfWeek;
      const isDayMatched = dow === dayKey || dow === dayKey - 1;
      const numMatch = s.periods?.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 0;
      return isDayMatched && num === periodNum;
    });
  };

  const rowsHtml = periodsDefinition
    .map((p) => {
      const shiftTd =
        p.period === 1
          ? '<td rowspan="5" class="shift-col">Sáng</td>'
          : p.period === 6
          ? '<td rowspan="4" class="shift-col">Chiều</td>'
          : "";

      const dayTds = daysOfWeek
        .map((d) => {
          const slot = findSlot(d.key, p.period);
          if (!slot) return "<td></td>";

          const leaveBadge = slot.isOnLeave
            ? `<div class="tt-slot-excused">Nghỉ phép</div>`
            : "";

          return `
            <td>
              <div class="tt-slot-subject">${slot.courseName}</div>
              <div class="tt-slot-room">${slot.room || ""} • ${slot.instructorName || ""}</div>
              ${leaveBadge}
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

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Thời khóa biểu - Lớp ${className}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', 'Segoe UI', serif;
      margin: 0;
      padding: 0;
      color: #000;
      font-size: 10pt;
      background: #fff;
    }
    .print-container { width: 100%; max-width: 297mm; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .title {
      text-align: center;
      margin: 6px 0 12px 0;
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #0f172a;
    }
    .subtitle {
      text-align: center;
      font-size: 10.5pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 10px;
    }
    .tt-matrix-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 9.5pt;
    }
    .tt-matrix-table th, .tt-matrix-table td {
      border: 1px solid #475569;
      padding: 5px 4px;
      text-align: center;
      vertical-align: middle;
    }
    .tt-matrix-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    .shift-col { width: 48px; background-color: #f8fafc; font-weight: bold; }
    .period-col { width: 42px; font-weight: bold; }
    .time-col { width: 82px; font-size: 8.5pt; color: #334155; }
    .tt-slot-subject { font-weight: bold; color: #1e3a8a; line-height: 1.25; font-size: 9.5pt; }
    .tt-slot-room { font-size: 8.5pt; color: #475569; margin-top: 2px; }
    .tt-slot-excused {
      background-color: #fef3c7;
      border-radius: 3px;
      padding: 1px 3px;
      margin-top: 2px;
      font-size: 8pt;
      color: #92400e;
      font-weight: 600;
      border: 1px solid #fde68a;
    }
    .footer {
      margin-top: 22px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 10.5pt;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header">
      <div>
        <div style="font-size: 11pt; text-transform: uppercase; color: #475569;">TRƯỜNG THPT CHUYÊN SCHOOLPRO</div>
        <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 2px;">PHÒNG HỌC VỤ & ĐÀO TẠO</div>
        <div style="font-size: 11pt; margin-top: 4px;">Lớp: <strong style="color: #1e40af;">${className}</strong> &nbsp;|&nbsp; Năm học: <strong>2026 - 2027</strong></div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12pt; font-weight: bold;">HỌC KỲ: ${semesterLabel || "Học kỳ 1"}</div>
        <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">Thời gian in: ${printDateStr}</div>
      </div>
    </div>

    <div class="title">THỜI KHÓA BIỂU HỌC TẬP THEO TUẦN</div>
    <div class="subtitle">${currentWeekLabel || `Tuần áp dụng ngày ${dayjs(selectedDate).format("DD/MM/YYYY")}`}</div>

    <table class="tt-matrix-table">
      <thead>
        <tr>
          <th style="width: 48px;">Buổi</th>
          <th style="width: 42px;">Tiết</th>
          <th style="width: 82px;">Thời gian</th>
          ${daysOfWeek.map((d) => `<th>${d.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="footer">
      <div style="width: 33%;">
        <strong>NGƯỜI LẬP BIỂU</strong><br/>
        <span style="font-size: 9pt; font-style: italic; color: #64748b;">(Ký và ghi rõ họ tên)</span>
        <div style="height: 50px;"></div>
        <div>Ban Học vụ</div>
      </div>
      <div style="width: 33%;">
        <strong>GIÁO VIÊN CHỦ NHIỆM</strong><br/>
        <span style="font-size: 9pt; font-style: italic; color: #64748b;">(Ký xác nhận)</span>
        <div style="height: 50px;"></div>
        <div>Thầy/Cô Chủ Nhiệm</div>
      </div>
      <div style="width: 34%;">
        <strong>HIỆU TRƯỞNG / BGH</strong><br/>
        <span style="font-size: 9pt; font-style: italic; color: #64748b;">(Duyệt và đóng dấu)</span>
        <div style="height: 50px;"></div>
        <div style="text-transform: uppercase;">Ban Giám Hiệu</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers browser print dialog for weekly timetable using backend sys.export_templates
 * via a hidden iframe, falling back gracefully to local template if backend is unavailable.
 */
export async function printTimetable(options: PrintTimetableOptions): Promise<void> {
  const { selectedDate, slots = [], templateCode, templateId, currentWeekLabel, semesterLabel, className } = options;

  let htmlContent = "";
  let printDocTitle = `Thoi_Khoa_Bieu_${className || "10A1"}_${dayjs(selectedDate).format("YYYYMMDD")}`;

  // 1. Attempt to fetch HTML from backend dynamic ExportTemplate
  try {
    const rendered = await timetableService.renderTimetablePrint({
      date: selectedDate,
      templateCode,
      templateId,
    });
    if (rendered?.html) {
      htmlContent = rendered.html;
      if (rendered.filename) {
        printDocTitle = rendered.filename.replace(/\.[^/.]+$/, "");
      }
    }
  } catch {
    // Continue with local fallback below
  }

  // 2. Fallback to local rendering if backend did not return html
  if (!htmlContent) {
    htmlContent = buildLocalTimetablePrintHtml({
      slots,
      selectedDate,
      currentWeekLabel,
      semesterLabel,
      className,
    });
  }

  // 3. Render into hidden iframe and invoke browser print
  const existingFrame = document.getElementById("schoolpro-timetable-print-frame");
  if (existingFrame) existingFrame.remove();

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
  printDoc.title = printDocTitle;
  printDoc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (printIframe.parentNode) printIframe.parentNode.removeChild(printIframe);
    }, 1000);
  };

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

/**
 * Initiates direct download of timetable file (PDF, HTML) generated by backend.
 */
export function downloadTimetableFile(options: {
  selectedDate: string;
  format?: "pdf" | "html";
  templateCode?: string;
  templateId?: string;
}): void {
  const downloadUrl = timetableService.getTimetableDownloadUrl({
    date: options.selectedDate,
    format: options.format || "pdf",
    templateCode: options.templateCode,
    templateId: options.templateId,
  });

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 1000);
}
