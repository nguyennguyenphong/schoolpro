import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentModalHeaderProps {
  assignment: AssignmentItem;
}

export const AssignmentModalHeader: React.FC<AssignmentModalHeaderProps> = ({
  assignment,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="border-b border-[#f0f0f0] pb-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl">
          {assignment.subjectName}
        </span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {t("card:assignments.card.maxScoreBadge", {
            max: assignment.pointsPossible,
          })}
        </span>
        {assignment.status === "graded" && (
          <Tag color="success" className="m-0 font-bold text-xs">
            {t("card:assignments.statusLabels.gradedWithScoreUnit", {
              score: assignment.score ?? 0,
              max: assignment.pointsPossible,
            })}
          </Tag>
        )}
        {assignment.status === "submitted" && (
          <Tag color="processing" className="m-0 font-semibold text-xs">
            {t("card:assignments.statusLabels.submittedWaitingGrade")}
          </Tag>
        )}
        {assignment.status === "overdue" && (
          <Tag color="error" className="m-0 font-semibold text-xs">
            {t("card:assignments.statusLabels.overdue")}
          </Tag>
        )}
        {assignment.status === "pending" && (
          <Tag color="warning" className="m-0 font-semibold text-xs">
            {t("card:assignments.statusLabels.pending")}
          </Tag>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
        {assignment.title}
      </h3>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          {t("card:assignments.card.teacherLabel")}{" "}
          <strong className="text-slate-700">{assignment.teacherName}</strong>
        </span>
        <span>•</span>
        <span>
          {t("card:assignments.card.assignedDateLabel")}{" "}
          <strong className="text-slate-700">{assignment.assignedDate}</strong>
        </span>
        <span>•</span>
        <span>
          {t("card:assignments.card.dueDateLabel")}{" "}
          <strong
            className={
              assignment.status === "overdue" ? "text-rose-600 font-bold" : "text-slate-700"
            }
          >
            {assignment.dueDate}
          </strong>
        </span>
      </div>
    </div>
  );
};
