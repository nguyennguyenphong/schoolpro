import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradeSummaryCardsProps {
  summary?: GradeSummary | null;
  loading?: boolean;
}

/**
 * Student Grade Summary Cards matching the clean, responsive layout of LeaveRequestSummaryCards,
 * AttendanceSummaryCards, and ExamSummaryCards without content overflow.
 */
export const GradeSummaryCards: React.FC<GradeSummaryCardsProps> = ({
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
      {/* 1. Điểm trung bình học kỳ */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:gradebook.summary.gpaTitle")}
          >
            {t("card:gradebook.summary.gpaTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            {summary.gpa.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
        </div>
      </Card>

      {/* 2. Xếp loại Học lực */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:gradebook.summary.academicRankTitle")}
          >
            {t("card:gradebook.summary.academicRankTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight whitespace-nowrap">
            {summary.academicRank}
          </span>
        </div>
      </Card>

      {/* 3. Kết quả Rèn luyện */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:gradebook.summary.conductRankTitle")}
          >
            {t("card:gradebook.summary.conductRankTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div
          className="flex items-baseline gap-2 mt-2"
          title={`${summary.attendanceRate}% ${t("card:gradebook.summary.attendanceRateTitle")}`}
        >
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight whitespace-nowrap">
            {summary.conductRank}
          </span>
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            {summary.attendanceRate}%
          </span>
        </div>
      </Card>

      {/* 4. Thứ hạng trong lớp */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:gradebook.summary.classPositionTitle")}
          >
            {t("card:gradebook.summary.classPositionTitle")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="user" size={17} />
          </span>
        </div>

        <div
          className="flex items-baseline gap-1.5 mt-2"
          title={t("card:gradebook.summary.classRankText", {
            rank: summary.classPosition,
            total: summary.totalClassStudents,
          })}
        >
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight whitespace-nowrap">
            #{summary.classPosition}
          </span>
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            / {summary.totalClassStudents}
          </span>
        </div>
      </Card>
    </div>
  );
};
