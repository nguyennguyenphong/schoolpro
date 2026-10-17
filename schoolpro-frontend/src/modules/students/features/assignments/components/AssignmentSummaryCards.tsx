import React from "react";
import { useTranslation } from "react-i18next";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components";
import type { AssignmentSummary } from "@/modules/students/features/assignments/types";

interface AssignmentSummaryCardsProps {
  summary?: AssignmentSummary | null;
  loading?: boolean;
}

/**
 * Student Assignment Summary Cards using shared StudentMetricCard.
 */
export const AssignmentSummaryCards: React.FC<AssignmentSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return <StudentMetricSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số bài tập */}
      <StudentMetricCard
        title={t("card:assignments.summary.total")}
        value={summary.total}
        iconName="file-text"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Chưa hoàn thành */}
      <StudentMetricCard
        title={t("card:assignments.summary.pending")}
        value={summary.pendingCount}
        iconName="clock"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />

      {/* 3. Đã quá hạn */}
      <StudentMetricCard
        title={t("card:assignments.summary.overdue")}
        value={summary.overdueCount}
        iconName="warning"
        iconBgClass="bg-rose-50 text-rose-600 border-rose-200"
        hoverBorderClass="hover:border-rose-400"
      />

      {/* 4. Đã chấm điểm */}
      <StudentMetricCard
        title={t("card:assignments.summary.graded")}
        value={summary.gradedCount}
        iconName="checkCircle"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />
    </div>
  );
};


