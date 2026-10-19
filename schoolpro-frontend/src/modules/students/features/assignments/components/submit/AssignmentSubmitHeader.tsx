import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentSubmitHeaderProps {
  assignment: AssignmentItem;
  isPastDue?: boolean;
  typeLabel: string;
  onBack: () => void;
}

export const AssignmentSubmitHeader: React.FC<AssignmentSubmitHeaderProps> = ({
  assignment,
  typeLabel,
  onBack,
}) => {
  const { t } = useTranslation(["card", "button", "navigation"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            href: "/student/assignments",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.assignments")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>{t("card:assignments.detail.breadcrumbDetail")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {assignment.title}
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {assignment.subjectName}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {typeLabel}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.assignmentDetail")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={onBack} className="text-xs sm:text-sm">
            <Icon name="arrow-left" size={14} />
            <span>{t("button:assignmentsList")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
