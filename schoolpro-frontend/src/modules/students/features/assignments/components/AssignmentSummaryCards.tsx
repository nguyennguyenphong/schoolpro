import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentSummary } from "@/modules/students/features/assignments/types";

interface AssignmentSummaryCardsProps {
  summary: AssignmentSummary;
}

export const AssignmentSummaryCards: React.FC<AssignmentSummaryCardsProps> = ({ summary }) => {
  const { t } = useTranslation(["card", "common"]);

  const completedCount = summary.submittedCount + summary.gradedCount;
  const completionPercentage =
    summary.total > 0 ? Math.round((completedCount / summary.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số bài tập */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:assignments.summary.total")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:assignments.summary.tasks")}
          </span>
          {summary.semesterName && (
            <Tag color="processing" className="ml-auto m-0 font-semibold">
              {summary.semesterName}
            </Tag>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:assignments.summary.scope")}{" "}
            <strong className="text-slate-700">
              {summary.className || t("card:assignments.summary.scopeAll")}
            </strong>
          </span>
          <span className="text-blue-600 font-medium">
            {t("card:assignments.summary.all")}
          </span>
        </div>
      </Card>

      {/* 2. Cần hoàn thành */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:assignments.summary.pending")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:assignmentUnit")}
          </span>
          <Tag
            color={summary.pendingCount > 0 ? "warning" : "success"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.pendingCount > 0
              ? t("card:assignments.summary.needSubmit")
              : t("card:assignments.summary.allDone")}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:assignments.summary.completionRate", { rate: completionPercentage })}
          </span>
          <span className="text-amber-600 font-medium">
            {completedCount}/{summary.total}
          </span>
        </div>
      </Card>

      {/* 3. Quá hạn / Cần chú ý */}
      <Card className="rounded-xl shadow-2xs hover:border-rose-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:assignments.summary.overdue")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Icon name="warning" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {summary.overdueCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:assignmentUnit")}
          </span>
          <Tag color="error" className="ml-auto m-0 font-semibold">
            {summary.overdueCount > 0
              ? t("card:assignments.summary.urgent")
              : t("card:assignments.summary.none")}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:assignments.summary.contactTeacher")}
          </span>
          <span className="text-rose-600 font-semibold">
            {t("card:assignments.summary.checkNow")}
          </span>
        </div>
      </Card>

      {/* 4. Đã chấm & Điểm trung bình */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:assignments.summary.graded")}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.gradedCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:assignmentUnit")}
          </span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {t("card:assignments.summary.avgScore", { score: summary.averageScore })}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:assignments.summary.waitingGrade", { count: summary.submittedCount })}
          </span>
          <span className="text-emerald-600 font-semibold">
            {t("card:assignments.summary.goodEval")}
          </span>
        </div>
      </Card>
    </div>
  );
};
