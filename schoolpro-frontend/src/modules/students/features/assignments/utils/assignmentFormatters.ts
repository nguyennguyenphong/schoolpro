
import type {
  AssignmentItem,
  AssignmentSubmission,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";

import { detectFileType } from "@/modules/students/features/assignments/utils/fileUtils";

export const normalizeSubmissionFiles = (
  submission: AssignmentSubmission | null | undefined,
): SubmittedFile[] => {
  if (!submission) return [];

  if (submission.files?.length) {
    return submission.files;
  }

  if (submission.fileName) {
    return [
      {
        id: "f-legacy",
        name: submission.fileName,
        size: "1.5 MB",
        type: detectFileType(submission.fileName),
        url: submission.fileUrl,
        uploadedAt: submission.submittedAt,
      },
    ];
  }

  return [];
};

export const getTeacherEmail = (
  assignment: AssignmentItem,
): string => {
  if (assignment.teacherEmail) {
    return assignment.teacherEmail;
  }

  const username = assignment.teacherName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

  return `${username}@schoolpro.edu.vn`;
};
