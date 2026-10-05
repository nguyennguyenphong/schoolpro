import type { AnnouncementItem } from "../types";
import {
  exportTemplateService,
  formatAdminDate,
  escapeHtml,
} from "@/shared/services/exportTemplateService";

export { formatAdminDate, escapeHtml };

/**
 * Legacy local fallback printer for backwards-compatibility or sync usage.
 */
export function buildPrintHtml(item: AnnouncementItem): string {
  const adminDate = formatAdminDate(item.publishDate);
  const departmentName = (item.department || "BAN GIÁM HIỆU").toUpperCase();
  const noticeNumber = `TB-${item.id.toUpperCase()}`;
  const audience = item.targetAudience || "Toàn thể Cán bộ, Giảng viên và Học sinh, Sinh viên";
  const priorityBadge =
    item.priority === "urgent"
      ? `<span class="priority-urgent">HỎA TỐC / KHẨN</span>`
      : "";

  const attachmentsHtml =
    item.attachments && item.attachments.length > 0
      ? `
      <div class="attachments-section">
        <div class="attachments-title">TÀI LIỆU VÀ VĂN BẢN ĐÍNH KÈM:</div>
        <table class="attachments-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">STT</th>
              <th>Tên tài liệu / Văn bản</th>
              <th style="width: 100px; text-align: right;">Dung lượng</th>
            </tr>
          </thead>
          <tbody>
            ${item.attachments
              .map(
                (att, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${escapeHtml(att.name)}</td>
                <td style="text-align: right;">${escapeHtml(att.size)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
      : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Thông báo - ${escapeHtml(item.title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 20mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.45;
      color: #000;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .print-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 10px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .header-table td {
      vertical-align: top;
      padding: 0;
    }
    .org-col {
      width: 48%;
      text-align: center;
    }
    .motto-col {
      width: 52%;
      text-align: center;
    }
    .org-parent {
      font-size: 12pt;
      text-transform: uppercase;
      font-weight: normal;
      margin-bottom: 2px;
    }
    .org-name {
      font-size: 12.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .org-divider {
      width: 100px;
      height: 1px;
      background: #000;
      margin: 4px auto 8px auto;
    }
    .motto-country {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .motto-ideal {
      font-size: 13pt;
      font-weight: bold;
    }
    .motto-divider {
      width: 140px;
      height: 1px;
      background: #000;
      margin: 4px auto 8px auto;
    }
    .doc-meta {
      font-size: 12pt;
      font-style: italic;
      color: #333;
    }
    .title-section {
      text-align: center;
      margin: 28px 0 20px 0;
    }
    .doc-type {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .doc-subject {
      font-size: 13.5pt;
      font-weight: bold;
      line-height: 1.35;
      max-width: 85%;
      margin: 0 auto;
    }
    .recipient-section {
      text-align: center;
      margin-bottom: 20px;
      font-size: 12.5pt;
      font-style: italic;
    }
    .body-section {
      text-align: justify;
      font-size: 13pt;
      line-height: 1.5;
    }
    .body-section p {
      margin: 0 0 12px 0;
      text-indent: 1.27cm;
    }
    .priority-badge {
      display: inline-block;
      margin-bottom: 8px;
    }
    .priority-urgent {
      display: inline-block;
      border: 1.5px solid #b91c1c;
      color: #b91c1c;
      font-weight: bold;
      font-size: 10.5pt;
      padding: 2px 10px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .attachments-section {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #ccc;
    }
    .attachments-title {
      font-weight: bold;
      font-size: 11.5pt;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .attachments-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11pt;
    }
    .attachments-table th,
    .attachments-table td {
      border: 1px solid #ddd;
      padding: 6px 10px;
    }
    .attachments-table th {
      background: #f8fafc;
      font-weight: 600;
    }
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 36px;
      page-break-inside: avoid;
    }
    .signatures-table td {
      padding: 0;
      vertical-align: top;
    }
    .signer-position {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .signer-note {
      font-size: 11pt;
      font-style: italic;
      color: #444;
      margin-bottom: 60px;
    }
    .signer-name {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <table class="header-table">
      <tr>
        <td class="org-col">
          <div class="org-parent">HỆ THỐNG GIÁO DỤC SCHOOLPRO</div>
          <div class="org-name">${escapeHtml(departmentName)}</div>
          <div class="org-divider"></div>
          <div class="doc-meta">Số: ${escapeHtml(noticeNumber)}</div>
        </td>
        <td class="motto-col">
          <div class="motto-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="motto-ideal">Độc lập - Tự do - Hạnh phúc</div>
          <div class="motto-divider"></div>
          <div class="doc-meta">${escapeHtml(adminDate)}</div>
        </td>
      </tr>
    </table>

    <div class="title-section">
      ${priorityBadge ? `<div class="priority-badge">${priorityBadge}</div>` : ""}
      <div class="doc-type">THÔNG BÁO</div>
      <div class="doc-subject">${escapeHtml(item.title)}</div>
    </div>

    <div class="recipient-section">
      Kính gửi: ${escapeHtml(audience)}
    </div>

    <div class="body-section">
      ${item.summary ? `<p style="font-style: italic; font-weight: 500;">${escapeHtml(item.summary)}</p>` : ""}
      <p>${escapeHtml(item.content).replace(/\n/g, "</p><p>")}</p>
    </div>

    ${attachmentsHtml}

    <table class="signatures-table">
      <tr>
        <td style="width: 45%; vertical-align: top; font-size: 11pt;">
          <div style="font-weight: bold; font-style: italic; text-decoration: underline; margin-bottom: 4px;">Nơi nhận:</div>
          <ul style="margin: 0; padding-left: 18px; line-height: 1.4;">
            <li>Như kính gửi;</li>
            <li>Ban Giám hiệu (để b/c);</li>
            <li>Lưu: VT, ${escapeHtml(item.department || "BGH")}.</li>
          </ul>
        </td>
        <td style="width: 55%; vertical-align: top; text-align: center;">
          <div class="signer-position">TM. ${escapeHtml(departmentName)}</div>
          <div class="signer-note">(Đã ký duyệt & xác thực điện tử)</div>
          <div class="signer-name">${escapeHtml(item.author || "BAN GIÁM HIỆU")}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Triggers standard administrative print dialog for the given announcement.
 * Resolves template dynamically from the backend database (sys.export_templates)
 * with robust local fallback.
 */
export async function printAnnouncement(item: AnnouncementItem): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Fetch rendered HTML from backend template or fallback
  const htmlContent = await exportTemplateService.renderAnnouncement(item);

  // Remove existing print iframe if any
  const existingFrame = document.getElementById("schoolpro-announcement-print-frame");
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  // Create clean hidden iframe
  const printIframe = document.createElement("iframe");
  printIframe.id = "schoolpro-announcement-print-frame";
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
    try {
      if (printIframe.parentNode) {
        printIframe.parentNode.removeChild(printIframe);
      }
    } catch {
      // Ignored
    }
  };

  // Wait for iframe content to render and trigger print
  const triggerPrint = () => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(cleanup, 1500);
    }
  };

  if (printIframe.contentWindow) {
    printIframe.contentWindow.onafterprint = cleanup;
  }

  setTimeout(triggerPrint, 250);
}
