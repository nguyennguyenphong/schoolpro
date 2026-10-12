import type { AssignmentItem } from "@/modules/students/features/assignments/types";
import { isDueDatePassed } from "@/modules/students/features/assignments/utils/fileUtils";

export interface AssignmentStatus {
  isPastDue: boolean;
  canLateSubmit: boolean;
  isPending: boolean;
  hasSubmission: boolean;
  isOverdue: boolean;
  isSubmitted: boolean;
  isGraded: boolean;
  isSubmittedAndExpired: boolean;
  showForm: boolean;
}

export const getAssignmentStatus = (
  assignment: AssignmentItem,
  isResubmitting: boolean,
): AssignmentStatus => {
  const isPastDue = isDueDatePassed(assignment.dueDate);

  const canLateSubmit =
    isPastDue && Boolean(assignment.allowLateSubmission);

  const hasSubmission = Boolean(assignment.submission);

  const isPending =
    (assignment.status === "pending" && !isPastDue) ||
    (!hasSubmission && canLateSubmit);

  const isOverdue =
    (
      assignment.status === "overdue" ||
      (isPastDue && !hasSubmission)
    ) && !canLateSubmit;

  const isSubmitted = assignment.status === "submitted";
  const isGraded = assignment.status === "graded";

  const isSubmittedAndExpired =
    (hasSubmission || isGraded) &&
    isPastDue &&
    !canLateSubmit;

  const showForm =
    (isPending && !hasSubmission) ||
    (isResubmitting && !isSubmittedAndExpired);

  return {
    isPastDue,
    canLateSubmit,
    isPending,
    hasSubmission,
    isOverdue,
    isSubmitted,
    isGraded,
    isSubmittedAndExpired,
    showForm,
  };
};
