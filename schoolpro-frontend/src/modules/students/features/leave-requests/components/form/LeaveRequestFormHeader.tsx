import type React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface LeaveRequestFormHeaderProps {
  isEditMode: boolean;
  onBack: () => void;
}

export const LeaveRequestFormHeader: React.FC<LeaveRequestFormHeaderProps> = ({
  isEditMode,
  onBack,
}) => {
  const { t } = useTranslation(["navigation", "button"]);

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
            href: "/student/leave-requests",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.leaveRequests")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>
                  {isEditMode
                    ? t("navigation:breadcrumb.leaveRequestEdit")
                    : t("navigation:breadcrumb.leaveRequestCreate")}
                </span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {isEditMode
                ? t("navigation:pageTitle.leaveRequestEdit")
                : t("navigation:pageTitle.leaveRequestCreate")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.leaveRequestForm")}
          </p>
        </div>

        <Button variant="outline" onClick={onBack}>
          <Icon name="arrow-left" size={14} />
          <span>{t("button:back")}</span>
        </Button>
      </div>
    </div>
  );
};
