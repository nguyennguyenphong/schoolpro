import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { LeaveRequestSummary } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestsPageHeaderProps {
  summary: LeaveRequestSummary | null;
  loading: boolean;
  onCreateClick: () => void;
}

export const LeaveRequestsPageHeader: React.FC<LeaveRequestsPageHeaderProps> = ({
  summary,
  loading,
  onCreateClick,
}) => {
  const { t } = useTranslation(["navigation", "card", "button"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5">
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
                <Icon name="file-text" size={13} className="text-blue-600 shrink-0" />
                <span>{t("navigation:breadcrumb.leaveRequests")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.leaveRequests")}
            </h1>
            {summary?.className ? (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {t("card:leaveRequests.header.classBadge", { className: summary.className })}
              </span>
            ) : loading ? (
              <span className="inline-block w-16 h-5 bg-slate-100 rounded-full animate-pulse" />
            ) : null}
            {summary?.semesterName ? (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#f0f0f0]">
                {summary.semesterName}
                {summary.academicYear ? ` • ${summary.academicYear}` : ""}
              </span>
            ) : loading ? (
              <span className="inline-block w-28 h-5 bg-slate-100 rounded-full animate-pulse" />
            ) : null}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.leaveRequests")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {summary?.homeroomTeacherName && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-[#f0f0f0] text-xs">
              <Icon name="userCheck" size={14} className="text-blue-600 shrink-0" />
              <span className="text-slate-500">
                {t("card:leaveRequests.header.homeroomTeacherPrefix")}{" "}
                <strong className="text-slate-800">{summary.homeroomTeacherName}</strong>
              </span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={onCreateClick}
            className="font-semibold text-xs sm:text-sm"
          >
            <Icon name="plus" size={15} />
            <span>{t("button:createLeaveRequest")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
