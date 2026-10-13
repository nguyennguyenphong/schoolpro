import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import type {
  AssignmentItem,
  AssignmentSummary,
} from "@/modules/students/features/assignments/types";
import { AssignmentDeadlineStatusCard } from "@/modules/students/features/assignments/components/submit/AssignmentDeadlineStatusCard";
import { AssignmentAcademicInfoCard } from "@/modules/students/features/assignments/components/submit/AssignmentAcademicInfoCard";
import { AssignmentFileFormatGuidelinesCard } from "@/modules/students/features/assignments/components/submit/AssignmentFileFormatGuidelinesCard";
import { AssignmentSubmissionNotesCard } from "@/modules/students/features/assignments/components/submit/AssignmentSubmissionNotesCard";

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
  const { t } = useTranslation(["card"]);

  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-5">
      {/* Card 1: Tabs for Deadline/Rules & Academic Info */}
      <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
        <Tabs
          defaultActiveKey="deadline"
          size="small"
          items={[
            {
              key: "deadline",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="clock" size={13} className="text-amber-500" />
                  <span>{t("card:assignments.detail.tabDeadline")}</span>
                </span>
              ),
              children: (
                <div className="pt-1">
                  <AssignmentDeadlineStatusCard
                    assignment={assignment}
                    isPastDue={isPastDue}
                    isSubmittedAndExpired={isSubmittedAndExpired}
                    isGraded={isGraded}
                    isSubmitted={isSubmitted}
                    isOverdue={isOverdue}
                    embedded
                  />
                </div>
              ),
            },
            {
              key: "academic",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="academic" size={13} className="text-blue-600" />
                  <span>{t("card:assignments.detail.tabAcademic")}</span>
                </span>
              ),
              children: (
                <div className="pt-1">
                  <AssignmentAcademicInfoCard
                    assignment={assignment}
                    summary={summary}
                    teacherEmail={teacherEmail}
                    embedded
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Card 2: Tabs for Submission Notes & File Format Guidelines */}
      <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
        <Tabs
          defaultActiveKey="notes"
          size="small"
          items={[
            {
              key: "notes",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="info" size={13} className="text-blue-600" />
                  <span>{t("card:assignments.detail.tabNotes")}</span>
                </span>
              ),
              children: (
                <div className="pt-1">
                  <AssignmentSubmissionNotesCard assignment={assignment} embedded />
                </div>
              ),
            },
            {
              key: "formats",
              label: (
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                  <Icon name="file" size={13} className="text-indigo-600" />
                  <span>{t("card:assignments.detail.tabFormats")}</span>
                </span>
              ),
              children: (
                <div className="pt-1">
                  <AssignmentFileFormatGuidelinesCard
                    assignment={assignment}
                    embedded
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
