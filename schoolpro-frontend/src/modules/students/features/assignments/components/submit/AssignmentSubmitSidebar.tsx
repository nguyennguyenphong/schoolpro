import React from "react";
import type {
  AssignmentItem,
  AssignmentSummary,
} from "@/modules/students/features/assignments/types";
import { AssignmentDeadlineStatusCard } from "./AssignmentDeadlineStatusCard";
import { AssignmentAcademicInfoCard } from "./AssignmentAcademicInfoCard";
import { AssignmentFileFormatGuidelinesCard } from "./AssignmentFileFormatGuidelinesCard";
import { AssignmentSubmissionNotesCard } from "./AssignmentSubmissionNotesCard";

interface AssignmentSubmitSidebarProps {
  assignment: AssignmentItem;
  summary: AssignmentSummary | null;
  isPastDue: boolean;
  isSubmittedAndExpired: boolean;
  isGraded: boolean;
  isSubmitted: boolean;
  isOverdue: boolean;
  teacherEmail: string;
}

export const AssignmentSubmitSidebar: React.FC<AssignmentSubmitSidebarProps> = ({
  assignment,
  summary,
  isPastDue,
  isSubmittedAndExpired,
  isGraded,
  isSubmitted,
  isOverdue,
  teacherEmail,
}) => {
  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-5">
      <AssignmentDeadlineStatusCard
        assignment={assignment}
        isPastDue={isPastDue}
        isSubmittedAndExpired={isSubmittedAndExpired}
        isGraded={isGraded}
        isSubmitted={isSubmitted}
        isOverdue={isOverdue}
      />

      <AssignmentAcademicInfoCard
        assignment={assignment}
        summary={summary}
        teacherEmail={teacherEmail}
      />

      <AssignmentFileFormatGuidelinesCard />

      <AssignmentSubmissionNotesCard />
    </div>
  );
};
