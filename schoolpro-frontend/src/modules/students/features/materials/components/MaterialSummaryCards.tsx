import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { MaterialSummary } from "@/modules/students/features/materials/types";

interface MaterialSummaryCardsProps {
  summary?: MaterialSummary | null;
  loading?: boolean;
}

/**
 * Student Material Summary Cards matching the clean, responsive layout of LeaveRequestSummaryCards,
 * AttendanceSummaryCards, and AssignmentSummaryCards.
 */
export const MaterialSummaryCards: React.FC<MaterialSummaryCardsProps> = ({
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

  const outlinesAndExams = summary.outlinesCount + summary.examPrepsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số tài liệu */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:materials.summary.totalMaterials", "Tổng số tài liệu")}
          >
            {t("card:materials.summary.totalMaterials", "Tổng số tài liệu")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            {summary.total}
          </span>
        </div>
      </Card>

      {/* 2. Bài giảng điện tử */}
      <Card className="rounded-xl shadow-2xs hover:border-indigo-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:materials.summary.lectures", "Bài giảng điện tử")}
          >
            {t("card:materials.summary.lectures", "Bài giảng điện tử")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Icon name="presentation" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight whitespace-nowrap">
            {summary.lecturesCount}
          </span>
        </div>
      </Card>

      {/* 3. Đề cương & Đề thi */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:materials.summary.outlinesAndExams", "Đề cương & Đề thi")}
          >
            {t("card:materials.summary.outlinesAndExams", "Đề cương & Đề thi")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight whitespace-nowrap">
            {outlinesAndExams}
          </span>
        </div>
      </Card>

      {/* 4. Tổng lượt tải về */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
            title={t("card:materials.summary.totalDownloads", "Tổng lượt tải về")}
          >
            {t("card:materials.summary.totalDownloads", "Tổng lượt tải về")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="download" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight whitespace-nowrap">
            {summary.totalDownloads.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
};
