import React from "react";
import { useTranslation } from "react-i18next";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradebookPrintSummaryProps {
  summary: GradeSummary | null;
}

export const GradebookPrintSummary: React.FC<GradebookPrintSummaryProps> = ({ summary }) => {
  const { t } = useTranslation(["card"]);

  if (!summary) return null;

  return (
    <div className="border border-slate-800 rounded-sm bg-white text-xs text-slate-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
        {/* Left column: Metrics */}
        <div className="p-3 space-y-1.5">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-300">
            {t("card:gradebook.transcriptModal.summaryResultsTitle")}
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-medium text-slate-700">
              {t("card:gradebook.print.gpa")}
            </span>
            <strong className="text-slate-900 text-sm font-black">
              {summary.gpa.toFixed(2)} / 10
            </strong>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-medium text-slate-700">
              {t("card:gradebook.print.academicRank")}
            </span>
            <strong className="text-slate-900 font-bold">{summary.academicRank}</strong>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-medium text-slate-700">
              {t("card:gradebook.print.conductRank")}
            </span>
            <strong className="text-slate-900 font-bold">{summary.conductRank}</strong>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-medium text-slate-700">
              {t("card:gradebook.print.classPosition")}
            </span>
            <strong className="text-slate-900 font-bold">
              {t("card:gradebook.summary.classRankText", {
                rank: summary.classPosition,
                total: summary.totalClassStudents,
              })}
            </strong>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-medium text-slate-700">
              {t("card:gradebook.print.titleAwarded")}
            </span>
            <strong className="text-slate-900 font-bold">{summary.titleAwarded}</strong>
          </div>
        </div>

        {/* Right column: Homeroom remarks */}
        <div className="p-3 flex flex-col justify-between space-y-2">
          <div>
            <div className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-300">
              {t("card:gradebook.print.homeroomComment")}
            </div>
            <p className="italic text-slate-800 leading-relaxed mt-2 mb-0">
              "{summary.homeroomComment || "Học sinh chăm ngoan, có ý thức tự giác học tập cao, chấp hành tốt nội quy nhà trường."}"
            </p>
          </div>
          <div className="pt-2 border-t border-slate-300 text-[11px] text-slate-600 flex justify-between items-center">
            <span>
              {t("card:gradebook.summary.homeroomTeacher")} <strong>{summary.homeroomTeacher}</strong>
            </span>
            <span className="font-semibold text-slate-700">✓ Đã xác nhận học bạ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
