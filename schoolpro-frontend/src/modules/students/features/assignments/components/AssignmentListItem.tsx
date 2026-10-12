import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentListItemProps {
  assignment: AssignmentItem;
  onClick: (item: AssignmentItem) => void;
}

export const AssignmentListItem: React.FC<AssignmentListItemProps> = ({
  assignment,
  onClick,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        return (
          <Tag color="success" className="m-0 font-semibold text-xs whitespace-nowrap">
            {t("card:assignments.statusLabels.gradedWithScore", {
              score: assignment.score ?? 0,
              max: assignment.pointsPossible,
            })}
          </Tag>
        );
      case "submitted":
        return (
          <Tag color="processing" className="m-0 font-semibold text-xs whitespace-nowrap">
            {t("card:assignments.statusLabels.submitted")}
          </Tag>
        );
      case "overdue":
        return (
          <Tag color="error" className="m-0 font-semibold text-xs whitespace-nowrap">
            {t("card:assignments.statusLabels.overdue")}
          </Tag>
        );
      case "pending":
      default:
        return (
          <Tag color="warning" className="m-0 font-semibold text-xs whitespace-nowrap">
            {t("card:assignments.statusLabels.pending")}
          </Tag>
        );
    }
  };

  const getTypeLabel = () => {
    switch (assignment.type) {
      case "quiz":
        return t("card:assignments.typeLabels.quiz");
      case "project":
        return t("card:assignments.typeLabels.project");
      case "essay":
        return t("card:assignments.typeLabels.essay");
      case "homework":
      default:
        return t("card:assignments.typeLabels.homework");
    }
  };

  const latestExtension =
    assignment.extensions && assignment.extensions.length > 0
      ? assignment.extensions[assignment.extensions.length - 1]
      : null;

  return (
    <div
      onClick={() => onClick(assignment)}
      className="bg-white rounded-xl border border-[#f0f0f0] hover:border-blue-300 shadow-2xs p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl whitespace-nowrap">
            {assignment.subjectName}
          </span>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
            {getTypeLabel()}
          </span>
          {getStatusBadge()}
          {latestExtension && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-xl whitespace-nowrap">
              {t("card:assignments.card.extendedBadge", { level: latestExtension.level })}
            </span>
          )}
        </div>

        <h3
          className="text-sm sm:text-base font-bold text-slate-900 transition-colors mb-0 truncate"
          title={assignment.title}
        >
          {assignment.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon
              name="clock"
              size={13}
              className={assignment.status === "overdue" ? "text-rose-500" : "text-slate-400"}
            />
            <span>
              {t("card:assignments.card.dueDateLabel")}{" "}
              <strong
                className={
                  assignment.status === "overdue" ? "text-rose-600" : "text-slate-700"
                }
              >
                {assignment.dueDate}
              </strong>
            </span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="user" size={13} className="text-slate-400" />
            <span>{assignment.teacherName}</span>
          </span>
          {assignment.attachments && assignment.attachments.length > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-blue-600 whitespace-nowrap">
                <Icon name="file" size={13} />
                <span>
                  {t("card:assignments.card.attachmentsCount", {
                    count: assignment.attachments.length,
                  })}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end">
        <Button
          variant={assignment.status === "pending" ? "primary" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onClick(assignment);
          }}
          className="whitespace-nowrap"
        >
          {assignment.status === "pending"
            ? t("button:submitAssignmentNow")
            : assignment.status === "graded"
              ? t("button:viewResult")
              : t("button:viewDetail")}
        </Button>
      </div>
    </div>
  );
};
