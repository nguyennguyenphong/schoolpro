
import { useCallback, useEffect, useState } from "react";
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

  const [submissionContent, setSubmissionContent] = useState("");
  const [files, setFiles] = useState<SubmittedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  useEffect(() => {
    if (!assignment) {
      setSubmissionContent("");
      setFiles([]);
      setIsResubmitting(false);
      return;
    }

    setSubmissionContent(assignment.submission?.content ?? "");
    setFiles(normalizeSubmissionFiles(assignment.submission));
    setIsResubmitting(false);
  }, [assignment?.id, assignment?.submission]);

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
