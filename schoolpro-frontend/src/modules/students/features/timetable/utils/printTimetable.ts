import dayjs from "dayjs";
import { message } from "@/components/ui/Message";
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
  homeroomTeacher?: string;
}

import { buildLocalTimetablePrintHtml } from "@/modules/students/features/timetable/templates/timetablePrintTemplate";

export { buildLocalTimetablePrintHtml };

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
      homeroomTeacher: options.homeroomTeacher,
    });
  }

  // 4. Use the rendered dynamic template HTML directly
  // The dynamic template contains its own complete @media print and A4 landscape styling

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
  homeroomTeacher?: string;
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
        homeroomTeacher: options.homeroomTeacher,
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
