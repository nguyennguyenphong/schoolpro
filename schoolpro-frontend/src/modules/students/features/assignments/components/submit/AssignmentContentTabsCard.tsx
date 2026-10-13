import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import type { TabsItems } from "@/components/ui/Tabs/types";
import { Tag } from "@/components/ui/Tag";
import { AssignmentRequirementsCard } from "@/modules/students/features/assignments/components/submit/AssignmentRequirementsCard";
import { AssignmentRubricCard } from "@/modules/students/features/assignments/components/submit/AssignmentRubricCard";
import { AssignmentGradedFeedbackCard } from "@/modules/students/features/assignments/components/submit/AssignmentGradedFeedbackCard";
import { AssignmentOverdueLog } from "@/modules/students/features/assignments/components/submit/AssignmentOverdueLog";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentContentTabsCardProps {
  assignment: AssignmentItem;
  isGraded: boolean;
  onPreviewPdf: (file: { url: string; name: string; size: string }) => void;
  onRequestAppeal: () => void;
}

export const AssignmentContentTabsCard: React.FC<
  AssignmentContentTabsCardProps
> = ({ assignment, isGraded, onPreviewPdf, onRequestAppeal }) => {
  const { t } = useTranslation(["card"]);

  const hasRubric = Boolean(assignment.rubric && assignment.rubric.length > 0);
  const hasSolutions = Boolean(
    assignment.solutionAttachments && assignment.solutionAttachments.length > 0,
  );

  const items: TabsItems = [
    {
      key: "requirements",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon name="file-text" size={14} />
          <span>{t("card:assignments.detail.tabRequirements")}</span>
          {assignment.attachments && assignment.attachments.length > 0 && (
            <Tag color="processing" className="m-0 text-[10px] px-1.5 py-0">
              {assignment.attachments.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="pt-1">
          <AssignmentRequirementsCard
            description={assignment.description}
            originalDueDate={assignment.originalDueDate}
            extensions={assignment.extensions}
            attachments={assignment.attachments}
            onPreviewPdf={onPreviewPdf}
            embedded
          />
        </div>
      ),
    },
  ];

  if (hasRubric || hasSolutions) {
    items.push({
      key: "rubric",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon name="book" size={14} />
          <span>{t("card:assignments.detail.tabRubric")}</span>
          {assignment.rubric && assignment.rubric.length > 0 && (
            <Tag color="processing" className="m-0 text-[10px] px-1.5 py-0">
              {assignment.rubric.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="pt-1">
          <AssignmentRubricCard
            rubric={assignment.rubric}
            solutionAttachments={assignment.solutionAttachments}
            isGraded={isGraded}
            onPreviewPdf={onPreviewPdf}
            embedded
          />
        </div>
      ),
    });
  }

  if (isGraded) {
    items.push({
      key: "gradedFeedback",
      label: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Icon name="check" size={14} className="text-emerald-600" />
          <span>{t("card:assignments.detail.tabGraded")}</span>
          <Tag color="success" className="m-0 text-[10px] px-1.5 py-0">
            {assignment.score ?? 0}/{assignment.pointsPossible}
          </Tag>
        </span>
      ),
      children: (
        <div className="pt-1">
          <AssignmentGradedFeedbackCard
            assignment={assignment}
            onRequestAppeal={onRequestAppeal}
            embedded
          />
        </div>
      ),
    });
  }

  items.push({
    key: "eventLog",
    label: (
      <span className="inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
        <Icon name="clock" size={14} />
        <span>{t("card:assignments.detail.tabEventLog")}</span>
      </span>
    ),
    children: (
      <div className="pt-1">
        <AssignmentOverdueLog assignment={assignment} embedded />
      </div>
    ),
  });

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
      <Tabs defaultActiveKey="requirements" items={items} size="small" />
    </div>
  );
};
