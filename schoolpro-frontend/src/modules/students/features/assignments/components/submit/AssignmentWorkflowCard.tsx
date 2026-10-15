import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Steps } from "@/components/ui/Steps";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentWorkflowCardProps {
  assignment: AssignmentItem;
  isPastDue: boolean;
}

export const AssignmentWorkflowCard: React.FC<AssignmentWorkflowCardProps> = ({
  assignment,
  isPastDue,
}) => {
  const { t } = useTranslation(["card"]);

  const hasSubmission = Boolean(assignment.submission);

  const currentStep =
    assignment.status === "graded"
      ? 3
      : assignment.status === "submitted" || hasSubmission
        ? 2
        : 1;

  const stepStatus: "process" | "finish" | "error" | "wait" =
    assignment.status === "graded"
      ? "finish"
      : assignment.status === "overdue" && !hasSubmission
        ? "error"
        : "process";

  const attemptNumber = assignment.submission?.attemptNumber ?? 1;

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:assignments.detail.workflowTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Icon name="clock" size={13} className="text-blue-600 shrink-0" />
            <span>{t("card:assignments.card.dueDateLabel")}</span>
            <strong className={isPastDue ? "text-rose-600" : "text-slate-800"}>
              {assignment.dueDate}
            </strong>
          </span>

          {assignment.weightPercent !== undefined && (
            <Tag color="cyan" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:assignments.card.weightBadge", {
                weight: assignment.weightPercent,
              })}
            </Tag>
          )}

          {assignment.status === "graded" ? (
            <Tag color="success" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:assignments.statusLabels.gradedWithScoreUnit", {
                score: assignment.score ?? 0,
                max: assignment.pointsPossible,
              })}
            </Tag>
          ) : assignment.status === "submitted" ? (
            <Tag color="processing" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:assignments.statusLabels.submitted")}
            </Tag>
          ) : assignment.status === "overdue" ? (
            <Tag color="error" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:assignments.statusLabels.overdue")}
            </Tag>
          ) : (
            <Tag color="warning" className="m-0 font-bold text-xs px-2.5 py-0.5">
              {t("card:assignments.statusLabels.notSubmitted")}
            </Tag>
          )}
        </div>
      </div>

      <div className="px-1 sm:px-2">
        <Steps
          size="small"
          current={currentStep}
          status={stepStatus}
          items={[
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:assignments.detail.stepAssigned")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {assignment.assignedDate} • {assignment.teacherName}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:assignments.detail.stepSubmitted")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {assignment.submission?.submittedAt
                    ? `${assignment.submission.submittedAt} (${t("card:assignments.card.attemptBadge", { attempt: attemptNumber })})`
                    : assignment.status === "overdue"
                      ? `${t("card:assignments.statusLabels.overdue")} (${assignment.dueDate})`
                      : `${t("card:assignments.card.dueDateLabel")} ${assignment.dueDate}`}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:assignments.detail.stepGraded")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {assignment.status === "graded"
                    ? `${assignment.gradedByName || assignment.teacherName} • ${t("card:assignments.detail.scoreBadge", { score: assignment.score ?? 0, max: assignment.pointsPossible })}`
                    : `${t("card:assignments.detail.maxPointsField")} ${t("card:assignments.detail.pointsUnit", { points: assignment.pointsPossible })}`}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:assignments.detail.stepCompleted")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {assignment.status === "graded"
                    ? t("card:assignments.statusLabels.gradedWithScoreUnit", {
                        score: assignment.score ?? 0,
                        max: assignment.pointsPossible,
                      })
                    : hasSubmission
                      ? t("card:assignments.statusLabels.submitted")
                      : t("card:assignments.statusLabels.notSubmitted")}
                </span>
              ),
            },
          ]}
        />
      </div>

      {assignment.status === "graded" && assignment.teacherFeedback && (
        <div className="p-3.5 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold mr-1.5">
              {t("card:assignments.detail.gradedByLabel")}{" "}
              {assignment.gradedByName || assignment.teacherName}:
            </span>
            <span className="italic">"{assignment.teacherFeedback}"</span>
          </div>
          {assignment.gradedAt && (
            <span className="text-[11px] opacity-80 shrink-0">
              {assignment.gradedAt}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
