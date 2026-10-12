import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Steps } from "@/components/ui/Steps";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  formatDateTimeDisplay,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestWorkflowCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestWorkflowCard: React.FC<LeaveRequestWorkflowCardProps> = ({ item }) => {
  const { t } = useTranslation("card");
  const notifiedTeachers = item.notifiedTeachers || [];
  const homeroomAlsoSubject = notifiedTeachers.some((teacher) => teacher.isHomeroomTeacher);

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

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("leaveRequests.detail.workflowCardTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.approvalDeadline && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Icon name="clock" size={13} className="text-blue-600 shrink-0" />
              <span>{t("leaveRequests.detail.approvalDeadlineShortLabel")}</span>
              <strong className="text-slate-800">
                {formatDateTimeDisplay(item.approvalDeadline)}
              </strong>
            </span>
          )}
          {item.isAutoApproved && (
            <Tag color="cyan" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("leaveRequests.detail.autoApprovedBadge")}
            </Tag>
          )}
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 font-bold text-xs px-2.5 py-0.5"
          >
            {getLeaveStatusLabel(item.status)}
          </Tag>
        </div>
      </div>

      <div className="px-1 sm:px-2">
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
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
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
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
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
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
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
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
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

      {item.teacherNote ? (
        <div
          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            item.status === "rejected"
              ? "bg-rose-50/70 border-rose-200 text-rose-900"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
          }`}
        >
          <div>
            <span className="font-bold mr-1.5">
              {item.isAutoApproved
                ? t("leaveRequests.detail.systemNoteLabel")
                : t("leaveRequests.detail.homeroomNoteLabel")}
            </span>
            <span className="italic">{item.teacherNote}</span>
          </div>
          {item.reviewedAt && (
            <span className="text-[11px] opacity-80 shrink-0">
              {formatDateTimeDisplay(item.reviewedAt)}
            </span>
          )}
        </div>
      ) : item.status === "pending" && item.approvalDeadline ? (
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="info" size={14} className="text-amber-600 shrink-0" />
            <span>{t("leaveRequests.detail.deadlinePendingStatus")}</span>
          </div>
          <span className="text-[11px] font-medium text-amber-800">
            {t("leaveRequests.detail.homeroomFullNameLabel")}{" "}
            <strong>{item.homeroomTeacherName}</strong>
          </span>
        </div>
      ) : null}
    </div>
  );
};
