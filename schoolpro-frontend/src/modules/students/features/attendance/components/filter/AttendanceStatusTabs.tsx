import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { AttendanceStatusFilter } from "@/modules/students/features/attendance/types";

export interface AttendanceStatusTabsProps {
  status: AttendanceStatusFilter;
  counts: {
    all: number;
    open: number;
    present: number;
    upcoming: number;
    excused: number;
    absent: number;
  };
  onStatusChange: (status: AttendanceStatusFilter) => void;
}

/**
 * Status filter tabs for student attendance (All, Open, Present, Upcoming, Excused, Absent)
 * following the exact design pattern of AnnouncementStatusTabs.
 */
export const AttendanceStatusTabs: React.FC<AttendanceStatusTabsProps> = ({
  status,
  counts,
  onStatusChange,
}) => {
  const { t } = useTranslation(["card"]);

  const tabs: Array<{
    key: AttendanceStatusFilter;
    label: string;
    icon: "file" | "clock" | "checkCircle" | "calendar" | "file-text" | "warning";
    count: number;
  }> = [
    {
      key: "all",
      label: t("card:attendance.filter.all"),
      icon: "file",
      count: counts.all,
    },
    {
      key: "open",
      label: t("card:attendance.filter.open"),
      icon: "clock",
      count: counts.open,
    },
    {
      key: "present",
      label: t("card:attendance.filter.present"),
      icon: "checkCircle",
      count: counts.present,
    },
    {
      key: "upcoming",
      label: t("card:attendance.filter.upcoming"),
      icon: "calendar",
      count: counts.upcoming,
    },
    {
      key: "excused",
      label: t("card:attendance.status.excused"),
      icon: "file-text",
      count: counts.excused,
    },
    {
      key: "absent",
      label: t("card:attendance.filter.absent"),
      icon: "warning",
      count: counts.absent,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const isActive = status === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon
              name={tab.icon}
              size={14}
              className={
                isActive ? "text-white shrink-0" : "text-slate-400 shrink-0"
              }
            />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
