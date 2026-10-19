import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

import type { LeaveRequestSummary } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestsPageHeaderProps {
  onCreateClick: () => void;
}

export const LeaveRequestsPageHeader: React.FC<LeaveRequestsPageHeaderProps> = ({
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
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.leaveRequests")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
