import React from "react";
import { useTranslation } from "react-i18next";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components";
import type { MaterialSummary } from "@/modules/students/features/materials/types";

interface MaterialSummaryCardsProps {
  summary?: MaterialSummary | null;
  loading?: boolean;
}

/**
 * Student Material Summary Cards using shared StudentMetricCard.
 */
export const MaterialSummaryCards: React.FC<MaterialSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return <StudentMetricSkeleton count={4} />;
  }

  const outlinesAndExams = summary.outlinesCount + summary.examPrepsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số tài liệu */}
      <StudentMetricCard
        title={t("card:materials.summary.totalMaterials")}
        value={summary.total}
        iconName="file"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Bài giảng điện tử */}
      <StudentMetricCard
        title={t("card:materials.summary.lectures")}
        value={summary.lecturesCount}
        iconName="presentation"
        iconBgClass="bg-indigo-50 text-indigo-600 border-indigo-200"
        hoverBorderClass="hover:border-indigo-400"
      />

      {/* 3. Đề cương & Đề thi */}
      <StudentMetricCard
        title={t("card:materials.summary.outlinesAndExams")}
        value={outlinesAndExams}
        iconName="book"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />

      {/* 4. Tổng lượt tải về */}
      <StudentMetricCard
        title={t("card:materials.summary.totalDownloads")}
        value={summary.totalDownloads.toLocaleString()}
        iconName="download"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />
    </div>
  );
};

