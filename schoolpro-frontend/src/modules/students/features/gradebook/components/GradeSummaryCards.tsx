import React from "react";
import { useTranslation } from "react-i18next";
import {
  StudentMetricCard,
  StudentMetricSkeleton,
} from "@/modules/students/components";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradeSummaryCardsProps {
  summary?: GradeSummary | null;
  loading?: boolean;
}

/**
 * Student Grade Summary Cards using shared StudentMetricCard.
 */
export const GradeSummaryCards: React.FC<GradeSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return <StudentMetricSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Điểm trung bình học kỳ */}
      <StudentMetricCard
        title={t("card:gradebook.summary.gpaTitle")}
        value={summary.gpa.toFixed(2)}
        unit="/ 10.0"
        iconName="chart"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Xếp loại Học lực */}
      <StudentMetricCard
        title={t("card:gradebook.summary.academicRankTitle")}
        value={summary.academicRank}
        iconName="book"
        iconBgClass="bg-purple-50 text-purple-600 border-purple-200"
        hoverBorderClass="hover:border-purple-400"
      />

      {/* 3. Kết quả Rèn luyện */}
      <StudentMetricCard
        title={t("card:gradebook.summary.conductRankTitle")}
        value={summary.conductRank}
        unit={`${summary.attendanceRate}%`}
        iconName="check"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />

      {/* 4. Thứ hạng trong lớp */}
      <StudentMetricCard
        title={t("card:gradebook.summary.classPositionTitle")}
        value={`#${summary.classPosition}`}
        unit={`/ ${summary.totalClassStudents}`}
        iconName="user"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />
    </div>
  );
};

