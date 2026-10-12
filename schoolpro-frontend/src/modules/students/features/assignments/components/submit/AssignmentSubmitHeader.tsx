import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentSubmitHeaderProps {
  assignment: AssignmentItem;
  isPastDue: boolean;
  typeLabel: string;
  onBack: () => void;
}

export const AssignmentSubmitHeader: React.FC<AssignmentSubmitHeaderProps> = ({
  assignment,
  isPastDue,
  typeLabel,
  onBack,
}) => {
  const { t } = useTranslation(["card", "button", "navigation"]);

  const currentStep =
    assignment.status === "graded"
      ? 3
      : assignment.status === "submitted" || Boolean(assignment.submission)
        ? 1
        : 0;

  const steps = [
    { key: "assigned", label: t("card:assignments.detail.stepAssigned") },
    { key: "submitted", label: t("card:assignments.detail.stepSubmitted") },
    { key: "graded", label: t("card:assignments.detail.stepGraded") },
    { key: "completed", label: t("card:assignments.detail.stepCompleted") },
  ];

  const extensionLevel = assignment.extensions?.length ?? 1;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3.5">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            href: "/student/assignments",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.assignments")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>{t("card:assignments.detail.breadcrumbDetail")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {assignment.title}
            </h1>
            <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl">
              {assignment.subjectName}
            </span>
            <span className="text-xs text-slate-600 bg-slate-100 border border-[#f0f0f0] px-2 py-0.5 rounded-xl">
              {typeLabel}
            </span>
            {assignment.status === "graded" && (
              <Tag color="success" className="m-0 font-semibold text-xs">
                {t("card:assignments.statusLabels.gradedWithScoreUnit", {
                  score: assignment.score ?? 0,
                  max: assignment.pointsPossible,
                })}
              </Tag>
            )}
            {assignment.status === "submitted" && (
              <Tag color="processing" className="m-0 font-semibold text-xs">
                {t("card:assignments.statusLabels.submitted")}
              </Tag>
            )}
            {assignment.status === "overdue" && (
              <Tag color="error" className="m-0 font-semibold text-xs">
                {t("card:assignments.statusLabels.overdue")}
              </Tag>
            )}
            {assignment.status === "pending" && (
              <Tag color="warning" className="m-0 font-semibold text-xs">
                {t("card:assignments.statusLabels.notSubmitted")}
              </Tag>
            )}
          </div>

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
            <span className="inline-flex items-center gap-1.5">
              <span>{t("card:assignments.card.dueDateLabel")}</span>
              <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-700"}>
                {assignment.dueDate}
              </strong>
              {assignment.isExtended && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  {t("card:assignments.card.extendedBadge", {
                    level: extensionLevel,
                  })}
                </span>
              )}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onBack}
          className="shrink-0 self-start sm:self-auto"
        >
          <Icon name="arrow-left" size={13} />
          {t("button:assignmentsList")}
        </Button>
      </div>

      {/* Workflow Step Progress Bar */}
      <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isOverdueStep = assignment.status === "overdue" && idx === 1;
          return (
            <div
              key={step.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                isOverdueStep
                  ? "bg-rose-50/70 border-rose-200 text-rose-800"
                  : isCompleted
                    ? "bg-blue-50/60 border-blue-200 text-blue-900"
                    : "bg-slate-50/60 border-[#f0f0f0] text-slate-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isOverdueStep
                    ? "bg-rose-600 text-white"
                    : isCompleted
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {isCompleted ? <Icon name="check" size={11} /> : idx + 1}
              </span>
              <span className="font-semibold truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
