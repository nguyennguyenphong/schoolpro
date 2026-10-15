import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ExamSummary } from "@/modules/students/features/exams/types";

interface ExamSummaryCardsProps {
  summary?: ExamSummary | null;
  loading?: boolean;
}

/**
 * Student Exam Summary Cards matching the clean, responsive layout of LeaveRequestSummaryCards and AttendanceSummaryCards.
 */
export const ExamSummaryCards: React.FC<ExamSummaryCardsProps> = ({
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
      {/* 1. Tổng số đề thi */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:exams.summary.totalTitle")}
          >
            {t("card:exams.summary.totalTitle")}
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

      {/* 2. Cần thực hiện */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:exams.summary.pendingTitle")}
          >
            {t("card:exams.summary.pendingTitle")}
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

      {/* 3. Đã hoàn thành */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:exams.summary.completedTitle")}
          >
            {t("card:exams.summary.completedTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight whitespace-nowrap">
            {summary.completedCount}
          </span>
        </div>
      </Card>

      {/* 4. Điểm trung bình */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:exams.summary.avgScoreTitle")}
          >
            {t("card:exams.summary.avgScoreTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight whitespace-nowrap">
            {summary.averageScore > 0 ? summary.averageScore : "--"}
          </span>
        </div>
      </Card>
    </div>
  );
};
