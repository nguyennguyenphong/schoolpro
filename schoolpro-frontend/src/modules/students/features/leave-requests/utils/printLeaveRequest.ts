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
  const reviewerName = item.reviewedByName || homeroomName;
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
      <div style="margin: 12px 0 16px 0;">
        <div style="font-weight: bold; font-size: 13pt; margin-bottom: 6px;">Chi tiết các tiết học xin nghỉ theo Thời khóa biểu:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13pt; margin-top: 6px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="border: 1px solid #111; padding: 6px 8px; width: 45px; text-align: center;">STT</th>
              <th style="border: 1px solid #111; padding: 6px 8px; text-align: left; width: 180px;">Thứ / Ngày</th>
              <th style="border: 1px solid #111; padding: 6px 8px; text-align: center; width: 170px;">Tiết / Khung giờ</th>
              <th style="border: 1px solid #111; padding: 6px 8px; text-align: left;">Môn học</th>
              <th style="border: 1px solid #111; padding: 6px 8px; text-align: left; width: 160px;">Giáo viên bộ môn</th>
            </tr>
          </thead>
          <tbody>
            ${affectedLessons
              .map(
                (lesson, index) => `
              <tr>
                <td style="border: 1px solid #111; padding: 6px 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #111; padding: 6px 8px;">${escapeHtml(lesson.dayOfWeekLabel)} (${escapeHtml(formatDateDisplay(lesson.date))})</td>
                <td style="border: 1px solid #111; padding: 6px 8px; text-align: center;">Tiết ${lesson.periodNumber} (${escapeHtml(lesson.startTime)}-${escapeHtml(lesson.endTime)})</td>
                <td style="border: 1px solid #111; padding: 6px 8px; font-weight: bold;">${escapeHtml(lesson.subjectName)}</td>
                <td style="border: 1px solid #111; padding: 6px 8px;">${escapeHtml(lesson.teacherName)}</td>
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
      ? "[x] Đồng ý &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ ] Không đồng ý"
      : item.status === "rejected"
        ? "[ ] Đồng ý &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [x] Không đồng ý"
        : "[ ] Đồng ý &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ ] Không đồng ý";

  const teacherNoteDisplay = item.teacherNote
    ? escapeHtml(item.teacherNote)
    : item.status === "approved" || item.status === "rejected"
      ? "Không có ý kiến bổ sung"
      : "................................................................................................................................";

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
    @page { size: A4 portrait; margin: 20mm 22mm; }
    body {
      margin: 0;
      background: #ededed;
      color: #111;
      font-family: "Times New Roman", Times, serif;
      font-size: 14pt;
      line-height: 1.45;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 20px;
      padding: 20mm 22mm;
      background: #fff;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    }
    .header {
      display: grid;
      grid-template-columns: 0.9fr 1.4fr;
      gap: 16px;
      align-items: start;
      text-align: center;
      font-size: 12pt;
      line-height: 1.3;
    }
    .school { font-weight: bold; text-transform: uppercase; }
    .school-line { width: 75%; border-top: 1px solid #222; margin: 7px auto 0; }
    .nation { font-weight: bold; text-transform: uppercase; }
    .motto { font-weight: bold; margin-top: 4px; }
    .motto-line { width: 46%; border-top: 1px solid #222; margin: 6px auto 0; }
    h1 {
      text-align: center;
      font-size: 18pt;
      text-transform: uppercase;
      margin: 28px 0 22px;
      font-weight: bold;
      line-height: 1.25;
    }
    .recipient { text-align: center; margin: 0 0 20px; line-height: 1.65; }
    p { margin: 10px 0; text-align: justify; }
    .field { margin: 8px 0; }
    .line {
      display: inline-block;
      border-bottom: 1px dotted #555;
      min-width: 95px;
      height: 1.05em;
      vertical-align: baseline;
    }
    .line.medium { min-width: 180px; }
    .line.long { min-width: 280px; }
    .line.full { display: block; width: 100%; height: 26px; }
    .indent { text-indent: 32px; }
    .reason-lines { margin-top: 2px; }
    .date { text-align: right; font-style: italic; margin-top: 22px; }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 18px;
      text-align: center;
    }
    .sign-title { font-weight: bold; text-transform: uppercase; }
    .sign-note { font-style: italic; font-size: 12pt; }
    .sign-space { height: 65px; }
    .approval {
      margin-top: 28px;
      border-top: 1px solid #777;
      padding-top: 10px;
    }
    .approval-title {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .approval p { text-align: left; margin: 7px 0; }
    .approval-sign {
      text-align: center;
      width: 48%;
      margin: 12px 0 0 auto;
    }
    .approval-sign .sign-space { height: 42px; }
    .small { font-size: 12pt; }
    @media print {
      body { background: #fff; }
      .page { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="school">${escapeHtml(String(ctx.school_name))}</div>
        <div class="small">Lớp: <strong>${escapeHtml(String(ctx.class_name))}</strong> — Mã đơn: ${escapeHtml(String(ctx.code))}</div>
        <div class="school-line"></div>
      </div>
      <div>
        <div class="nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
        <div class="motto-line"></div>
      </div>
    </div>

    <h1>ĐƠN XIN PHÉP NGHỈ HỌC</h1>

    <div class="recipient">
      Kính gửi: - Ban Giám hiệu Trường Trung học phổ thông SchoolPro<br>
      - Thầy/Cô Giáo viên chủ nhiệm lớp ${escapeHtml(String(ctx.class_name))}: <strong>${escapeHtml(String(ctx.homeroom_teacher_name))}</strong><br>
      - Quý Thầy/Cô giáo giảng dạy các môn học
    </div>

    <div class="field">
      Em tên là: <span class="line long" style="font-weight: bold;">${escapeHtml(String(ctx.student_name))}</span>
      &nbsp;&nbsp;&nbsp;&nbsp;
      Mã học sinh: <span class="line" style="font-weight: bold;">${escapeHtml(String(ctx.student_code))}</span>
    </div>
    <div class="field">
      Ngày sinh: <span class="line medium" style="font-weight: bold;">${escapeHtml(String(ctx.student_dob || ""))}</span>
      &nbsp;&nbsp;&nbsp;&nbsp;
      Lớp: <span class="line" style="font-weight: bold;">${escapeHtml(String(ctx.class_name))}</span>
    </div>
    <div class="field">
      Họ và tên Phụ huynh học sinh: <span class="line long" style="font-weight: bold;">${escapeHtml(String(ctx.guardian_name))}</span>
      &nbsp;&nbsp;&nbsp;&nbsp;
      SĐT liên hệ: <span class="line" style="font-weight: bold;">${escapeHtml(String(ctx.guardian_phone || ""))}</span>
    </div>

    <p class="indent">
      Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:
    </p>

    <div style="margin: 10px 0 14px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5pt;">
        <tr>
          <td style="width: 28%; font-weight: bold; padding: 4px 0;">Thời gian xin nghỉ:</td>
          <td style="padding: 4px 0;">${escapeHtml(String(ctx.date_range_text))}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 0;">Số ngày &amp; Ca nghỉ:</td>
          <td style="padding: 4px 0;"><strong>${String(ctx.total_days)} ngày</strong> (${escapeHtml(String(ctx.session_shift_label))})</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 0;">Các môn học xin nghỉ:</td>
          <td style="padding: 4px 0;">${escapeHtml(String(ctx.affected_subjects))}</td>
        </tr>
      </table>
    </div>

    ${String(ctx.affected_lessons_table_html || "")}

    <div class="field reason-lines">
      <strong>Lý do xin nghỉ học:</strong><br>
      <div style="min-height: 38px; padding-top: 4px; text-align: justify;">${String(ctx.reason_html || "")}</div>
    </div>

    <p class="indent">
      ${String(ctx.commitment_html || "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.")}
    </p>

    <p class="indent">
      Kính mong Thầy/Cô xem xét và tạo điều kiện cho em được phép nghỉ học. Em xin chân thành cảm ơn!
    </p>

    <div class="date">${escapeHtml(String(ctx.created_date_admin))}</div>

    <div class="signature-grid">
      <div>
        <div class="sign-title">Ý KIẾN CỦA PHỤ HUYNH</div>
        <div class="sign-note">(Ký và ghi rõ họ tên)</div>
        <div class="sign-space"></div>
        <div style="font-weight: bold;">${escapeHtml(String(ctx.guardian_name))}</div>
      </div>
      <div>
        <div class="sign-title">NGƯỜI LÀM ĐƠN</div>
        <div class="sign-note">(Ký và ghi rõ họ tên)</div>
        <div class="sign-space"></div>
        <div style="font-weight: bold;">${escapeHtml(String(ctx.student_name))}</div>
      </div>
    </div>

    <div class="approval">
      <div class="approval-title">Ý KIẾN PHÊ DUYỆT CỦA GIÁO VIÊN CHỦ NHIỆM</div>
      <p style="margin: 8px 0;">
        Tình trạng phê duyệt: &nbsp;&nbsp;&nbsp;&nbsp;
        <span style="font-family: DejaVu Sans, Arial, sans-serif;">${String(ctx.approval_checkboxes || "[ ] Đồng ý &nbsp;&nbsp;&nbsp;&nbsp; [ ] Không đồng ý")}</span>
      </p>
      <p style="margin: 6px 0;">
        Ghi chú / Ý kiến bổ sung: <em>${String(ctx.teacher_note_display || "Không có")}</em>
      </p>
      <div class="approval-sign">
        <div class="sign-title">GIÁO VIÊN CHỦ NHIỆM</div>
        <div class="sign-note">(${escapeHtml(String(ctx.status_label))})</div>
        <div class="sign-space"></div>
        <div style="font-weight: bold;">${escapeHtml(String(ctx.reviewer_name))}</div>
      </div>
    </div>
  </div>
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
