import { httpClient } from "@/shared/api/httpClient";
import type { ExportTemplate, RenderTemplateResponse } from "@/shared/types/exportTemplate";
import type { AnnouncementItem } from "@/modules/students/features/announcements/types";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE,
  buildLeaveRequestFallbackHtml,
  buildLeaveRequestTemplateContext,
} from "@/modules/students/features/leave-requests/utils/printLeaveRequest";

/**
 * Format date string into Vietnamese administrative date string:
 * "Hà Nội, ngày DD tháng MM năm YYYY"
 */
export function formatAdminDate(dateStr?: string): string {
  let date: Date;

  if (dateStr) {
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
export function escapeHtml(text?: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Built-in fallback template string when offline or API is unavailable.
 */
function buildLocalFallbackHtml(item: AnnouncementItem): string {
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
 * Enterprise Service for retrieving and rendering export/print templates.
 * Connects to sys.export_templates API and supports seamless offline fallback.
 */
class ExportTemplateService {
  /**
   * Retrieves an active template by its unique code (e.g. ANNOUNCEMENT_OFFICIAL_A4).
   */
  async getActiveTemplateByCode(code: string): Promise<ExportTemplate | null> {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: ExportTemplate;
      }>("/system/export-templates/active-by-code/", {
        params: { code },
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves or auto-seeds the official default announcement template.
   */
  async getDefaultAnnouncementTemplate(): Promise<ExportTemplate | null> {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: ExportTemplate;
      }>("/system/export-templates/default-announcement/");

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves or auto-seeds the official default leave request template from sys.export_templates.
   */
  async getDefaultLeaveRequestTemplate(): Promise<ExportTemplate | null> {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: ExportTemplate;
      }>("/system/export-templates/default-leave-request/");

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Renders template on backend via POST /system/export-templates/:id/render/
   */
  async renderTemplateOnServer(
    templateId: string,
    context: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        data: RenderTemplateResponse;
      }>(`/system/export-templates/${templateId}/render/`, {
        context,
      });

      if (response.data?.data?.html) {
        return response.data.data.html;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Resolves a placeholder path (including nested dot notation like school.name) from context.
   */
  private resolveContextValue(merged: Record<string, unknown>, keyPath: string): string {
    const parts = keyPath.trim().split(".");
    let current: unknown = merged;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return "";
      }
    }
    return current !== undefined && current !== null ? String(current) : "";
  }

  /**
   * Resolves dynamic filename based on template configuration (sample_data.filename_pattern, file_format, etc.).
   */
  resolveExportFilename(
    template: ExportTemplate | null | undefined,
    context: Record<string, unknown>,
    defaultPrefix = "Tai_Lieu",
    extensionOverride?: string,
  ): string {
    const merged: Record<string, unknown> = {
      ...(template?.sample_data || {}),
      ...context,
    };

    const extMap: Record<string, string> = {
      PDF: "pdf",
      HTML_PRINT: "html",
      WORD: "doc",
      EXCEL: "xlsx",
    };
    const ext = (
      extensionOverride ||
      (template?.file_format ? extMap[template.file_format] : undefined) ||
      "pdf"
    )
      .replace(/^\./, "")
      .toLowerCase();

    const rawPattern = String(
      merged.filename_pattern ||
        template?.sample_data?.filename_pattern ||
        `${defaultPrefix}_{{code}}`,
    );

    const interpolated = rawPattern.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) =>
      this.resolveContextValue(merged, key),
    );
    const safeBase =
      interpolated.replace(/[\\/*?:"<>|#\s]+/g, "_").replace(/^_+|_+$/g, "") || defaultPrefix;

    if (safeBase.toLowerCase().endsWith(`.${ext}`)) {
      return safeBase;
    }
    return `${safeBase}.${ext}`;
  }

  /**
   * Client-side template renderer substituting {{ placeholder }} tags,
   * custom CSS (style_content), margins, page_size, page_orientation, and watermark_text.
   */
  renderClientSide(template: ExportTemplate, context: Record<string, unknown>): string {
    const merged: Record<string, unknown> = {
      ...(template.sample_data || {}),
      ...context,
    };

    const replaceTags = (text: string) => {
      return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) =>
        this.resolveContextValue(merged, key),
      );
    };

    const header = replaceTags(template.header_content || "");
    const body = replaceTags(template.content || "");
    const footer = replaceTags(template.footer_content || "");
    const style = replaceTags(template.style_content || "");
    const pageSize = template.page_size || "A4";
    const pageOrientation = (template.page_orientation || "PORTRAIT").toLowerCase();
    const margins = template.margins || {};
    const marginTop = margins.top || "20mm";
    const marginRight = margins.right || "15mm";
    const marginBottom = margins.bottom || "20mm";
    const marginLeft = margins.left || "20mm";

    const watermarkHtml = template.watermark_text
      ? `<div class="export-watermark" style="position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 44pt; color: rgba(100, 116, 139, 0.09); font-weight: bold; white-space: nowrap; pointer-events: none; z-index: 0;">${escapeHtml(replaceTags(template.watermark_text))}</div>`
      : "";

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(String(merged.title || template.name))}</title>
  <style>
    @page {
      size: ${pageSize} ${pageOrientation};
      margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
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
      position: relative;
      z-index: 1;
    }
    ${style}
  </style>
</head>
<body>
  ${watermarkHtml}
  <div class="print-container">
    ${header}
    ${body}
    ${footer}
  </div>
</body>
</html>`;
  }

  /**
   * Builds standardized placeholder variables from an AnnouncementItem.
   */
  buildAnnouncementContext(item: AnnouncementItem): Record<string, unknown> {
    const adminDate = formatAdminDate(item.publishDate);
    const departmentName = (item.department || "BAN GIÁM HIỆU").toUpperCase();
    const departmentCode = item.department ? "ĐT-HV" : "BGH";
    const noticeNumber = `TB-${item.id.toUpperCase()}`;
    const audience = item.targetAudience || "Toàn thể Cán bộ, Giảng viên và Học sinh, Sinh viên";
    const priorityBadge =
      item.priority === "urgent"
        ? `<span class="priority-urgent">HỎA TỐC</span>`
        : "";

    const attachmentsHtml =
      item.attachments && item.attachments.length > 0
        ? `
        <div class="attachments-section" style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #ccc;">
          <div style="font-weight: bold; font-size: 11.5pt; text-transform: uppercase; margin-bottom: 8px;">TÀI LIỆU VÀ VĂN BẢN ĐÍNH KÈM:</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="width: 40px; text-align: center; border: 1px solid #ddd; padding: 6px 10px;">STT</th>
                <th style="border: 1px solid #ddd; padding: 6px 10px;">Tên tài liệu / Văn bản</th>
                <th style="width: 100px; text-align: right; border: 1px solid #ddd; padding: 6px 10px;">Dung lượng</th>
              </tr>
            </thead>
            <tbody>
              ${item.attachments
                .map(
                  (att, index) => `
                <tr>
                  <td style="text-align: center; border: 1px solid #ddd; padding: 6px 10px;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 6px 10px;">${escapeHtml(att.name)}</td>
                  <td style="text-align: right; border: 1px solid #ddd; padding: 6px 10px;">${escapeHtml(att.size)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
        : "";

    return {
      school_parent_name: "HỆ THỐNG GIÁO DỤC SCHOOLPRO",
      department_name: departmentName,
      department_code: departmentCode,
      notice_number: noticeNumber,
      admin_date: adminDate,
      title: item.title,
      priority_badge: priorityBadge,
      audience: audience,
      summary: item.summary ? `<p style="font-style: italic; font-weight: 500;">${escapeHtml(item.summary)}</p>` : "",
      content: escapeHtml(item.content).replace(/\n/g, "</p><p>"),
      attachments_html: attachmentsHtml,
      author: item.author || "Ban Giám Hiệu",
      notice_id: item.id,
      publish_date: item.publishDate || "",
    };
  }

  /**
   * Main entry point to generate print-ready HTML for an announcement.
   * Priority:
   * 1. Fetches active template from backend database.
   * 2. Renders via backend API or client-side interpolation.
   * 3. Seamlessly falls back to local administrative template if API fails.
   */
  async renderAnnouncement(item: AnnouncementItem): Promise<string> {
    const context = this.buildAnnouncementContext(item);

    try {
      // Step 1: Find active template in database
      const template =
        (await this.getActiveTemplateByCode("ANNOUNCEMENT_OFFICIAL_A4")) ||
        (await this.getDefaultAnnouncementTemplate());

      if (template) {
        // Step 2a: Try server-side rendering
        if (template.id) {
          const serverHtml = await this.renderTemplateOnServer(template.id, context);
          if (serverHtml) {
            return serverHtml;
          }
        }

        // Step 2b: Client-side render if server render failed
        if (template.content) {
          return this.renderClientSide(template, context);
        }
      }
    } catch {
      // Ignored: fallback below
    }

    // Step 3: Local fallback
    return buildLocalFallbackHtml(item);
  }

  /**
   * Builds standardized placeholder variables from a LeaveRequestItem.
   */
  buildLeaveRequestContext(item: LeaveRequestItem): Record<string, unknown> {
    return buildLeaveRequestTemplateContext(item);
  }

  /**
   * Generates print/export-ready HTML for a LeaveRequestItem using the dynamic
   * ExportTemplate in sys.export_templates:
   * 1. Fetches active template by code (or default leave request template).
   * 2. Renders via backend /system/export-templates/:id/render/ or client-side interpolation.
   * 3. Falls back to local administrative template if offline.
   */
  async renderLeaveRequest(
    item: LeaveRequestItem,
    options?: { templateCode?: string; templateId?: string },
  ): Promise<string> {
    const context = this.buildLeaveRequestContext(item);
    const codeToResolve = options?.templateCode || DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE;

    try {
      const template =
        (await this.getActiveTemplateByCode(codeToResolve)) ||
        (await this.getDefaultLeaveRequestTemplate());

      if (template) {
        const mergedContext = {
          ...context,
          template_code: template.code || codeToResolve,
        };

        if (template.id) {
          const serverHtml = await this.renderTemplateOnServer(template.id, mergedContext);
          if (serverHtml) {
            return serverHtml;
          }
        }

        if (template.content) {
          return this.renderClientSide(template, mergedContext);
        }
      }
    } catch {
      // Ignored: fallback below
    }

    return buildLeaveRequestFallbackHtml(item);
  }
}

export const exportTemplateService = new ExportTemplateService();
