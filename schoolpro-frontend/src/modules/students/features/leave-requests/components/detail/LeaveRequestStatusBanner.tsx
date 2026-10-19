import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  formatDateTimeDisplay,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestStatusBannerProps {
  item: LeaveRequestItem;
}

export const LeaveRequestStatusBanner: React.FC<LeaveRequestStatusBannerProps> = ({ item }) => {
  const { t } = useTranslation(["card"]);

  // Determine theme styles based on request status
  const isApproved = item.status === "approved";
  const isPending = item.status === "pending";
  const isRejected = item.status === "rejected";
  const isCancelled = item.status === "cancelled";

  const getContainerStyles = () => {
    if (isApproved) {
      return "bg-linear-to-r from-emerald-50/90 via-emerald-50/50 to-teal-50/40 border-emerald-200/90";
    }
    if (isPending) {
      return "bg-linear-to-r from-amber-50/90 via-amber-50/50 to-orange-50/40 border-amber-200/90";
    }
    if (isRejected) {
      return "bg-linear-to-r from-rose-50/90 via-rose-50/50 to-pink-50/40 border-rose-200/90";
    }
    return "bg-slate-50/90 border-slate-200/90";
  };

  const getStatusIcon = () => {
    if (isApproved) {
      return (
        <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <Icon name="check" size={24} strokeWidth={2.5} />
        </div>
      );
    }
    if (isPending) {
      return (
        <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <Icon name="clock" size={24} strokeWidth={2.5} />
        </div>
      );
    }
    if (isRejected) {
      return (
        <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
          <Icon name="error" size={24} strokeWidth={2.5} />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-500 text-white flex items-center justify-center shadow-md shadow-slate-500/20 shrink-0">
        <Icon name="info" size={24} strokeWidth={2.5} />
      </div>
    );
  };

  const getStatusTitle = () => {
    if (isApproved) return t("card:leaveRequests.detail.statusBannerApprovedTitle");
    if (isPending) return t("card:leaveRequests.detail.statusBannerPendingTitle");
    if (isRejected) return t("card:leaveRequests.detail.statusBannerRejectedTitle");
    return t("card:leaveRequests.detail.statusBannerCancelledTitle");
  };

  const getStatusDescription = () => {
    if (isApproved) {
      if (item.isAutoApproved) {
        return t("card:leaveRequests.detail.statusBannerApprovedDescAuto", {
          time: formatDateTimeDisplay(item.reviewedAt),
        });
      }
      return t("card:leaveRequests.detail.statusBannerApprovedDescDirect", {
        teacherName: item.homeroomTeacherName,
        time: formatDateTimeDisplay(item.reviewedAt),
      });
    }
    if (isPending) {
      return t("card:leaveRequests.detail.statusBannerPendingDesc", {
        teacherName: item.homeroomTeacherName,
        deadline: formatDateTimeDisplay(item.approvalDeadline),
      });
    }
    if (isRejected) {
      return t("card:leaveRequests.detail.statusBannerRejectedDesc", {
        teacherName: item.homeroomTeacherName,
        time: formatDateTimeDisplay(item.reviewedAt),
      });
    }
    return t("card:leaveRequests.detail.statusBannerCancelledDesc");
  };

  return (
    <div className={`p-5 sm:p-6 rounded-xl border shadow-2xs space-y-5 ${getContainerStyles()}`}>
      {/* 1. Header Status with Icon and Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {getStatusIcon()}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0">
                {getStatusTitle()}
              </h2>
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
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0 max-w-3xl">
              {getStatusDescription()}
            </p>
          </div>
        </div>

        {/* Action Deadline badge if pending */}
        {isPending && item.approvalDeadline && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 border border-amber-200/90 text-xs text-amber-900 shadow-2xs shrink-0 self-start md:self-center">
            <Icon name="clock" size={15} className="text-amber-600 shrink-0" />
            <div>
              <span className="text-[11px] text-amber-700 block">
                {t("card:leaveRequests.detail.approvalDeadlineShortLabel")}
              </span>
              <strong className="text-slate-900">
                {formatDateTimeDisplay(item.approvalDeadline)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Teacher Advice or Note Box */}
      {item.teacherNote && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 shadow-2xs bg-white/90 ${
            isRejected ? "border-rose-200 text-rose-950" : "border-emerald-200 text-emerald-950"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isRejected ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            <Icon name={isRejected ? "error" : "file-text"} size={16} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <span className="font-bold text-xs tracking-wide uppercase text-slate-500 block">
              {isRejected
                ? t("card:leaveRequests.detail.teacherRejectReasonTitle")
                : t("card:leaveRequests.detail.teacherAdviceTitle")}
            </span>
            <p className="font-medium text-slate-800 leading-relaxed mb-0 italic">
              &ldquo;{item.teacherNote}&rdquo;
            </p>
          </div>
          {item.reviewedAt && (
            <span className="text-[11px] text-slate-400 shrink-0 self-end">
              {formatDateTimeDisplay(item.reviewedAt)}
            </span>
          )}
        </div>
      )}

      {/* 3. Compact 3-Step Horizontal Stepper */}
      <div className="pt-3 border-t border-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1: Submission */}
          <div className="p-3 rounded-xl bg-white/70 border border-slate-200/70 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
              <Icon name="check" size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block">
                {t("card:leaveRequests.detail.stepMiniSubmitted")}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {formatDateTimeDisplay(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Step 2: Teacher Review */}
          <div className="p-3 rounded-xl bg-white/70 border border-slate-200/70 flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                isPending
                  ? "bg-amber-500 text-white animate-pulse"
                  : isCancelled
                    ? "bg-slate-300 text-slate-600"
                    : "bg-blue-600 text-white"
              }`}
            >
              {isPending ? (
                <Icon name="clock" size={14} />
              ) : isCancelled ? (
                "2"
              ) : (
                <Icon name="check" size={14} />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block">
                {t("card:leaveRequests.detail.stepMiniReceived")}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {item.homeroomTeacherName}
              </span>
            </div>
          </div>

          {/* Step 3: Final Result */}
          <div className="p-3 rounded-xl bg-white/70 border border-slate-200/70 flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                isApproved
                  ? "bg-emerald-600 text-white"
                  : isRejected
                    ? "bg-rose-600 text-white"
                    : isCancelled
                      ? "bg-slate-400 text-white"
                      : "bg-slate-200 text-slate-400"
              }`}
            >
              {isApproved ? (
                <Icon name="check" size={14} />
              ) : isRejected ? (
                <Icon name="error" size={14} />
              ) : isCancelled ? (
                <Icon name="close" size={14} />
              ) : (
                "3"
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block">
                {t("card:leaveRequests.detail.stepMiniResult")}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {isApproved
                  ? getLeaveStatusLabel("approved")
                  : isRejected
                    ? getLeaveStatusLabel("rejected")
                    : isCancelled
                      ? getLeaveStatusLabel("cancelled")
                      : t("card:leaveRequests.detail.stepMiniPending")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
