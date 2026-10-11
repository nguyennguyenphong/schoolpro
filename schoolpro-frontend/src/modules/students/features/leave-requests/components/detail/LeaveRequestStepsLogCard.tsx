import { Steps } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_LABELS,
  SESSION_SHIFT_LABELS,
  formatDateTimeDisplay,
  formatLeaveDateRange,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestStepsLogCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestStepsLogCard: React.FC<LeaveRequestStepsLogCardProps> = ({ item }) => {
  const affectedLessons = item.affectedLessons || [];
  const notifiedTeachers = item.notifiedTeachers || [];

  const currentStep =
    item.status === "approved"
      ? 3
      : item.status === "rejected" || item.status === "cancelled"
        ? 2
        : 2;

  const stepStatus: "process" | "finish" | "error" | "wait" =
    item.status === "approved"
      ? "finish"
      : item.status === "rejected" || item.status === "cancelled"
        ? "error"
        : "process";

  const mapBadgeColorToDot = (color?: string): string => {
    switch (color) {
      case "success":
        return "bg-emerald-600";
      case "error":
        return "bg-rose-600";
      case "warning":
        return "bg-amber-500";
      case "purple":
        return "bg-purple-600";
      case "cyan":
        return "bg-cyan-600";
      default:
        return "bg-blue-600";
    }
  };

  // Build chronological logs from backend eventLogs table (every entry has a real timestamp)
  const dbLogs = (item.eventLogs || []).map((ev) => ({
    id: ev.id,
    time: formatDateTimeDisplay(ev.createdAt),
    title: ev.title,
    actor: ev.actor,
    badgeText: ev.badgeText || "Hệ thống",
    badgeColor: (ev.badgeColor || "blue") as
      | "blue"
      | "cyan"
      | "purple"
      | "success"
      | "warning"
      | "error"
      | "default",
    dotColor: mapBadgeColorToDot(ev.badgeColor),
    emailSent: Boolean(ev.emailSent),
    recipientEmail: ev.recipientEmail || "",
    description: ev.description,
  }));

  // If the request is still PENDING, append the active deadline monitoring step with its exact deadline timestamp
  const logs =
    item.status === "pending"
      ? [
          ...dbLogs,
          {
            id: "log-pending-deadline",
            time: `Hạn duyệt: ${formatDateTimeDisplay(item.approvalDeadline || item.createdAt)}`,
            title: "Đang chờ Giáo viên chủ nhiệm phê duyệt (Hạn trước giờ học 03 giờ)",
            actor: `${item.homeroomTeacherName || "Giáo viên chủ nhiệm"} • Hệ thống Tự động Duyệt`,
            badgeText: "Chờ GVCN duyệt",
            badgeColor: "warning" as const,
            dotColor: "bg-amber-500 animate-pulse",
            emailSent: false,
            recipientEmail: item.homeroomTeacherEmail || "",
            description: `Hạn phê duyệt từ lúc đăng ký (${formatDateTimeDisplay(
              item.createdAt,
            )}) đến trước thời gian diễn ra môn học 03 giờ (${formatDateTimeDisplay(
              item.approvalDeadline,
            )}). Nếu quá thời hạn trên mà Giáo viên chủ nhiệm chưa duyệt, hệ thống sẽ tự động phê duyệt đơn, gửi Email cho học sinh và thông báo tới Giáo viên bộ môn.`,
          },
        ]
      : dbLogs;

  const homeroomAlsoSubject = notifiedTeachers.some((t) => t.isHomeroomTeacher);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Quy trình xử lý đơn (Steps) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              Quy trình xét duyệt &amp; Thông báo tự động
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {item.isAutoApproved && (
              <Tag color="cyan" className="m-0 font-bold text-xs">
                Hệ thống duyệt tự động (Trước 3h)
              </Tag>
            )}
            <Tag
              color={LEAVE_STATUS_COLORS[item.status] || "default"}
              className="m-0 font-bold text-xs"
            >
              {LEAVE_STATUS_LABELS[item.status] || item.status}
            </Tag>
          </div>
        </div>

        {/* Hạn phê duyệt & Quy tắc tự động duyệt banner */}
        {item.approvalDeadline && (
          <div
            className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
              item.isAutoApproved
                ? "bg-cyan-50/80 border-cyan-200 text-cyan-900"
                : item.status === "pending"
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name="clock" size={14} className="text-blue-600 shrink-0" />
              <span>
                Hạn GVCN phê duyệt (trước giờ học 03 giờ):{" "}
                <strong className="font-mono">
                  {formatDateTimeDisplay(item.approvalDeadline)}
                </strong>
              </span>
            </div>
            <span className="text-[11px] font-medium">
              {item.isAutoApproved
                ? "Đã tự động phê duyệt khi đến hạn & gửi Email tới Học sinh + GVBM"
                : item.status === "pending"
                  ? "Quá hạn chưa duyệt → Hệ thống tự động phê duyệt & gửi Email"
                  : `Đã xử lý lúc ${formatDateTimeDisplay(item.reviewedAt || item.updatedAt)}`}
            </span>
          </div>
        )}

        <div className="pt-1">
          <Steps
            size="small"
            current={currentStep}
            status={stepStatus}
            items={[
              {
                title: <span className="font-semibold text-xs sm:text-sm">Đăng ký nghỉ học</span>,
                description: (
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {formatDateTimeDisplay(item.createdAt)}
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    Báo GVCN &amp; GVBM
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {homeroomAlsoSubject
                      ? "GVCN kiêm GVBM (gửi 1 lần)"
                      : `Email GVCN & ${notifiedTeachers.length} GVBM`}
                  </span>
                ),
              },
              {
                title: <span className="font-semibold text-xs sm:text-sm">Phê duyệt đơn</span>,
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {item.status === "pending"
                      ? `Hạn: ${formatDateTimeDisplay(item.approvalDeadline)}`
                      : item.isAutoApproved
                        ? `Tự động duyệt (${formatDateTimeDisplay(item.reviewedAt)})`
                        : item.status === "approved"
                          ? `GVCN duyệt (${formatDateTimeDisplay(item.reviewedAt)})`
                          : item.status === "rejected"
                            ? `GVCN từ chối (${formatDateTimeDisplay(item.reviewedAt)})`
                            : "Đã hủy"}
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    Email HS &amp; Báo GVBM
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {item.status === "approved"
                      ? "Đã gửi Email HS & báo GVBM"
                      : item.status === "rejected"
                        ? "Đã gửi Email kết quả HS"
                        : "Sau khi đơn được duyệt"}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 2. Thông tin nội dung & Các môn học xin nghỉ */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            Nội dung đăng ký & Môn học xin nghỉ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">Khoảng thời gian nghỉ</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
              <Icon name="calendar" size={14} className="text-blue-600 shrink-0" />
              <span>{formatLeaveDateRange(item.startDate, item.endDate)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">Số ngày & Ca nghỉ</span>
            <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs sm:text-sm">
              <Icon name="clock" size={14} className="text-blue-600 shrink-0" />
              <span>
                {item.totalDays} ngày ({SESSION_SHIFT_LABELS[item.sessionShift] || "Cả ngày"})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">Phân loại lý do</span>
            <Tag
              color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
              className="m-0 font-semibold text-xs"
            >
              {LEAVE_TYPE_LABELS[item.leaveType] || "Xin nghỉ phép"}
            </Tag>
          </div>
        </div>

        {/* Danh sách các tiết học / môn học xin nghỉ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Danh sách các tiết học / môn học xin nghỉ ({affectedLessons.length} tiết):
            </span>
            {item.affectedSubjects && item.affectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.affectedSubjects.map((subj) => (
                  <Tag key={subj} color="blue" className="m-0 text-[11px] font-semibold">
                    {subj}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {affectedLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {affectedLessons.map((lesson) => (
                <div
                  key={lesson.lessonKey}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-bold text-slate-900 truncate">
                      Môn {lesson.subjectName} • Tiết {lesson.periodNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")}) •{" "}
                      {lesson.startTime} - {lesson.endTime}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      GV bộ môn: <strong className="text-slate-800">{lesson.teacherName}</strong>
                    </div>
                  </div>
                  <Tag color="cyan" className="m-0 text-[10px] font-semibold shrink-0">
                    Đã báo GVBM
                  </Tag>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              Không có tiết học trùng trong Thời khóa biểu vào ngày nghỉ này.
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">
            Lý do xin nghỉ học chi tiết:
          </span>
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {item.reason}
          </div>
        </div>

        {item.commitment && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Cam kết học tập của học sinh:
            </span>
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 italic">
              {item.commitment}
            </div>
          </div>
        )}
      </div>

      {/* 3. Nhật ký xử lý đơn (Activity Log Timeline) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              Nhật ký xử lý đơn (Activity Log)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{logs.length} sự kiện</span>
        </div>

        <div className="relative pl-4 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-4">
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs absolute -left-[15px] top-1 ${log.dotColor}`}
              />
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{log.title}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag color={log.badgeColor} className="m-0 text-[11px] font-semibold">
                      {log.badgeText}
                    </Tag>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-mono font-semibold">
                      <Icon name="clock" size={11} className="text-blue-600 shrink-0" />
                      <span>{log.time}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    Thực hiện bởi: <strong className="text-slate-700">{log.actor}</strong>
                  </span>
                  {log.recipientEmail && (
                    <span className="text-[11px] text-blue-600 font-medium">
                      Email: {log.recipientEmail}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-0 pt-0.5">
                  {log.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
