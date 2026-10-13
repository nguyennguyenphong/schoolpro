import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentDeadlineStatusCardProps {
  assignment: AssignmentItem;
  isPastDue: boolean;
  isSubmittedAndExpired: boolean;
  isGraded: boolean;
  isSubmitted: boolean;
  isOverdue: boolean;
  embedded?: boolean;
}

export const AssignmentDeadlineStatusCard: React.FC<AssignmentDeadlineStatusCardProps> = ({
  assignment,
  isPastDue,
  isSubmittedAndExpired,
  isGraded,
  isSubmitted,
  isOverdue,
  embedded = false,
}) => {
  const { t } = useTranslation(["card"]);

  const content = (
    <div className="divide-y divide-slate-100 text-xs">
      <div className="flex items-center justify-between py-2 first:pt-0">
        <span className="text-slate-500">
          {t("card:assignments.detail.statusField")}
        </span>
        {isSubmittedAndExpired ? (
          <Tag color="default" className="m-0 text-[11px]">
            {t("card:assignments.statusLabels.submittedClosed")}
          </Tag>
        ) : isGraded ? (
          <Tag color="success" className="m-0 text-[11px]">
            {t("card:assignments.statusLabels.graded")}
          </Tag>
        ) : isSubmitted ? (
          <Tag color="processing" className="m-0 text-[11px]">
            {t("card:assignments.statusLabels.submitted")}
          </Tag>
        ) : isOverdue ? (
          <Tag color="error" className="m-0 text-[11px]">
            {t("card:assignments.statusLabels.overdue")}
          </Tag>
        ) : (
          <Tag color="warning" className="m-0 text-[11px]">
            {t("card:assignments.statusLabels.notSubmitted")}
          </Tag>
        )}
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-500">
          {t("card:assignments.detail.dueDateField")}
        </span>
        <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-800"}>
          {assignment.dueDate}
        </strong>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-500">
          {t("card:assignments.detail.portStatusField")}
        </span>
        {isPastDue ? (
          <span className="text-rose-600 font-semibold flex items-center gap-1">
            <Icon name="lock" size={12} />
            <span>{t("card:assignments.detail.portClosedStatus")}</span>
          </span>
        ) : (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Icon name="check" size={12} />
            <span>{t("card:assignments.detail.portOpenStatus")}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-500">
          {t("card:assignments.detail.maxPointsField")}
        </span>
        <strong className="text-slate-800">
          {t("card:assignments.detail.pointsUnit", {
            points: assignment.pointsPossible,
          })}
        </strong>
      </div>

      {assignment.passScore !== undefined && (
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">
            {t("card:assignments.detail.passScoreLabel")}
          </span>
          <strong className="text-slate-800">
            {t("card:assignments.detail.pointsUnit", {
              points: assignment.passScore,
            })}
          </strong>
        </div>
      )}

      {assignment.weightPercent !== undefined && (
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">
            {t("card:assignments.detail.weightField")}
          </span>
          <strong className="text-slate-800">{assignment.weightPercent}%</strong>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-500">
          {t("card:assignments.detail.resubmissionField")}
        </span>
        <strong className="text-slate-700">
          {assignment.allowResubmission !== false
            ? t("card:assignments.detail.resubmissionAllowedValue", {
                count: assignment.maxResubmissionCount ?? 3,
              })
            : t("card:assignments.detail.resubmissionDisallowedValue")}
        </strong>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-500">
          {t("card:assignments.detail.lateSubmissionField")}
        </span>
        <strong className="text-slate-700">
          {t("card:assignments.detail.lateDisallowedValue")}
        </strong>
      </div>

      <div className="flex items-center justify-between py-2 last:pb-0">
        <span className="text-slate-500">
          {t("card:assignments.detail.submissionModeField")}
        </span>
        <strong className="text-blue-600">
          {t("card:assignments.detail.submissionModeOnline")}
        </strong>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
        <h3 className="text-sm font-bold text-slate-900 mb-0">
          {t("card:assignments.detail.deadlineCardTitle")}
        </h3>
      </div>
      {content}
    </div>
  );
};
