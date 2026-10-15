import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { AssignmentSubmissionView } from "@/modules/students/features/assignments/components/submit/AssignmentSubmissionView";
import { AssignmentOverdueCard } from "@/modules/students/features/assignments/components/submit/AssignmentOverdueCard";
import { AssignmentSubmitForm } from "@/modules/students/features/assignments/components/submit/AssignmentSubmitForm";
import { AssignmentGradedFeedbackCard } from "@/modules/students/features/assignments/components/submit/AssignmentGradedFeedbackCard";
import type {
  AssignmentItem,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";

interface AssignmentSubmissionWorkspaceCardProps {
  assignment: AssignmentItem;
  files: SubmittedFile[];
  onFilesChange: (files: SubmittedFile[]) => void;
  onPreview: (file: SubmittedFile) => void;
  submissionContent: string;
  onContentChange: (val: string) => void;
  isResubmitting: boolean;
  onStartResubmit: () => void;
  onCancelResubmit: () => void;
  submitting: boolean;
  onSubmit: () => void;
  onRequestReopen: () => void;
  hasSubmission: boolean;
  isOverdue: boolean;
  isSubmitted: boolean;
  isGraded: boolean;
  isSubmittedAndExpired: boolean;
  showForm: boolean;
}

export const AssignmentSubmissionWorkspaceCard: React.FC<
  AssignmentSubmissionWorkspaceCardProps
> = ({
  assignment,
  files,
  onFilesChange,
  onPreview,
  submissionContent,
  onContentChange,
  isResubmitting,
  onStartResubmit,
  onCancelResubmit,
  submitting,
  onSubmit,
  onRequestReopen,
  hasSubmission,
  isOverdue,
  isSubmitted,
  isGraded,
  isSubmittedAndExpired,
  showForm,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:assignments.detail.submissionAreaTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showForm && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-[#f0f0f0] px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5">
              <Icon name="info" size={12} className="text-blue-600 shrink-0" />
              <span>{t("card:assignments.detail.noteNamingRule")}</span>
              <strong className="text-blue-700">
                {assignment.fileNamingRule || "10A1_HoTen_BaiTap"}
              </strong>
            </span>
          )}

          {isGraded ? (
            <Tag color="success">
              {t("card:assignments.statusLabels.gradedWithScoreUnit", {
                score: assignment.score ?? 0,
                max: assignment.pointsPossible,
              })}
            </Tag>
          ) : isSubmittedAndExpired ? (
            <Tag color="default">
              {t("card:assignments.statusLabels.submittedClosed")}
            </Tag>
          ) : isSubmitted ? (
            <Tag color="processing">
              {t("card:assignments.statusLabels.submitted")}
            </Tag>
          ) : isOverdue ? (
            <Tag color="error">
              {t("card:assignments.statusLabels.overdue")}
            </Tag>
          ) : (
            <Tag color="warning">
              {t("card:assignments.statusLabels.notSubmitted")}
            </Tag>
          )}
        </div>
      </div>

      {hasSubmission && !isResubmitting && (
        <AssignmentSubmissionView
          assignment={assignment}
          files={files}
          isSubmittedAndExpired={isSubmittedAndExpired}
          isGraded={isGraded}
          onPreview={onPreview}
          onStartResubmit={onStartResubmit}
        />
      )}

      {!hasSubmission && isGraded && (
        <AssignmentGradedFeedbackCard
          assignment={assignment}
          embedded
        />
      )}

      {!hasSubmission && isOverdue && (
        <AssignmentOverdueCard
          assignment={assignment}
          onRequestReopen={onRequestReopen}
        />
      )}

      {showForm && (
        <AssignmentSubmitForm
          files={files}
          onFilesChange={onFilesChange}
          onPreview={onPreview}
          submissionContent={submissionContent}
          onContentChange={onContentChange}
          isResubmitting={isResubmitting}
          onCancelResubmit={onCancelResubmit}
          submitting={submitting}
          onSubmit={onSubmit}
          maxFilesCount={assignment.maxFilesCount}
          maxFileSizeMb={assignment.maxFileSizeMb}
        />
      )}
    </div>
  );
};

