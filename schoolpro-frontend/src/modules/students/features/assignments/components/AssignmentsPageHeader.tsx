import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentSummary } from "@/modules/students/features/assignments/types";

interface AssignmentsPageHeaderProps {
  summary: AssignmentSummary | null;
  loading: boolean;
}

export const AssignmentsPageHeader: React.FC<AssignmentsPageHeaderProps> = ({
  summary,
  loading,
}) => {
  const { t } = useTranslation(["navigation"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f0f0f0] shadow-2xs space-y-2">
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
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <Icon name="edit" size={13} className="text-blue-600 shrink-0" />
                <span>{t("navigation:breadcrumb.assignments")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="pt-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
            {t("navigation:pageTitle.assignments")}
          </h1>
          {summary?.className ? (
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {summary.className}
            </span>
          ) : loading ? (
            <span className="inline-block w-14 h-5 bg-slate-100 rounded-full animate-pulse" />
          ) : null}
          {summary?.semesterName ? (
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#f0f0f0]">
              {summary.semesterName}
              {summary.academicYear ? ` • ${summary.academicYear}` : ""}
            </span>
          ) : loading ? (
            <span className="inline-block w-24 h-5 bg-slate-100 rounded-full animate-pulse" />
          ) : null}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-0">
          {t("navigation:pageSubtitle.assignments")}
        </p>
      </div>
    </div>
  );
};
