import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentCardProps {
  assignment?: AssignmentItem;
  onClick?: (item: AssignmentItem) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onClick,
}) => {
  const { t } = useTranslation(["card", "button"]);

  if (!assignment) {
    return null;
  }

  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        return (
          <Tag color="success" className="m-0 font-semibold text-[11px] whitespace-nowrap shrink-0">
            {t("card:assignments.statusLabels.gradedWithScore", {
              score: assignment.score ?? 0,
              max: assignment.pointsPossible,
            })}
          </Tag>
        );
      case "submitted":
        return (
          <Tag color="processing" className="m-0 font-semibold text-[11px] whitespace-nowrap shrink-0">
            {t("card:assignments.statusLabels.submitted")}
          </Tag>
        );
      case "overdue":
        return (
          <Tag color="error" className="m-0 font-semibold text-[11px] whitespace-nowrap shrink-0">
            {t("card:assignments.statusLabels.overdue")}
          </Tag>
        );
      case "pending":
      default:
        return (
          <Tag color="warning" className="m-0 font-semibold text-[11px] whitespace-nowrap shrink-0">
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
      className="bg-white border border-[#f0f0f0] rounded-xl p-4 flex flex-col justify-between gap-3.5 transition-all shadow-2xs h-full"
    >
      <div className="flex flex-col gap-2.5">
        {/* Row 1: Subject Badge & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl truncate max-w-[60%]">
            {assignment.subjectName}
          </span>
          {getStatusBadge()}
        </div>

        {/* Row 2: Title (2 lines) */}
        <h4
          className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug min-h-10 mb-0"
          title={assignment.title}
        >
          {assignment.title}
        </h4>

        {/* Row 3: Highlighted Due Date & Extension/Attempt Pill */}
        <div
          className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 border text-xs ${
            assignment.status === "overdue"
              ? "bg-rose-50/60 border-rose-200/70"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon
              name="clock"
              size={13}
              className={`shrink-0 ${
                assignment.status === "overdue" ? "text-rose-500" : "text-slate-400"
              }`}
            />
            <span className="truncate font-medium text-slate-600">
              {t("card:assignments.card.dueShort")}{" "}
              <strong
                className={
                  assignment.status === "overdue" ? "text-rose-600" : "text-slate-800"
                }
              >
                {assignment.dueDate}
              </strong>
            </span>
          </div>

          {latestExtension ? (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
              {t("card:assignments.card.extendedBadge", { level: latestExtension.level })}
            </span>
          ) : assignment.submission?.attemptNumber && assignment.submission.attemptNumber > 1 ? (
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
              {t("card:assignments.card.attemptBadge", {
                attempt: assignment.submission.attemptNumber,
              })}
            </span>
          ) : null}
        </div>

        {/* Row 4: Teacher & Attachments Meta */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name="user" size={13} className="text-slate-400 shrink-0" />
            <span className="truncate" title={assignment.teacherName}>
              {t("card:assignments.card.teacherLabel")} {assignment.teacherName}
            </span>
          </div>
          {assignment.attachments && assignment.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium whitespace-nowrap shrink-0">
              <Icon name="file" size={12} />
              <span>{assignment.attachments.length}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Row: Type Badge & Action Button */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap truncate">
          <Icon name="file" size={11} className="text-slate-400 shrink-0" />
          <span className="truncate">{getTypeLabel()}</span>
        </span>

        <Button
          variant={assignment.status === "pending" ? "primary" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(assignment);
          }}
          className="whitespace-nowrap shrink-0"
          href={`/student/assignments/${assignment.id}`}
        >
          {assignment.status === "pending"
            ? t("button:submitAssignmentShort")
            : assignment.status === "graded"
              ? t("button:viewScore")
              : t("button:viewDetail")}
        </Button>
      </div>
    </div>
  );
};
