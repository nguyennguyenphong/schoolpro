import dayjs from "dayjs";
import { message } from "antd";
import { httpClient } from "@/shared/api/httpClient";
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
  studentName?: string;
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
  templateCode?: string;
  studentName?: string;
}): string {
  const {
    slots,
    selectedDate,
    semesterLabel,
    className = "10A1",
    templateCode = "749596971572",
    studentName = "Học sinh",
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

  const classTypeLabels: Record<string, string> = {
    practice: "Thực hành",
    theory: "Lý thuyết",
    seminar: "Seminar",
    exam: "Kiểm tra",
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

          const learningMode = classTypeLabels[slot.classType] || "Lý thuyết";
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

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Thời khóa biểu - Lớp ${className}</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    @page { size: A4 landscape !important; margin: 6mm 8mm !important; }
    html, body {
      font-family: 'Times New Roman', 'Segoe UI', serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      font-size: 8.5pt;
      line-height: 1.25;
      background: #fff;
    }
    .print-container { width: 100%; max-width: 297mm; margin: 0 auto; }
    .tt-header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      padding-bottom: 4px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .title {
      text-align: center;
      margin: 4px 0 6px 0;
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e3a8a;
    }
    .tt-matrix-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8pt;
      page-break-inside: auto;
    }
    .tt-matrix-table thead {
      display: table-header-group !important;
    }
    .tt-matrix-table tbody {
      display: table-row-group !important;
    }
    .tt-matrix-table tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .tt-matrix-table th, .tt-matrix-table td {
      border: 1px solid #475569;
      padding: 3px 2px;
      text-align: center;
      vertical-align: middle;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .tt-matrix-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
      font-size: 8.5pt;
      padding: 4px 2px;
    }
    .shift-col { width: 38px; background-color: #f8fafc; font-weight: bold; font-size: 8.5pt; }
    .period-col { width: 32px; font-weight: bold; font-size: 8.5pt; }
    .time-col { width: 72px; font-size: 7.5pt; color: #334155; }
    .tt-slot-card { text-align: left; line-height: 1.25; padding: 1px 2px; }
    .tt-slot-subject { font-weight: bold; color: #1e3a8a; line-height: 1.2; font-size: 8pt; margin-bottom: 2px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 1.5px; }
    .tt-slot-row { font-size: 7pt; line-height: 1.25; margin-top: 1px; color: #334155; word-break: break-word; }
    .tt-slot-lbl { font-weight: 600; color: #475569; }
    .tt-slot-val { color: #0f172a; }
    .tt-slot-note { font-style: italic; color: #475569; }
    .tt-slot-link { color: #2563eb; text-decoration: underline; word-break: break-all; }
    .tt-slot-excused {
      background-color: #fef3c7;
      border-radius: 2px;
      padding: 1px 3px;
      margin-top: 2px;
      font-size: 6.5pt;
      color: #92400e;
      font-weight: 600;
      border: 1px solid #fde68a;
      display: inline-block;
    }
    .tt-signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .tt-signatures-table td {
      text-align: center;
      vertical-align: top;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <table class="tt-header-table" style="width: 100%; border-collapse: collapse; margin-bottom: 6px; padding-bottom: 4px; border: none;">
      <tr>
        <td style="width: 50%; text-align: left; vertical-align: top;">
          <div style="font-size: 10pt; text-transform: uppercase; color: #475569;">SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI</div>
          <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 1px;">TRƯỜNG THPT CHUYÊN SCHOOLPRO</div>
          <div style="width: 160px; height: 1px; background-color: #0f172a; margin: 4px 0 6px 0;"></div>
          <div style="font-size: 10.5pt;">Lớp: <strong>${className}</strong> - Năm học: <strong>2026 - 2027</strong></div>
        </td>
        <td style="width: 50%; text-align: right; vertical-align: top;">
          <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 10pt; font-weight: bold; margin-bottom: 2px;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 180px; height: 1px; background-color: #0f172a; margin: 4px 0 6px auto;"></div>
          <div style="font-size: 9.5pt; color: #475569;">Học kỳ: <strong>${semesterLabel || "Học kỳ 1"}</strong> - Ngày lập: ${printDateStr}</div>
        </td>
      </tr>
    </table>

    <div class="title">THỜI KHÓA BIỂU HỌC TẬP</div>

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

    <div style="margin-top: 6px; font-size: 8.5pt; color: #334155; line-height: 1.35;">
      <div><strong>Ghi chú:</strong> Thời khóa biểu này có hiệu lực từ ngày ${weekStartDate} đến ngày ${weekEndDate}</div>
    </div>

    <table class="tt-signatures-table">
      <tr>
        <td style="width: 33.33%;">
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">NGƯỜI LẬP BIỂU</div>
          <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký và ghi rõ họ tên)</div>
          <div style="height: 36px;"></div>
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">${cleanStudentName}</div>
        </td>
        <td style="width: 33.33%;">
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">GIÁO VIÊN CHỦ NHIỆM</div>
          <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký và ghi rõ họ tên)</div>
          <div style="height: 36px;"></div>
          <div style="font-size: 10pt; font-weight: bold;">ThS. Hoàng Văn Nam</div>
        </td>
        <td style="width: 33.33%;">
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">HIỆU TRƯỞNG / BGH</div>
          <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký tên và đóng dấu)</div>
          <div style="height: 36px;"></div>
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">TS. Lê Hồng Sơn</div>
        </td>
      </tr>
    </table>

    <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; text-align: right;">
      <span>Mã biểu mẫu: ${templateCode || "749596971572"}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers browser print dialog for weekly timetable using backend sys.export_templates
 * via an off-screen rendered iframe, falling back gracefully to local template if backend is unavailable.
 */
export async function printTimetable(options: PrintTimetableOptions): Promise<void> {
  const { selectedDate, slots = [], templateCode, templateId, currentWeekLabel, semesterLabel, className } = options;

  let printDocTitle = `Thoi_Khoa_Bieu_${className || "10A1"}_${dayjs(selectedDate).format("YYYYMMDD")}`;

  // 1. Immediately open print window synchronously in user gesture to avoid popup blocker
  let printWindow: Window | null = null;
  try {
    if (typeof window !== "undefined" && typeof window.open === "function") {
      printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>${printDocTitle}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: #f8fafc;
                  color: #1e293b;
                }
                .spinner {
                  width: 38px;
                  height: 38px;
                  border: 3.5px solid #cbd5e1;
                  border-top-color: #2563eb;
                  border-radius: 50%;
                  animation: spin 0.8s linear infinite;
                  margin-bottom: 16px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <div style="font-size: 15px; font-weight: 600;">Đang chuẩn bị bản in thời khóa biểu...</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Hộp thoại in sẽ tự động mở trong giây lát.</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  } catch {
    // Popup might be blocked, continue to fallback
  }

  // 2. Fetch rendered HTML from backend dynamic ExportTemplate
  let htmlContent = "";
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
    // Continue with local fallback
  }

  // 3. Fallback to local rendering if backend did not return html
  if (!htmlContent) {
    htmlContent = buildLocalTimetablePrintHtml({
      slots,
      selectedDate,
      currentWeekLabel,
      semesterLabel,
      className,
      templateCode,
      studentName: options.studentName,
    });
  }

  // 4. Always ensure print-color-adjust, page-break, and A4 landscape optimization styles
  const styleInjection = `
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    @page { size: A4 landscape !important; margin: 6mm 8mm !important; }
    @media print {
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        font-size: 8.5pt !important;
      }
      .print-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }
      .tt-matrix-table {
        page-break-inside: auto !important;
      }
      .tt-matrix-table thead {
        display: table-header-group !important;
      }
      .tt-matrix-table tbody {
        display: table-row-group !important;
      }
      .tt-matrix-table tr, .tt-matrix-table td, .tt-matrix-table th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .tt-signatures-table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin-top: 8px !important;
      }
      .tt-header-table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
`;
  htmlContent = htmlContent.includes("</head>")
    ? htmlContent.replace("</head>", `${styleInjection}</head>`)
    : `${styleInjection}${htmlContent}`;

  // 5. If printWindow is available, write HTML and trigger print
  if (printWindow && !printWindow.closed) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.title = printDocTitle;
      printWindow.document.close();

      setTimeout(() => {
        try {
          printWindow?.focus();
          printWindow?.print();
        } catch {
          // Ignore
        }
      }, 400);
      return;
    } catch {
      // Fallback to iframe below if window interaction failed
    }
  }

  // 6. Fallback: In-page Blob iframe with proper navigation event
  return new Promise((resolve) => {
    const existingFrame = document.getElementById("schoolpro-timetable-print-frame");
    if (existingFrame) existingFrame.remove();

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const blobUrl = window.URL.createObjectURL(blob);

    const printIframe = document.createElement("iframe");
    printIframe.id = "schoolpro-timetable-print-frame";
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "1px";
    printIframe.style.height = "1px";
    printIframe.style.opacity = "0.05";
    printIframe.style.border = "none";
    printIframe.src = blobUrl;
    document.body.appendChild(printIframe);

    const cleanup = () => {
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (printIframe.parentNode) printIframe.parentNode.removeChild(printIframe);
        resolve();
      }, 500);
    };

    printIframe.onload = () => {
      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(cleanup, 2000);
        } catch {
          cleanup();
        }
      }, 350);
    };

    // Safety timeout in case onload does not fire
    setTimeout(cleanup, 4000);
  });
}

export interface DownloadTimetableOptions {
  selectedDate: string;
  format?: "pdf" | "html";
  templateCode?: string;
  templateId?: string;
  slots?: TimetableSlot[];
  className?: string;
  currentWeekLabel?: string;
  semesterLabel?: string;
  studentName?: string;
}

/**
 * Initiates direct authenticated download of timetable file (PDF, HTML) generated by backend,
 * with real-time feedback and offline/network fallback.
 */
export async function downloadTimetableFile(options: DownloadTimetableOptions): Promise<void> {
  const format = options.format || "pdf";
  const hideLoading = message.loading({
    content: `Đang chuẩn bị file ${format.toUpperCase()} thời khóa biểu...`,
    key: "download_timetable",
    duration: 0,
  });

  try {
    const response = await httpClient.get<Blob>("/academic/timetable/download/", {
      params: {
        date: options.selectedDate,
        format: format,
        templateCode: options.templateCode,
        templateId: options.templateId,
      },
      responseType: "blob",
    });

    let filename = `Thoi_Khoa_Bieu_${options.className || "10A1"}_${dayjs(options.selectedDate).format("YYYYMMDD")}.${format}`;
    const disposition =
      response.headers?.["content-disposition"] ||
      (typeof response.headers?.get === "function" ? response.headers.get("content-disposition") : undefined);

    if (disposition && typeof disposition === "string") {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "").trim();
      }
    }

    const contentType =
      typeof response.headers?.["content-type"] === "string"
        ? (response.headers["content-type"] as string)
        : format === "pdf"
        ? "application/pdf"
        : "text/html";

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

    hideLoading();
    message.success({
      content: `Tải xuống ${filename} thành công!`,
      key: "download_timetable",
    });
  } catch {
    hideLoading();
    // Fallback: Generate local HTML file for download so the user is never stuck
    try {
      const fallbackHtml = buildLocalTimetablePrintHtml({
        slots: options.slots || [],
        selectedDate: options.selectedDate,
        className: options.className,
        currentWeekLabel: options.currentWeekLabel,
        semesterLabel: options.semesterLabel,
        templateCode: options.templateCode,
        studentName: options.studentName,
      });
      const blob = new Blob([fallbackHtml], { type: "text/html;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fallbackFilename = `Thoi_Khoa_Bieu_${options.className || "10A1"}_${dayjs(options.selectedDate).format("YYYYMMDD")}.html`;
      link.href = blobUrl;
      link.download = fallbackFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

      message.warning({
        content: `Không thể kết nối máy chủ tạo PDF, đã tải xuống bản HTML (${fallbackFilename}).`,
        key: "download_timetable",
      });
    } catch {
      message.error({
        content: "Không thể tải xuống thời khóa biểu. Vui lòng thử lại sau.",
        key: "download_timetable",
      });
    }
  }
}
