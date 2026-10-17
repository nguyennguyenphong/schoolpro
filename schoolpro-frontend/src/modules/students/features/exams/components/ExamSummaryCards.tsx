import React from "react";
import { useTranslation } from "react-i18next";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components";
import type { ExamSummary } from "@/modules/students/features/exams/types";

interface ExamSummaryCardsProps {
  summary?: ExamSummary | null;
  loading?: boolean;
}

/**
 * Student Exam Summary Cards using shared StudentMetricCard.
 */
export const ExamSummaryCards: React.FC<ExamSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return <StudentMetricSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số đề thi */}
      <StudentMetricCard
        title={t("card:exams.summary.totalTitle")}
        value={summary.total}
        iconName="file-text"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Cần thực hiện */}
      <StudentMetricCard
        title={t("card:exams.summary.pendingTitle")}
        value={summary.pendingCount}
        iconName="clock"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />

      {/* 3. Đã hoàn thành */}
      <StudentMetricCard
        title={t("card:exams.summary.completedTitle")}
        value={summary.completedCount}
        iconName="checkCircle"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />

      {/* 4. Điểm trung bình */}
      <StudentMetricCard
        title={t("card:exams.summary.avgScoreTitle")}
        value={summary.averageScore > 0 ? summary.averageScore : "--"}
        iconName="chart"
        iconBgClass="bg-purple-50 text-purple-600 border-purple-200"
        hoverBorderClass="hover:border-purple-400"
      />
    </div>
  );
};

