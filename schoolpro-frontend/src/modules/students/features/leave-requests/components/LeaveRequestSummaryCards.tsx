import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { LeaveRequestSummary } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestSummaryCardsProps {
  summary?: LeaveRequestSummary | null;
  loading?: boolean;
}

/**
 * Student Leave Request Summary Cards matching the clean, responsive layout of AttendanceSummaryCards.
 */
export const LeaveRequestSummaryCards: React.FC<LeaveRequestSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl shadow-2xs border-[#f0f0f0]">
            <div className="animate-pulse">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <div className="h-8 sm:h-9 w-14 bg-slate-200 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số đơn đã gửi */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:leaveRequests.summary.totalTitle")}
          >
            {t("card:leaveRequests.summary.totalTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file-text" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            {summary.total}
          </span>
        </div>
      </Card>

      {/* 2. Đang chờ duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:leaveRequests.summary.pendingTitle")}
          >
            {t("card:leaveRequests.summary.pendingTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight whitespace-nowrap">
            {summary.pendingCount}
          </span>
        </div>
      </Card>

      {/* 3. Đơn đã được phê duyệt */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:leaveRequests.summary.approvedTitle")}
          >
            {t("card:leaveRequests.summary.approvedTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight whitespace-nowrap">
            {summary.approvedCount}
          </span>
        </div>
      </Card>

      {/* 4. Tổng ngày nghỉ có phép */}
      <Card className="rounded-xl shadow-2xs hover:border-cyan-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:leaveRequests.summary.daysOffTitle")}
          >
            {t("card:leaveRequests.summary.daysOffTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600 tracking-tight whitespace-nowrap">
            {summary.totalDaysOff}
          </span>
        </div>
      </Card>
    </div>
  );
};
