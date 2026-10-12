import type React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendancePageHeaderProps {
  summary: AttendanceSummary | null;
  isRealtimeConnected: boolean;
}

/**
 * Clean Student Attendance Page Header with direct link to Leave Requests.
 */
export const AttendancePageHeader: React.FC<AttendancePageHeaderProps> = ({
  summary,
  isRealtimeConnected,
}) => {
  const { t } = useTranslation(["navigation", "card", "button"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon
                  name="home"
                  size={13}
                  className="text-slate-400 shrink-0"
                />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <Icon
                  name="userCheck"
                  size={13}
                  className="text-blue-600 shrink-0"
                />
                <span>{t("navigation:breadcrumb.attendance")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.attendance")}
            </h1>

            {summary?.className && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {t("card:attendance.header.classBadge", {
                  className: summary.className,
                })}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isRealtimeConnected
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-blue-700 bg-blue-50 border-blue-200"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isRealtimeConnected ? "bg-emerald-400" : "bg-blue-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isRealtimeConnected ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
              </span>
              <span>
                {isRealtimeConnected
                  ? t("card:attendance.header.realtimeConnected")
                  : t("card:attendance.header.realtimeSyncing")}
              </span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.attendance")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            href="/student/leave-requests"
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Icon name="file-text" size={14} />
            <span>{t("navigation:breadcrumb.leaveRequests")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
