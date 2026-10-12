import dayjs from "dayjs";
import {
  escapeHtml,
  exportTemplateService,
} from "@/shared/services/exportTemplateService";
import {
  formatDateDisplay,
  getLeaveStatusLabel,
  getLeaveTypeLabel,
  getSessionShiftLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

export const DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE = "LEAVE_REQUEST_OFFICIAL_A4";

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
  const reviewerName = item.reviewedByName || homeroomName;
  const studentName = item.studentName || "";
  const studentCode = item.studentCode || "";
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
  const statusLabel = item.isAutoApproved
    ? `${getLeaveStatusLabel(item.status)} (Tự động)`
    : getLeaveStatusLabel(item.status);
  const sessionShiftLabel = getSessionShiftLabel(item.sessionShift);
  const affectedSubjects =
    item.affectedSubjects && item.affectedSubjects.length > 0
      ? item.affectedSubjects.join(", ")
      : "Theo thời khóa biểu";

  const affectedLessons = item.affectedLessons || [];
  const affectedLessonsTableHtml =
    affectedLessons.length > 0
      ? `
      <div style="margin: 8px 0 12px 0;">
        <div style="font-weight: bold; font-size: 11pt; margin-bottom: 4px;">Chi tiết các tiết học xin nghỉ theo Thời khóa biểu:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5pt;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 36px;">STT</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left;">Thứ / Ngày</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px 8px;">Tiết / Khung giờ</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left;">Môn học</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left;">Giáo viên bộ môn</th>
            </tr>
          </thead>
          <tbody>
            ${affectedLessons
              .map(
                (lesson, index) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${escapeHtml(lesson.dayOfWeekLabel)} (${escapeHtml(formatDateDisplay(lesson.date))})</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px 8px; text-align: center;">Tiết ${lesson.periodNumber} (${escapeHtml(lesson.startTime)}-${escapeHtml(lesson.endTime)})</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: bold;">${escapeHtml(lesson.subjectName)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${escapeHtml(lesson.teacherName)}</td>
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

  const teacherNoteRaw = item.teacherNote || "";
  const teacherNoteBlockHtml = teacherNoteRaw
    ? `
      <div class="lr-section-block">
        <div class="lr-section-title">Ý kiến phê duyệt (${escapeHtml(reviewerName)}):</div>
        <div class="lr-section-body"><i>"${escapeHtml(teacherNoteRaw).replace(/\n/g, "<br/>")}"</i></div>
      </div>
    `
    : "";

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
    teacher_note: teacherNoteRaw,
    teacher_note_block_html: teacherNoteBlockHtml,
    template_code: DEFAULT_LEAVE_REQUEST_TEMPLATE_CODE,
    exported_at: dayjs().format("HH:mm DD/MM/YYYY"),
  };
}

/**
 * Local fallback HTML builder when offline or sys.export_templates API is unreachable.
 */
export function buildLeaveRequestFallbackHtml(item: LeaveRequestItem): string {
  const ctx = buildLeaveRequestTemplateContext(item);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(String(ctx.title))}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 18mm 18mm 22mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 11.5pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .print-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 4px;
    }
    .lr-header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .lr-header-left, .lr-header-right {
      vertical-align: top;
      text-align: center;
    }
    .lr-header-left { width: 44%; }
    .lr-header-right { width: 56%; }
    .lr-school-name, .lr-motto-country {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .lr-motto-sub {
      font-size: 11.5pt;
      font-weight: bold;
      margin-top: 2px;
    }
    .lr-class-meta { font-size: 11pt; margin-top: 3px; }
    .lr-code-meta { font-size: 10pt; color: #334155; }
    .lr-admin-date {
      font-size: 11pt;
      font-style: italic;
      text-align: right;
      margin-top: 8px;
    }
    .lr-title-block {
      text-align: center;
      margin: 12px 0 16px 0;
    }
    .lr-doc-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .lr-doc-subtitle {
      font-size: 11pt;
      font-style: italic;
      color: #374151;
      margin-top: 4px;
    }
    .lr-salutation-block, .lr-student-info-block, .lr-intro-line {
      font-size: 11.5pt;
      line-height: 1.55;
      margin-bottom: 10px;
    }
    .lr-salutation-indent { padding-left: 56px; }
    .lr-info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
    }
    .lr-info-table td {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      font-size: 11.5pt;
    }
    .lr-info-label { width: 28%; font-weight: bold; }
    .lr-section-block {
      margin-bottom: 10px;
      font-size: 11.5pt;
      line-height: 1.55;
    }
    .lr-section-title { font-weight: bold; margin-bottom: 3px; }
    .lr-section-body { text-align: justify; }
    .lr-signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 22px;
      page-break-inside: avoid;
    }
    .lr-signature-table td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
    }
    .lr-sig-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
    .lr-sig-note { font-size: 10.5pt; font-style: italic; color: #475569; }
    .lr-sig-space { height: 58px; }
    .lr-sig-name { font-size: 11.5pt; font-weight: bold; }
    .lr-audit-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 9pt;
      color: #64748b;
      border-top: 1px dashed #cbd5e1;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <table class="lr-header-table">
      <tr>
        <td class="lr-header-left">
          <div class="lr-school-name">${escapeHtml(String(ctx.school_name))}</div>
          <div class="lr-class-meta">LỚP: <strong>${escapeHtml(String(ctx.class_name))}</strong></div>
          <div class="lr-code-meta">Mã đơn: ${escapeHtml(String(ctx.code))}</div>
        </td>
        <td class="lr-header-right">
          <div class="lr-motto-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="lr-motto-sub"><u>Độc lập - Tự do - Hạnh phúc</u></div>
          <div class="lr-admin-date">${escapeHtml(String(ctx.created_date_admin))}</div>
        </td>
      </tr>
    </table>

    <div class="lr-title-block">
      <div class="lr-doc-title">${escapeHtml(String(ctx.document_title))}</div>
      <div class="lr-doc-subtitle">(Phân loại: ${escapeHtml(String(ctx.leave_type_label))} • Trạng thái: ${escapeHtml(String(ctx.status_label))})</div>
    </div>

    <div class="lr-salutation-block">
      <div><strong>Kính gửi:</strong> - Ban Giám hiệu ${escapeHtml(String(ctx.school_name_title))}</div>
      <div class="lr-salutation-indent">- Thầy/Cô Giáo viên chủ nhiệm lớp ${escapeHtml(String(ctx.class_name))}: <strong>${escapeHtml(String(ctx.homeroom_teacher_name))}</strong> (Người xét duyệt)</div>
      <div class="lr-salutation-indent">- Quý Thầy/Cô giáo bộ môn giảng dạy lớp ${escapeHtml(String(ctx.class_name))}</div>
    </div>

    <div class="lr-student-info-block">
      <div>
        Em tên là: <strong>${escapeHtml(String(ctx.student_name))}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Mã số học sinh: <strong>${escapeHtml(String(ctx.student_code))}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Lớp: <strong>${escapeHtml(String(ctx.class_name))}</strong>
      </div>
      <div>
        Họ và tên Phụ huynh xác nhận: <strong>${escapeHtml(String(ctx.guardian_name))}</strong> (${escapeHtml(String(ctx.guardian_relationship))})${String(ctx.guardian_phone_suffix || "")}
      </div>
    </div>

    <div class="lr-intro-line">
      Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:
    </div>

    <table class="lr-info-table">
      <tr>
        <td class="lr-info-label">Thời gian xin nghỉ:</td>
        <td class="lr-info-value">${escapeHtml(String(ctx.date_range_text))}</td>
      </tr>
      <tr>
        <td class="lr-info-label">Số ngày &amp; Ca nghỉ:</td>
        <td class="lr-info-value"><strong>${String(ctx.total_days)} ngày</strong> (${escapeHtml(String(ctx.session_shift_label))})</td>
      </tr>
      <tr>
        <td class="lr-info-label">Các môn học xin nghỉ:</td>
        <td class="lr-info-value">${escapeHtml(String(ctx.affected_subjects))}</td>
      </tr>
    </table>

    ${String(ctx.affected_lessons_table_html || "")}

    <div class="lr-section-block">
      <div class="lr-section-title">Lý do xin nghỉ học chi tiết:</div>
      <div class="lr-section-body">${String(ctx.reason_html || "")}</div>
    </div>

    <div class="lr-section-block">
      <div class="lr-section-title">Lời hứa và cam kết của học sinh:</div>
      <div class="lr-section-body">${String(ctx.commitment_html || "")}</div>
    </div>

    ${String(ctx.teacher_note_block_html || "")}

    <table class="lr-signature-table">
      <tr>
        <td>
          <div class="lr-sig-title">XÁC NHẬN CỦA PHỤ HUYNH</div>
          <div class="lr-sig-note">(Ký và ghi rõ họ tên)</div>
          <div class="lr-sig-space"></div>
          <div class="lr-sig-name">${escapeHtml(String(ctx.guardian_name))}</div>
        </td>
        <td>
          <div class="lr-sig-title">GIÁO VIÊN CHỦ NHIỆM</div>
          <div class="lr-sig-note">(${escapeHtml(String(ctx.status_label))})</div>
          <div class="lr-sig-space"></div>
          <div class="lr-sig-name">${escapeHtml(String(ctx.reviewer_name))}</div>
        </td>
        <td>
          <div class="lr-sig-title">HỌC SINH LÀM ĐƠN</div>
          <div class="lr-sig-note">(Ký và ghi rõ họ tên)</div>
          <div class="lr-sig-space"></div>
          <div class="lr-sig-name">${escapeHtml(String(ctx.student_name))}</div>
        </td>
      </tr>
    </table>

    <div class="lr-audit-footer">
      Trích xuất từ Hệ thống Quản lý Học vụ SchoolPro • Mã đơn: ${escapeHtml(String(ctx.code))} • Biểu mẫu: ${escapeHtml(String(ctx.template_code))} • Thời gian xuất: ${escapeHtml(String(ctx.exported_at))}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers browser print dialog for a leave request using the dynamic template
 * stored in sys.export_templates (with custom HTML, CSS, margins, page size).
 */
export async function printLeaveRequest(
  item: LeaveRequestItem,
  options?: { templateCode?: string; templateId?: string },
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const htmlContent = await exportTemplateService.renderLeaveRequest(item, options);

  const existingFrame = document.getElementById("schoolpro-leave-request-print-frame");
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const printIframe = document.createElement("iframe");
  printIframe.id = "schoolpro-leave-request-print-frame";
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
