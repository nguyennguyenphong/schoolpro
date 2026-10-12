import { Steps } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  LEAVE_TYPE_COLORS,
  formatDateTimeDisplay,
  formatLeaveDateRange,
  getLeaveStatusLabel,
  getLeaveTypeLabel,
  getSessionShiftLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestStepsLogCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestStepsLogCard: React.FC<LeaveRequestStepsLogCardProps> = ({ item }) => {
  const { t } = useTranslation("card");
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
    badgeText: ev.badgeText || t("leaveRequests.detail.systemBadge"),
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
            time: t("leaveRequests.detail.pendingDeadlineTime", {
              time: formatDateTimeDisplay(item.approvalDeadline || item.createdAt),
            }),
            title: t("leaveRequests.detail.pendingDeadlineLogTitle"),
            actor: t("leaveRequests.detail.pendingDeadlineLogActor", {
              teacherName:
                item.homeroomTeacherName || t("leaveRequests.header.homeroomTeacherFallback"),
            }),
            badgeText: t("leaveRequests.detail.pendingDeadlineLogBadge"),
            badgeColor: "warning" as const,
            dotColor: "bg-amber-500 animate-pulse",
            emailSent: false,
            recipientEmail: item.homeroomTeacherEmail || "",
            description: t("leaveRequests.detail.pendingDeadlineLogDesc", {
              createdAt: formatDateTimeDisplay(item.createdAt),
              deadline: formatDateTimeDisplay(item.approvalDeadline),
            }),
          },
        ]
      : dbLogs;

  const homeroomAlsoSubject = notifiedTeachers.some((teacher) => teacher.isHomeroomTeacher);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Quy trình xử lý đơn (Steps) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              {t("leaveRequests.detail.workflowCardTitle")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {item.isAutoApproved && (
              <Tag color="cyan" className="m-0 font-bold text-xs">
                {t("leaveRequests.detail.autoApprovedBadge")}
              </Tag>
            )}
            <Tag
              color={LEAVE_STATUS_COLORS[item.status] || "default"}
              className="m-0 font-bold text-xs"
            >
              {getLeaveStatusLabel(item.status)}
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
                {t("leaveRequests.detail.deadlineLabel")}{" "}
                <strong className="font-mono">
                  {formatDateTimeDisplay(item.approvalDeadline)}
                </strong>
              </span>
            </div>
            <span className="text-[11px] font-medium">
              {item.isAutoApproved
                ? t("leaveRequests.detail.deadlineAutoApprovedStatus")
                : item.status === "pending"
                  ? t("leaveRequests.detail.deadlinePendingStatus")
                  : t("leaveRequests.detail.deadlineProcessedStatus", {
                      time: formatDateTimeDisplay(item.reviewedAt || item.updatedAt),
                    })}
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
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    {t("leaveRequests.detail.step1Title")}
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {formatDateTimeDisplay(item.createdAt)}
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    {t("leaveRequests.detail.step2Title")}
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {homeroomAlsoSubject
                      ? t("leaveRequests.detail.step2DescCombined")
                      : t("leaveRequests.detail.step2DescSeparate", {
                          count: notifiedTeachers.length,
                        })}
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    {t("leaveRequests.detail.step3Title")}
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {item.status === "pending"
                      ? t("leaveRequests.detail.step3DescPending", {
                          time: formatDateTimeDisplay(item.approvalDeadline),
                        })
                      : item.isAutoApproved
                        ? t("leaveRequests.detail.step3DescAutoApproved", {
                            time: formatDateTimeDisplay(item.reviewedAt),
                          })
                        : item.status === "approved"
                          ? t("leaveRequests.detail.step3DescApproved", {
                              time: formatDateTimeDisplay(item.reviewedAt),
                            })
                          : item.status === "rejected"
                            ? t("leaveRequests.detail.step3DescRejected", {
                                time: formatDateTimeDisplay(item.reviewedAt),
                              })
                            : t("leaveRequests.statuses.cancelled")}
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-semibold text-xs sm:text-sm">
                    {t("leaveRequests.detail.step4Title")}
                  </span>
                ),
                description: (
                  <span className="text-[11px] text-slate-500 block">
                    {item.status === "approved"
                      ? t("leaveRequests.detail.step4DescApproved")
                      : item.status === "rejected"
                        ? t("leaveRequests.detail.step4DescRejected")
                        : t("leaveRequests.detail.step4DescPending")}
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
            {t("leaveRequests.detail.contentCardTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">
              {t("leaveRequests.detail.dateRangeBoxLabel")}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
              <Icon name="calendar" size={14} className="text-blue-600 shrink-0" />
              <span>{formatLeaveDateRange(item.startDate, item.endDate)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">
              {t("leaveRequests.detail.daysAndShiftBoxLabel")}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs sm:text-sm">
              <Icon name="clock" size={14} className="text-blue-600 shrink-0" />
              <span>
                {t("leaveRequests.item.daysAndShift", {
                  days: item.totalDays,
                  shift: getSessionShiftLabel(item.sessionShift),
                })}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1">
              {t("leaveRequests.detail.reasonCategoryBoxLabel")}
            </span>
            <Tag
              color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
              className="m-0 font-semibold text-xs"
            >
              {getLeaveTypeLabel(item.leaveType)}
            </Tag>
          </div>
        </div>

        {/* Danh sách các tiết học / môn học xin nghỉ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {t("leaveRequests.detail.affectedLessonsListTitle", {
                count: affectedLessons.length,
              })}
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
                      {t("leaveRequests.detail.subjectAndPeriodItem", {
                        subject: lesson.subjectName,
                        period: lesson.periodNumber,
                      })}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")}) •{" "}
                      {lesson.startTime} - {lesson.endTime}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {t("leaveRequests.form.subjectTeacherPrefix")}{" "}
                      <strong className="text-slate-800">{lesson.teacherName}</strong>
                    </div>
                  </div>
                  <Tag color="cyan" className="m-0 text-[10px] font-semibold shrink-0">
                    {t("leaveRequests.detail.notifiedSubjectTeacherBadge")}
                  </Tag>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              {t("leaveRequests.detail.noMatchingLessons")}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">
            {t("leaveRequests.detail.detailedReasonLabel")}
          </span>
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {item.reason}
          </div>
        </div>

        {item.commitment && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              {t("leaveRequests.detail.studentCommitmentLabel")}
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
              {t("leaveRequests.detail.activityLogCardTitle")}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {t("leaveRequests.detail.eventsCount", { count: logs.length })}
          </span>
        </div>

        <div className="relative pl-4 space-y-4 before:content-[''] before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-4">
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs absolute -left-3.75 top-1 ${log.dotColor}`}
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
                    {t("leaveRequests.detail.performedBy")}{" "}
                    <strong className="text-slate-700">{log.actor}</strong>
                  </span>
                  {log.recipientEmail && (
                    <span className="text-[11px] text-blue-600 font-medium">
                      {t("leaveRequests.detail.emailPrefix")} {log.recipientEmail}
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
