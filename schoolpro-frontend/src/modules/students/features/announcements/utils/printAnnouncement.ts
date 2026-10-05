import type { AnnouncementItem } from "../types";

/**
 * Format date string into Vietnamese administrative date string:
 * "Hà Nội, ngày DD tháng MM năm YYYY"
 */
function formatAdminDate(dateStr?: string): string {
  let date: Date;

  if (dateStr) {
    // Check if format is DD/MM/YYYY or YYYY-MM-DD
    const dmyParts = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyParts) {
      date = new Date(Number(dmyParts[3]), Number(dmyParts[2]) - 1, Number(dmyParts[1]));
    } else {
      const parsed = new Date(dateStr);
      date = isNaN(parsed.getTime()) ? new Date() : parsed;
    }
  } else {
    date = new Date();
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `Hà Nội, ngày ${day} tháng ${month} năm ${year}`;
}

/**
 * Escape HTML special characters to prevent injection
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
 * Generate standard administrative print template for SchoolPro announcement
 */
function buildPrintHtml(item: AnnouncementItem): string {
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
    /* Header layout - 2 columns */
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
      margin-bottom: 3px;
    }
    .doc-number {
      font-size: 12pt;
      font-style: normal;
      margin-top: 4px;
    }
    .country-name {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .country-motto {
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 3px;
    }
    .divider-line {
      display: inline-block;
      width: 120px;
      height: 1px;
      background-color: #000;
      margin: 0 auto 6px auto;
    }
    .doc-date {
      font-size: 12pt;
      font-style: italic;
    }
    /* Title */
    .title-section {
      text-align: center;
      margin: 20px 0 24px 0;
    }
    .main-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 6px 0;
    }
    .sub-title {
      font-size: 13pt;
      font-weight: bold;
      margin: 0;
      line-height: 1.4;
    }
    .priority-urgent {
      display: inline-block;
      margin-top: 6px;
      padding: 2px 8px;
      font-size: 11pt;
      font-weight: bold;
      color: #b91c1c;
      border: 1.5px solid #b91c1c;
      text-transform: uppercase;
    }
    /* Recipient / Kính gửi */
    .recipient-section {
      margin-bottom: 18px;
      font-size: 13pt;
    }
    .recipient-title {
      font-weight: bold;
    }
    /* Summary / Căn cứ */
    .summary-box {
      font-style: italic;
      line-height: 1.5;
      text-align: justify;
      margin-bottom: 16px;
      text-indent: 1.25cm;
    }
    /* Content */
    .content-body {
      font-size: 13pt;
      line-height: 1.55;
      text-align: justify;
      white-space: pre-line;
      margin-bottom: 24px;
    }
    .content-body p {
      text-indent: 1.25cm;
      margin: 0 0 8px 0;
    }
    /* Attachments */
    .attachments-section {
      margin-top: 20px;
      margin-bottom: 24px;
      font-size: 12pt;
    }
    .attachments-title {
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
      font-size: 11pt;
    }
    .attachments-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11pt;
    }
    .attachments-table th, .attachments-table td {
      border: 1px solid #333;
      padding: 6px 8px;
    }
    .attachments-table th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    /* Footer Signatures */
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .footer-table td {
      vertical-align: top;
      padding: 0;
    }
    .recipients-col {
      width: 45%;
      font-size: 11pt;
    }
    .recipients-title {
      font-weight: bold;
      font-style: italic;
      margin-bottom: 4px;
    }
    .recipients-list {
      margin: 0;
      padding-left: 14px;
      line-height: 1.4;
    }
    .signature-col {
      width: 55%;
      text-align: center;
    }
    .signer-position {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .signer-hint {
      font-size: 11pt;
      font-style: italic;
      color: #333;
      margin-bottom: 50px;
    }
    .signer-name {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .meta-footer {
      margin-top: 40px;
      padding-top: 8px;
      border-top: 1px dashed #999;
      font-size: 9.5pt;
      color: #555;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td class="org-col">
          <div class="org-parent">HỆ THỐNG GIÁO DỤC SCHOOLPRO</div>
          <div class="org-name">${departmentName}</div>
          <div class="divider-line" style="width: 80px;"></div>
          <div class="doc-number">Số: ${noticeNumber}</div>
        </td>
        <td class="motto-col">
          <div class="country-name">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="country-motto">Độc lập - Tự do - Hạnh phúc</div>
          <div class="divider-line"></div>
          <div class="doc-date">${adminDate}</div>
        </td>
      </tr>
    </table>

    <!-- Title -->
    <div class="title-section">
      <div class="main-title">THÔNG BÁO</div>
      <div class="sub-title">V/v: ${escapeHtml(item.title)}</div>
      ${priorityBadge}
    </div>

    <!-- Audience -->
    <div class="recipient-section">
      <span class="recipient-title">Kính gửi: </span>
      <span>${escapeHtml(audience)}</span>
    </div>

    <!-- Summary -->
    ${
      item.summary
        ? `<div class="summary-box">${escapeHtml(item.summary)}</div>`
        : ""
    }

    <!-- Content -->
    <div class="content-body">${escapeHtml(item.content)}</div>

    <!-- Attachments -->
    ${attachmentsHtml}

    <!-- Signatures -->
    <table class="footer-table">
      <tr>
        <td class="recipients-col">
          <div class="recipients-title">Nơi nhận:</div>
          <ul class="recipients-list">
            <li>Như kính gửi;</li>
            <li>Ban Giám hiệu (để b/c);</li>
            <li>Lưu: VT, ${escapeHtml(item.department || "SP")}.</li>
          </ul>
        </td>
        <td class="signature-col">
          <div class="signer-position">TM. ${departmentName}</div>
          <div class="signer-hint">(Đã ký duyệt & xác thực điện tử)</div>
          <div class="signer-name">${escapeHtml(item.author || "BAN GIÁM HIỆU")}</div>
        </td>
      </tr>
    </table>

    <!-- Meta audit footer -->
    <div class="meta-footer">
      <span>Mã tra cứu điện tử: #${escapeHtml(item.id)}</span>
      <span>Hệ thống Quản lý Học vụ SchoolPro - Thời gian ban hành: ${escapeHtml(item.publishDate)}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Standard enterprise print function for announcements
 * Uses a sandboxed hidden iframe to print cleanly without UI artifacts.
 */
export function printAnnouncement(item: AnnouncementItem): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

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
    // Fallback if iframe access fails
    window.print();
    return;
  }

  const htmlContent = buildPrintHtml(item);
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
      // Clean up iframe after slight delay to ensure print dialog opened
      setTimeout(cleanup, 1500);
    }
  };

  if (printIframe.contentWindow) {
    printIframe.contentWindow.onafterprint = cleanup;
  }

  setTimeout(triggerPrint, 250);
}
