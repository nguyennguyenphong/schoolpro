import type { AssignmentItem } from "@/modules/students/features/assignments/types";
import { isDueDatePassed } from "@/modules/students/features/assignments/utils/fileUtils";

export interface AssignmentStatus {
  isPastDue: boolean;
  isReopenApproved: boolean;
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
  const rawPastDue = isDueDatePassed(assignment.dueDate);
  const isReopenApproved = assignment.reopenRequest?.status === "approved";

  // Cổng nộp bài chỉ mở khi còn trong thời hạn (bao gồm hạn đã được giáo viên gia hạn)
  // hoặc khi giáo viên đã duyệt mở lại cổng nộp bài. Khi hết hạn thì khóa nộp bài.
  const isWithinWindow = !rawPastDue || isReopenApproved;
  const isPastDue = !isWithinWindow;
  const canLateSubmit = rawPastDue && isReopenApproved;

  const hasSubmission = Boolean(assignment.submission);
  const isGraded =
    assignment.status === "graded" ||
    (assignment.score !== null && assignment.score !== undefined);

  // Còn thời hạn (hoặc đã được gia hạn) và chưa nộp -> cho phép nộp
  const isPending = !hasSubmission && isWithinWindow && !isGraded;

  // Đã hết hạn mà chưa nộp và chưa được gia hạn -> khóa nộp bài, đợi giáo viên gia hạn
  const isOverdue = !hasSubmission && !isWithinWindow && !isGraded;

  const isSubmitted =
    (assignment.status === "submitted" || hasSubmission) && !isGraded;

  // Đã nộp bài và đã hết hạn -> chỉ cho xem lại
  const isSubmittedAndExpired = hasSubmission && !isWithinWindow;

  // Chỉ hiển thị form nộp bài khi:
  // 1. Chưa nộp bài và còn thời hạn nộp (hoặc đã được giáo viên gia hạn/mở lại)
  // 2. Đã nộp bài, còn thời hạn nộp, chưa chấm điểm và học sinh chọn "Nộp lại bài làm"
  const showForm =
    (isPending && !hasSubmission) ||
    (isResubmitting && hasSubmission && isWithinWindow && !isGraded);

  return {
    isPastDue,
    isReopenApproved,
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

