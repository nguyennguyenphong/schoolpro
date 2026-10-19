import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import type { TabsItems } from "@/components/ui/Tabs/types";
import { Tag } from "@/components/ui/Tag";
import { LeaveRequestContentCard } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestContentCard";
import { LeaveRequestActivityLogCard } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestActivityLogCard";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  formatDateTimeDisplay,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestContentTabsCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestContentTabsCard: React.FC<LeaveRequestContentTabsCardProps> = ({
  item,
}) => {
  const { t } = useTranslation(["card"]);

  const affectedLessons = item.affectedLessons || [];
  const eventsCount = item.eventLogs?.length || 0;
  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";
  const isPending = item.status === "pending";

  const items: TabsItems = [
    {
      key: "content",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon name="file-text" size={14} />
          <span>{t("card:leaveRequests.detail.tabContent")}</span>
          {affectedLessons.length > 0 && (
            <Tag color="processing" className="m-0 text-[10px] px-1.5 py-0">
              {affectedLessons.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="pt-1">
          <LeaveRequestContentCard item={item} embedded />
        </div>
      ),
    },
    {
      key: "approval",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon
            name={isApproved ? "check" : isRejected ? "close" : "clock"}
            size={14}
            className={
              isApproved
                ? "text-emerald-600"
                : isRejected
                  ? "text-rose-600"
                  : "text-amber-500"
            }
          />
          <span>{t("card:leaveRequests.detail.tabApproval")}</span>
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-[10px] px-1.5 py-0"
          >
            {getLeaveStatusLabel(item.status)}
          </Tag>
        </span>
      ),
      children: (
        <div className="pt-1 space-y-4 text-xs sm:text-sm">
          {/* Decision Summary Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">
                  {t("card:leaveRequests.detail.tabApproval")}
                </span>
                {item.isAutoApproved && (
                  <Tag color="cyan" className="m-0 font-bold text-xs">
                    {t("card:leaveRequests.detail.autoApprovedBadge")}
                  </Tag>
                )}
                <Tag
                  color={LEAVE_STATUS_COLORS[item.status] || "default"}
                  className="m-0 font-bold text-xs"
                >
                  {getLeaveStatusLabel(item.status)}
                </Tag>
              </div>

              {item.reviewedAt && (
                <span className="text-xs text-slate-500">
                  {formatDateTimeDisplay(item.reviewedAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">
                  {t("card:leaveRequests.detail.homeroomCardTitle")}:
                </span>
                <strong className="text-slate-800">
                  {item.homeroomTeacherName}
                </strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">
                  {t("card:leaveRequests.detail.approvalMethodLabel")}
                </span>
                <strong
                  className={
                    item.isAutoApproved
                      ? "text-cyan-700"
                      : isApproved
                        ? "text-emerald-700"
                        : "text-slate-800"
                  }
                >
                  {item.isAutoApproved
                    ? t("card:leaveRequests.detail.approvalMethodAuto")
                    : isApproved
                      ? t("card:leaveRequests.detail.approvalMethodDirect")
                      : isRejected
                        ? t("card:leaveRequests.detail.step3DescRejected", { time: "" })
                        : isPending
                          ? t("card:leaveRequests.detail.stepMiniPending")
                          : t("card:leaveRequests.detail.statusBannerCancelledTitle")}
                </strong>
              </div>
            </div>

            {/* Teacher Note or Rejection Reason */}
            {item.teacherNote ? (
              <div
                className={`p-3.5 rounded-xl border ${
                  isRejected
                    ? "bg-rose-50/80 border-rose-200 text-rose-950"
                    : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="font-bold text-xs mb-1">
                  {isRejected
                    ? t("card:leaveRequests.detail.teacherRejectReasonTitle")
                    : t("card:leaveRequests.detail.teacherAdviceTitle")}{" "}
                  ({item.reviewedByName || item.homeroomTeacherName}):
                </div>
                <div className="italic leading-relaxed">
                  "{item.teacherNote}"
                </div>
              </div>
            ) : isPending ? (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
                <Icon name="clock" size={15} className="text-amber-600 shrink-0" />
                <span>
                  {t("card:leaveRequests.detail.pendingDeadlineWarning", {
                    deadline: formatDateTimeDisplay(item.approvalDeadline),
                  })}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "activityLog",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon name="clock" size={14} />
          <span>{t("card:leaveRequests.detail.tabActivityLog")}</span>
          {eventsCount > 0 && (
            <Tag color="default" className="m-0 text-[10px] px-1.5 py-0">
              {eventsCount}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="pt-1">
          <LeaveRequestActivityLogCard item={item} embedded defaultExpanded />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
      <Tabs defaultActiveKey="content" size="small" items={items} />
    </div>
  );
};
