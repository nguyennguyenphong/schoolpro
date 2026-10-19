import React from "react";
import { useTranslation } from "react-i18next";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components";
import type { LeaveRequestSummary } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestSummaryCardsProps {
  summary?: LeaveRequestSummary | null;
  loading?: boolean;
}

/**
 * Student Leave Request Summary Cards using shared StudentMetricCard.
 */
export const LeaveRequestSummaryCards: React.FC<LeaveRequestSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return <StudentMetricSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Submitted Requests */}
      <StudentMetricCard
        title={t("card:leaveRequests.summary.totalTitle")}
        value={summary.total}
        iconName="file-text"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Pending Approval */}
      <StudentMetricCard
        title={t("card:leaveRequests.summary.pendingTitle")}
        value={summary.pendingCount}
        iconName="clock"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />

      {/* 3. Approved Requests */}
      <StudentMetricCard
        title={t("card:leaveRequests.summary.approvedTitle")}
        value={summary.approvedCount}
        iconName="checkCircle"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />

      {/* 4. Total Excused Leave Days */}
      <StudentMetricCard
        title={t("card:leaveRequests.summary.daysOffTitle")}
        value={summary.totalDaysOff}
        iconName="calendar"
        iconBgClass="bg-cyan-50 text-cyan-600 border-cyan-200"
        hoverBorderClass="hover:border-cyan-400"
      />
    </div>
  );
};

