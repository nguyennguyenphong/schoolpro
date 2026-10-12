import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { FileItemCard } from "@/modules/students/features/assignments/components/FileItemCard";
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
  onRequestReopen: () => void;
  onStartResubmit: () => void;
}

export const AssignmentSubmissionView: React.FC<AssignmentSubmissionViewProps> = ({
  assignment,
  files,
  isSubmittedAndExpired,
  isGraded,
  onPreview,
  onRequestReopen,
  onStartResubmit,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const attemptNumber = assignment.submission?.attemptNumber ?? 1;
  const maxAttempts = (assignment.maxResubmissionCount ?? 3) + 1;
  const canResubmit =
    assignment.allowResubmission !== false && attemptNumber < maxAttempts;

  return (
    <div className="space-y-3.5">
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

      {/* Sub-case 1A: Submission is EXPIRED -> Port CLOSED + Reopen Request Button */}
      {isSubmittedAndExpired && (
        <div className="p-4 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#f0f0f0]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Icon name="lock" size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {t("card:assignments.detail.portClosedTitle")}
                  </span>
                  <Tag color="default">
                    {t("card:assignments.detail.expiredTag")}
                  </Tag>
                </div>
                <span className="text-xs text-slate-500">
                  {t("card:assignments.detail.portClosedDesc", {
                    dueDate: assignment.dueDate,
                  })}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onRequestReopen}
              className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 self-start sm:self-auto"
            >
              <Icon name="mail" size={13} className="mr-1.5 text-blue-600" />
              <span>
                {assignment.reopenRequest
                  ? t("button:resendReopenRequest")
                  : t("button:requestReopenPort")}
              </span>
            </Button>
          </div>

          {assignment.reopenRequest && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={13} className="text-amber-600" />
                  <span>{t("card:assignments.detail.reopenSentTitle")}</span>
                </span>
                <Tag color="warning">
                  {t("card:assignments.detail.reopenWaitingTag")}
                </Tag>
              </div>
              <p className="text-slate-600 mb-0">
                {t("card:assignments.detail.reopenSentMeta", {
                  email: assignment.reopenRequest.teacherEmail,
                  time: assignment.reopenRequest.requestedAt,
                })}
              </p>
              <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic">
                "{assignment.reopenRequest.reason}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-case 1B: Still within deadline & not graded -> Allows Re-submitting */}
      {!isSubmittedAndExpired && !isGraded && canResubmit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-500 italic">
            {t("card:assignments.detail.resubmitAllowedHint", {
              dueDate: assignment.dueDate,
              attempt: attemptNumber,
              maxAttempts,
            })}
          </span>
          <Button
            variant="outline"
            onClick={onStartResubmit}
            className="self-end sm:self-auto"
          >
            <Icon name="refresh" size={12} />
            {t("button:resubmitAssignment")}
          </Button>
        </div>
      )}
    </div>
  );
};
