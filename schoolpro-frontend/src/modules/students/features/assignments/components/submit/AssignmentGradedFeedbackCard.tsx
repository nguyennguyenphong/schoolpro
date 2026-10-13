import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentGradedFeedbackCardProps {
  assignment: AssignmentItem;
  embedded?: boolean;
}

export const AssignmentGradedFeedbackCard: React.FC<AssignmentGradedFeedbackCardProps> = ({
  assignment,
  embedded = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (assignment.status !== "graded") return null;

  const maxScore = assignment.pointsPossible;
  const hasPenalty = Boolean(
    assignment.penaltyDeduction && assignment.penaltyDeduction > 0,
  );

  const content = (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center justify-between gap-2">
          <span className="text-slate-500">
            {t("card:assignments.detail.gradedByLabel")}
          </span>
          <strong className="text-slate-800 truncate">
            {assignment.gradedByName || assignment.teacherName}
          </strong>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center justify-between gap-2">
          <span className="text-slate-500">
            {t("card:assignments.detail.rawScoreLabel")}
          </span>
          <strong className="text-slate-800 whitespace-nowrap">
            {assignment.rawScore ?? assignment.score} / {maxScore}
          </strong>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center justify-between gap-2">
          <span className="text-slate-500">
            {hasPenalty
              ? t("card:assignments.detail.penaltyDeductionLabel")
              : t("card:assignments.detail.maxScoreLabel")}
          </span>
          {hasPenalty ? (
            <strong className="text-rose-600 whitespace-nowrap">
              -{assignment.penaltyDeduction}
            </strong>
          ) : (
            <strong className="text-slate-800 whitespace-nowrap">{maxScore}</strong>
          )}
        </div>
      </div>

      {assignment.teacherFeedback && (
        <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs text-slate-800 italic leading-relaxed">
          "{assignment.teacherFeedback}"
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="p-4 border border-emerald-200 bg-emerald-50/40 rounded-xl">
        {content}
      </div>
    );
  }

  return (
    <div className="p-5 border border-emerald-200 bg-emerald-50/50 rounded-xl shadow-2xs space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200/70">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-base font-bold text-emerald-950 mb-0">
            {t("card:assignments.detail.gradedFeedbackTitle")}
          </h3>
        </div>
        <Tag color="success" className="m-0 text-xs font-bold px-2.5 py-0.5">
          {t("card:assignments.detail.scoreBadge", {
            score: assignment.score ?? 0,
            max: maxScore,
          })}
        </Tag>
      </div>
      {content}
    </div>
  );
};
