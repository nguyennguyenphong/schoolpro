import dayjs from "dayjs";
import { message } from "@/components/ui/Message";
import {
  escapeHtml,
  exportTemplateService,
} from "@/shared/services/exportTemplateService";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services/leaveRequestsService";
import {
  formatDateDisplay,
  getLeaveStatusLabel,
  getLeaveTypeLabel,
  getSessionShiftLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

export const DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE = "LEAVE_REQUEST_OFFICIAL_A4";

export interface PrintLeaveRequestOptions {
  templateCode?: string;
  templateId?: string;
}

/**
 * Builds standardized placeholder variables from a LeaveRequestItem
 * for rendering against sys.export_templates.
 */
export function buildLeaveRequestTemplateContext(
  item: LeaveRequestItem,
): Record<string, unknown> {
  const code = (item.code || item.requestCode || item.id || "DON").replace("#", "");
  const className = item.className || "10A1";
  const homeroomName = item.homeroomTeacherName || "Giáo viên chủ nhiệm";
  const reviewerName = homeroomName;
  const studentName = item.studentName || "";
  const studentCode = item.studentCode || "";
  const studentDob = item.studentDob
    ? formatDateDisplay(item.studentDob)
    : "...................................";
  const guardianName = item.guardianName || "Phụ huynh học sinh";
  const guardianRelationship = item.guardianRelationship || "Phụ huynh";
  const guardianPhone = item.guardianPhone || "";
  const guardianPhoneSuffix = guardianPhone
    ? ` — SĐT: <strong>${escapeHtml(guardianPhone)}</strong>`
    : "";

  const startFmt = formatDateDisplay(item.startDate);
  const endFmt = formatDateDisplay(item.endDate || item.startDate);
  const dateRangeText =
    item.startDate === item.endDate
      ? `Ngày ${startFmt}`
      : `Từ ngày ${startFmt} đến hết ngày ${endFmt}`;

  const createdParsed = item.createdAt ? dayjs(item.createdAt) : dayjs();
  const validCreated = createdParsed.isValid() ? createdParsed : dayjs();
  const createdDateAdmin = `Ngày ${validCreated.format("DD")} tháng ${validCreated.format("MM")} năm ${validCreated.format("YYYY")}`;

  const leaveTypeLabel = getLeaveTypeLabel(item.leaveType);
  const statusLabel = getLeaveStatusLabel(item.status);
  const sessionShiftLabel = getSessionShiftLabel(item.sessionShift);
  const affectedSubjects =
    item.affectedSubjects && item.affectedSubjects.length > 0
      ? item.affectedSubjects.join(", ")
      : "Theo thời khóa biểu";

  const affectedLessons = item.affectedLessons || [];
  const affectedLessonsTableHtml =
    affectedLessons.length > 0
      ? `
      <div style="margin: 8px 0 10px 0;">
        <div style="font-weight: bold; font-size: 12pt; margin-bottom: 5px;">Chi tiết các tiết học xin nghỉ theo Thời khóa biểu:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-top: 4px;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="border: 1px solid #777; padding: 5px 6px; width: 40px; text-align: center;">STT</th>
              <th style="border: 1px solid #777; padding: 5px 6px; text-align: left; width: 180px;">Thứ / Ngày</th>
              <th style="border: 1px solid #777; padding: 5px 6px; text-align: center; width: 170px;">Tiết / Khung giờ</th>
              <th style="border: 1px solid #777; padding: 5px 6px; text-align: left;">Môn học</th>
              <th style="border: 1px solid #777; padding: 5px 6px; text-align: left; width: 160px;">Giáo viên bộ môn</th>
            </tr>
          </thead>
          <tbody>
            ${affectedLessons
              .map(
                (lesson, index) => `
              <tr>
                <td style="border: 1px solid #777; padding: 4px 6px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #777; padding: 4px 6px;">${escapeHtml(lesson.dayOfWeekLabel)} (${escapeHtml(formatDateDisplay(lesson.date))})</td>
                <td style="border: 1px solid #777; padding: 4px 6px; text-align: center;">Tiết ${lesson.periodNumber} (${escapeHtml(lesson.startTime)}-${escapeHtml(lesson.endTime)})</td>
                <td style="border: 1px solid #777; padding: 4px 6px; font-weight: bold;">${escapeHtml(lesson.subjectName)}</td>
                <td style="border: 1px solid #777; padding: 4px 6px;">${escapeHtml(lesson.teacherName)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
      : "";

  const reasonRaw = item.reason || "";
  const reasonHtml = escapeHtml(reasonRaw).replace(/\n/g, "<br/>");
  const commitmentRaw =
    item.commitment ||
    "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.";
  const commitmentHtml = escapeHtml(commitmentRaw).replace(/\n/g, "<br/>");

  const approvalCheckboxes =
    item.status === "approved"
      ? "☑ Đồng ý cho nghỉ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý"
      : item.status === "rejected"
        ? "☐ Đồng ý cho nghỉ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☑ Không đồng ý"
        : "☐ Đồng ý cho nghỉ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý";

  let teacherNoteDisplay = "................................................................................................................................";
  if (
    item.teacherNote &&
    !item.teacherNote.toLowerCase().includes("quá hạn") &&
    !item.teacherNote.toLowerCase().includes("tự động") &&
    !item.teacherNote.toLowerCase().includes("hệ thống")
  ) {
    teacherNoteDisplay = escapeHtml(item.teacherNote);
  } else if (item.status === "approved") {
    teacherNoteDisplay = "Đồng ý cho học sinh nghỉ học có phép.";
  } else if (item.status === "rejected") {
    teacherNoteDisplay = "Không đồng ý";
  }

  return {
    title: `Đơn xin phép nghỉ học - ${code}`,
    document_title: "ĐƠN XIN PHÉP NGHỈ HỌC",
    school_name: "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    school_name_title: "Trường Trung học phổ thông SchoolPro",
    code,
    class_name: className,
    created_date_admin: createdDateAdmin,
    leave_type: item.leaveType,
    leave_type_label: leaveTypeLabel,
    status: item.status,
    status_label: statusLabel,
    session_shift: item.sessionShift,
    session_shift_label: sessionShiftLabel,
    homeroom_teacher_name: homeroomName,
    homeroom_teacher_email: item.homeroomTeacherEmail || "",
    reviewer_name: reviewerName,
    reviewed_at: item.reviewedAt || "",
    student_name: studentName,
    student_code: studentCode,
    student_dob: studentDob,
    guardian_name: guardianName,
    guardian_relationship: guardianRelationship,
    guardian_phone: guardianPhone,
    guardian_phone_suffix: guardianPhoneSuffix,
    start_date: startFmt,
    end_date: endFmt,
    date_range_text: dateRangeText,
    total_days: item.totalDays,
    affected_subjects: affectedSubjects,
    affected_lessons_table_html: affectedLessonsTableHtml,
    reason: reasonRaw,
    reason_html: reasonHtml,
    commitment: commitmentRaw,
    commitment_html: commitmentHtml,
    approval_checkboxes: approvalCheckboxes,
    teacher_note_display: teacherNoteDisplay,
    teacher_note: item.teacherNote || "",
    template_code: DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE,
    exported_at: dayjs().format("HH:mm DD/MM/YYYY"),
  };
}

/**
 * Local fallback HTML builder matching sys.export_templates LEAVE_REQUEST_OFFICIAL_A4
 * when offline or when backend export API is unreachable.
 */
export function buildLeaveRequestFallbackHtml(item: LeaveRequestItem): string {
  const ctx = buildLeaveRequestTemplateContext(item);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Đơn xin phép nghỉ học - ${escapeHtml(String(ctx.student_name))}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 12mm 16mm; }
    html, body { margin: 0; padding: 0; }
    body {
      background: #ededed;
      color: #111;
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 14mm 18mm;
      background: #fff;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    }
    .header {
      display: table;
      width: 100%;
      margin-bottom: 14px;
      font-size: 11.5pt;
      line-height: 1.28;
    }
    .header-left {
      display: table-cell;
      width: 44%;
      text-align: center;
      vertical-align: top;
    }
    .header-right {
      display: table-cell;
      width: 56%;
      text-align: center;
      vertical-align: top;
    }
    .school { font-weight: bold; text-transform: uppercase; font-size: 11.5pt; }
    .school-line { width: 75%; border-top: 1px solid #222; margin: 5px auto 0; }
    .nation { font-weight: bold; text-transform: uppercase; font-size: 11.5pt; }
    .motto { font-weight: bold; margin-top: 3px; font-size: 12pt; }
    .motto-line { width: 48%; border-top: 1px solid #222; margin: 5px auto 0; }
    h1 {
      text-align: center;
      font-size: 16pt;
      text-transform: uppercase;
      margin: 16px 0 12px;
      font-weight: bold;
      line-height: 1.2;
    }
    .recipient { text-align: center; margin: 0 0 14px; line-height: 1.5; font-size: 12.5pt; }
    p { margin: 6px 0; text-align: justify; }
    .field { margin: 5px 0; font-size: 12.5pt; }
    .indent { text-indent: 28px; font-size: 12.5pt; }
    .lr-info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 8px 0;
    }
    .lr-info-table td {
      border: 1px solid #777;
      padding: 4px 8px;
      font-size: 12pt;
    }
    .lr-info-label {
      width: 30%;
      font-weight: bold;
      background: #fbfbfb;
    }
    .date { text-align: right; font-style: italic; margin-top: 12px; font-size: 12pt; }
    .signatures-row {
      display: table;
      width: 100%;
      margin-top: 8px;
      page-break-inside: avoid;
    }
    .signature {
      display: table-cell;
      width: 50%;
      text-align: center;
      vertical-align: top;
    }
    .sign-title { font-weight: bold; text-transform: uppercase; font-size: 11.5pt; }
    .sign-note { font-style: italic; font-size: 11pt; }
    .sign-space { height: 40px; }
    .sign-name { font-weight: bold; font-size: 12.5pt; }
    .approval {
      margin-top: 12px;
      border-top: 1px solid #777;
      padding-top: 8px;
      page-break-inside: avoid;
    }
    .approval-title {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12pt;
      margin-bottom: 5px;
    }
    .approval p { text-align: left; margin: 4px 0; font-size: 12pt; }
    .approval-sign {
      text-align: center;
      width: 52%;
      margin: 6px 0 0 auto;
    }
    .approval-sign .sign-space { height: 36px; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .page { width: 100% !important; min-height: auto !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div class="header-left">
        <div class="school">${escapeHtml(String(ctx.school_name))}</div>
        <div class="school-line"></div>
      </div>
      <div class="header-right">
        <div class="nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
        <div class="motto-line"></div>
      </div>
    </header>

    <h1>ĐƠN XIN PHÉP NGHỈ HỌC</h1>

    <div class="recipient">
      <div><strong>Kính gửi:</strong> - Ban Giám hiệu ${escapeHtml(String(ctx.school_name_title))}</div>
      <div>- Thầy/Cô Giáo viên chủ nhiệm lớp ${escapeHtml(String(ctx.class_name))}: <strong>${escapeHtml(String(ctx.homeroom_teacher_name))}</strong></div>
      <div>- Quý Thầy/Cô giáo giảng dạy các môn học</div>
    </div>

    <p class="field">Em tên là: <strong>${escapeHtml(String(ctx.student_name))}</strong></p>
    <p class="field">Mã học sinh: <strong>${escapeHtml(String(ctx.student_code))}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lớp: <strong>${escapeHtml(String(ctx.class_name))}</strong></p>
    <p class="field">Ngày, tháng, năm sinh: <strong>${escapeHtml(String(ctx.student_dob))}</strong></p>
    <p class="field">Họ và tên Phụ huynh: <strong>${escapeHtml(String(ctx.guardian_name))}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SĐT liên hệ: <strong>${escapeHtml(String(ctx.guardian_phone || ""))}</strong></p>

    <p class="indent">
      Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:
    </p>

    <table class="lr-info-table">
      <tr>
        <td class="lr-info-label">Thời gian xin nghỉ:</td>
        <td>${escapeHtml(String(ctx.date_range_text))}</td>
      </tr>
      <tr>
        <td class="lr-info-label">Số ngày &amp; Ca nghỉ:</td>
        <td><strong>${String(ctx.total_days)} ngày</strong> (${escapeHtml(String(ctx.session_shift_label))})</td>
      </tr>
      <tr>
        <td class="lr-info-label">Các môn học xin nghỉ:</td>
        <td>${escapeHtml(String(ctx.affected_subjects))}</td>
      </tr>
    </table>

    ${String(ctx.affected_lessons_table_html || "")}

    <div class="field" style="margin: 5px 0;">
      <strong>Lý do xin nghỉ học:</strong><br>
      <div style="margin: 3px 0 5px 0; padding: 4px 8px; background: #fafafa; border-left: 3px solid #234f75; text-align: justify; font-size: 12pt;">
        ${String(ctx.reason_html || "")}
      </div>
    </div>

    <p class="indent">
      ${String(ctx.commitment_html || "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.")}
    </p>

    <p class="indent">
      Kính mong Thầy/Cô xem xét và tạo điều kiện cho em được phép nghỉ học. Em xin chân thành cảm ơn!
    </p>

    <div class="date">${escapeHtml(String(ctx.created_date_admin))}</div>

    <div class="signatures-row">
      <div class="signature">
        <div class="sign-title">Ý KIẾN CỦA PHỤ HUYNH</div>
        <div class="sign-note">(Ký và ghi rõ họ tên)</div>
        <div class="sign-space"></div>
        <div class="sign-name">${escapeHtml(String(ctx.guardian_name))}</div>
      </div>
      <div class="signature">
        <div class="sign-title">NGƯỜI LÀM ĐƠN</div>
        <div class="sign-note">(Ký và ghi rõ họ tên)</div>
        <div class="sign-space"></div>
        <div class="sign-name">${escapeHtml(String(ctx.student_name))}</div>
      </div>
    </div>

    <section class="approval">
      <div class="approval-title">Ý KIẾN PHÊ DUYỆT CỦA GIÁO VIÊN CHỦ NHIỆM</div>
      <p style="margin: 4px 0;">
        Tình trạng phê duyệt: &nbsp;&nbsp;&nbsp;&nbsp;
        <span style="font-family: DejaVu Sans, Arial, sans-serif;">${String(ctx.approval_checkboxes || "☐ Đồng ý cho nghỉ &nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý")}</span>
      </p>
      <p style="margin: 4px 0;">
        Ý kiến bổ sung: <em>${String(ctx.teacher_note_display || "Không có")}</em>
      </p>
      <div class="approval-sign">
        <div class="sign-title">GIÁO VIÊN CHỦ NHIỆM</div>
        <div class="sign-note">(${escapeHtml(String(ctx.status_label))})</div>
        <div class="sign-space"></div>
        <div class="sign-name">${escapeHtml(String(ctx.homeroom_teacher_name))}</div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

/**
 * Triggers browser print dialog for a leave request, synchronized with timetable printing:
 * 1. Opens print window immediately to avoid browser popup blockers.
 * 2. Fetches rendered HTML directly from backend sys.export_templates via GET /academic/leave-requests/:id/export-render/
 * 3. Falls back gracefully to exportTemplateService / local template if backend API is unreachable.
 * 4. Injects HTML into the window (or off-screen Blob iframe) and triggers window.print().
 */
export async function printLeaveRequest(
  item: LeaveRequestItem,
  options?: PrintLeaveRequestOptions,
): Promise<void> {
  const safeCode = (item.code || item.requestCode || item.id || "DON").replace("#", "");
  let printDocTitle = `Don_Xin_Nghi_Phep_${safeCode}_${dayjs(item.startDate).format("YYYYMMDD")}`;

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
              <div style="font-size: 15px; font-weight: 600;">Đang chuẩn bị bản in đơn xin phép nghỉ học...</div>
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

  // 2. Fetch rendered HTML from backend dynamic ExportTemplate (table sys.export_templates)
  let htmlContent = "";
  try {
    const rendered = await leaveRequestsService.renderLeaveRequestExport(item.id, options);
    if (rendered?.html) {
      htmlContent = rendered.html;
      if (rendered.filename) {
        printDocTitle = rendered.filename.replace(/\.[^/.]+$/, "");
      }
    }
  } catch {
    // Backend render failed
  }

  // 3. If backend did not return html, fallback to exportTemplateService
  if (!htmlContent) {
    try {
      htmlContent = await exportTemplateService.renderLeaveRequest(item, options);
    } catch {
      // Ignored
    }
  }

  // 4. If still no html, report error and cleanup
  if (!htmlContent) {
    if (printWindow && !printWindow.closed) {
      printWindow.close();
    }
    message.error({
      content: "Không thể tải biểu mẫu in đơn xin nghỉ phép từ máy chủ. Vui lòng thử lại sau.",
      key: "print_leave_request_error",
    });
    return;
  }

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
    const existingFrame = document.getElementById("schoolpro-leave-request-print-frame");
    if (existingFrame) existingFrame.remove();

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const blobUrl = window.URL.createObjectURL(blob);

    const printIframe = document.createElement("iframe");
    printIframe.id = "schoolpro-leave-request-print-frame";
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
