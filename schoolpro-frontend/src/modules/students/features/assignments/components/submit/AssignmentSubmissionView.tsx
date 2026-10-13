import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { FileItemCard } from "@/modules/students/features/assignments/components/FileItemCard";
import { AssignmentGradedFeedbackCard } from "@/modules/students/features/assignments/components/submit/AssignmentGradedFeedbackCard";
import type {
  AssignmentItem,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";

interface AssignmentSubmissionViewProps {
  assignment: AssignmentItem;
  files: SubmittedFile[];
  isSubmittedAndExpired: boolean;
  isGraded: boolean;
  onPreview: (file: SubmittedFile) => void;
  onStartResubmit: () => void;
}

export const AssignmentSubmissionView: React.FC<AssignmentSubmissionViewProps> = ({
  assignment,
  files,
  isSubmittedAndExpired,
  isGraded,
  onPreview,
  onStartResubmit,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const attemptNumber = assignment.submission?.attemptNumber ?? 1;
  const maxAttempts = (assignment.maxResubmissionCount ?? 3) + 1;
  const canResubmit = !isSubmittedAndExpired && !isGraded;

  return (
    <div className="space-y-4">
      {/* 1. Teacher Grading & Score Result Section */}
      {isGraded ? (
        <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200/70">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="text-sm font-bold text-emerald-950">
                {t("card:assignments.detail.gradedFeedbackTitle")}
              </span>
            </div>
            <Tag color="success" className="m-0 text-xs font-bold px-2.5 py-0.5">
              {t("card:assignments.detail.scoreBadge", {
                score: assignment.score ?? 0,
                max: assignment.pointsPossible,
              })}
            </Tag>
          </div>
          <AssignmentGradedFeedbackCard
            assignment={assignment}
            embedded
          />
        </div>
      ) : (
        <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="clock" size={15} />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-950 block">
                {t("card:assignments.detail.waitingTeacherGradeTitle")}
              </span>
              <p className="text-xs text-slate-600 mb-0 leading-relaxed">
                {t("card:assignments.detail.waitingTeacherGradeDesc")}
              </p>
            </div>
          </div>
          <Tag color="warning" className="m-0 text-xs font-bold px-2.5 py-0.5 shrink-0 self-start sm:self-center">
            {t("card:assignments.detail.pendingScoreBadge", {
              max: assignment.pointsPossible,
            })}
          </Tag>
        </div>
      )}

      {/* 2. Submitted Work Read-Only Details */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-blue-900 font-bold border-b border-blue-200/70 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-emerald-600 shrink-0" />
              <span>{t("card:assignments.detail.submissionSuccessBanner")}</span>
            </span>
            <Tag color="processing" className="m-0 text-[10px]">
              {t("card:assignments.card.attemptBadge", {
                attempt: attemptNumber,
              })}
            </Tag>
            {assignment.submission?.isLate && (
              <Tag color="warning" className="m-0 text-[10px]">
                {t("card:assignments.card.lateBadge")}
              </Tag>
            )}
          </div>
          <span className="text-slate-500 font-normal text-[11px]">
            {t("card:assignments.detail.submittedAtLabel", {
              time: assignment.submission?.submittedAt ?? "",
            })}
          </span>
        </div>

        {/* List of submitted files */}
        {files.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              {t("card:assignments.detail.submittedFilesLabel", {
                count: files.length,
              })}
            </span>
            <div className="space-y-2">
              {files.map((file) => (
                <FileItemCard
                  key={file.id}
                  file={file}
                  readOnly
                  onPreview={onPreview}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submission note if any */}
        {assignment.submission?.content && (
          <div className="pt-1">
            <span className="text-slate-500 block mb-1 font-medium">
              {t("card:assignments.detail.studentNoteLabel")}
            </span>
            <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-[#f0f0f0] mb-0 leading-relaxed">
              "{assignment.submission.content}"
            </p>
          </div>
        )}
      </div>

      {/* 3A. Submitted & Expired -> View-only notice (no resubmit, no reopen request) */}
      {isSubmittedAndExpired && (
        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Icon name="lock" size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {t("card:assignments.detail.portClosedTitle")}
                </span>
                <Tag color="default" className="m-0 text-[10px]">
                  {t("card:assignments.detail.viewOnlyTag")}
                </Tag>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {t("card:assignments.detail.submittedExpiredViewOnlyDesc", {
                  dueDate: assignment.dueDate,
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3B. Still within deadline & not graded -> Allows Re-submitting */}
      {canResubmit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-500 italic">
            {t("card:assignments.detail.resubmitAllowedHint", {
              dueDate: assignment.dueDate,
              attempt: attemptNumber,
              maxAttempts: Math.max(maxAttempts, attemptNumber + 1),
            })}
          </span>
          <Button
            variant="outline"
            onClick={onStartResubmit}
            className="self-end sm:self-auto shrink-0"
          >
            <Icon name="refresh" size={12} />
            <span>{t("button:resubmitAssignment")}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

