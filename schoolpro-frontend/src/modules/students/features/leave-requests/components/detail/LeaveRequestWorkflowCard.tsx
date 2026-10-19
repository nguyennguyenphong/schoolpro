import React from "react";
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
  const { t } = useTranslation(["card"]);

  console.log("item", item.approvalDeadline);

  const isApproved = item.status === "approved";
  const isPending = item.status === "pending";
  const isRejected = item.status === "rejected";
  const isCancelled = item.status === "cancelled";

  // Step 0: Đăng ký, Step 1: Thông báo GVCN & GVBM, Step 2: Xem xét phê duyệt, Step 3: Hoàn tất
  const currentStep = isApproved ? 3 : isRejected || isCancelled ? 2 : 2;

  const stepStatus: "process" | "finish" | "error" | "wait" = isApproved
    ? "finish"
    : isRejected || isCancelled
      ? "error"
      : "process";

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      {/* 1. Header Bar with blue accent bar and status badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.workflowCardTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.approvalDeadline && isPending && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Icon name="clock" size={13} className="text-blue-600 shrink-0" />
              <span>{t("card:leaveRequests.detail.approvalDeadlineShortLabel")}</span>
              <strong className="text-slate-800">
                {formatDateTimeDisplay(item.approvalDeadline)}
              </strong>
            </span>
          )}

          {item.isAutoApproved && (
            <Tag color="cyan" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:leaveRequests.detail.autoApprovedBadge")}
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

      {/* 2. Interactive Steps (Matching AssignmentWorkflowCard) */}
      <div className="px-1 sm:px-2">
        <Steps
          size="small"
          current={currentStep}
          status={stepStatus}
          items={[
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:leaveRequests.detail.step1Title")}
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
                  {t("card:leaveRequests.detail.step2Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {item.homeroomTeacherName || t("card:leaveRequests.detail.homeroomCardTitle")}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:leaveRequests.detail.step3Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {isApproved
                    ? formatDateTimeDisplay(item.reviewedAt)
                    : isRejected
                      ? formatDateTimeDisplay(item.reviewedAt)
                      : isCancelled
                        ? t("card:leaveRequests.detail.statusBannerCancelledTitle")
                        : `${t("card:leaveRequests.detail.approvalDeadlineShortLabel")} ${formatDateTimeDisplay(item.approvalDeadline)}`}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:leaveRequests.detail.step4Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {isApproved
                    ? t("card:leaveRequests.detail.step4DescApproved")
                    : isRejected
                      ? t("card:leaveRequests.detail.step4DescRejected")
                      : isCancelled
                        ? t("card:leaveRequests.detail.statusBannerCancelledDesc")
                        : t("card:leaveRequests.detail.step4DescPending")}
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* 3. Feedback / Advice or Auto-Approval Notice (Matching AssignmentWorkflowCard bottom banner) */}
      {item.teacherNote && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs ${
            isRejected
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex items-start gap-2">
            <Icon
              name={isRejected ? "error" : "check"}
              size={15}
              className={isRejected ? "text-rose-600 mt-0.5 shrink-0" : "text-emerald-600 mt-0.5 shrink-0"}
            />
            <div>
              <span className="font-bold mr-1.5">
                {isRejected
                  ? t("card:leaveRequests.detail.teacherRejectReasonTitle")
                  : t("card:leaveRequests.detail.teacherAdviceTitle")}{" "}
                ({item.reviewedByName || item.homeroomTeacherName}):
              </span>
              <span className="italic">"{item.teacherNote}"</span>
            </div>
          </div>
          {item.reviewedAt && (
            <span className="text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
              {formatDateTimeDisplay(item.reviewedAt)}
            </span>
          )}
        </div>
      )}

      {item.isAutoApproved && !item.teacherNote && (
        <div className="p-3.5 rounded-xl border bg-cyan-50/70 border-cyan-200 text-cyan-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Icon name="info" size={15} className="text-cyan-700 shrink-0" />
            <span>
              {t("card:leaveRequests.detail.statusBannerApprovedDescAuto", {
                time: formatDateTimeDisplay(item.reviewedAt),
              })}
            </span>
          </div>
          {item.reviewedAt && (
            <span className="text-[11px] text-cyan-800 shrink-0">
              {formatDateTimeDisplay(item.reviewedAt)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
