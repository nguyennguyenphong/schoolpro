import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";

import type {
  AssignmentItem,
  AssignmentSubmission,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";

import { assignmentsService } from "@/modules/students/features/assignments/services";
import { normalizeSubmissionFiles } from "@/modules/students/features/assignments/utils/assignmentFormatters";

interface UseAssignmentSubmissionParams {
  assignment: AssignmentItem | null;
  setAssignment: React.Dispatch<
    React.SetStateAction<AssignmentItem | null>
  >;
}

export const useAssignmentSubmission = ({
  assignment,
  setAssignment,
}: UseAssignmentSubmissionParams) => {
  const { t } = useTranslation("message");

  const assignmentSyncKey = assignment
    ? `${assignment.id}:${assignment.submission?.submittedAt ?? "none"}:${assignment.submission?.attemptNumber ?? 0}`
    : "null";

  const [prevSyncKey, setPrevSyncKey] = useState(assignmentSyncKey);
  const [submissionContent, setSubmissionContent] = useState(
    () => assignment?.submission?.content ?? "",
  );
  const [files, setFiles] = useState<SubmittedFile[]>(() =>
    assignment ? normalizeSubmissionFiles(assignment.submission) : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  if (prevSyncKey !== assignmentSyncKey) {
    setPrevSyncKey(assignmentSyncKey);
    setSubmissionContent(assignment?.submission?.content ?? "");
    setFiles(assignment ? normalizeSubmissionFiles(assignment.submission) : []);
    setIsResubmitting(false);
  }

  const handleSubmit = useCallback(async () => {
    if (!assignment || submitting) return;

    if (!submissionContent.trim() && files.length === 0) {
      message.warning(t("assignments.emptySubmissionWarning"));
      return;
    }

    try {
      setSubmitting(true);

      const submission: AssignmentSubmission = {
        submittedAt: new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 16),
        content: submissionContent.trim(),
        fileName: files[0]?.name || "Bai_lam_nop.docx",
        fileUrl: files[0]?.url || "#",
        files,
      };

      const updated = await assignmentsService.submitAssignment(
        assignment.id,
        submission,
      );

      setAssignment(updated);
      setIsResubmitting(false);

      message.success(t("assignments.submitSuccess"));
    } catch {
      message.error(t("assignments.submitError"));
    } finally {
      setSubmitting(false);
    }
  }, [
    assignment,
    files,
    setAssignment,
    submissionContent,
    submitting,
    t,
  ]);

  return {
    submissionContent,
    setSubmissionContent,
    files,
    setFiles,
    submitting,
    isResubmitting,
    setIsResubmitting,
    handleSubmit,
  };
};
