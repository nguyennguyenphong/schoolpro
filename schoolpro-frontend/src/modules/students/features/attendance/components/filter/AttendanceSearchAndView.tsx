import type React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import type { AttendanceViewMode } from "@/modules/students/features/attendance/types";

export interface AttendanceSearchAndViewProps {
  searchQuery: string;
  viewMode: AttendanceViewMode;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: AttendanceViewMode) => void;
}

/**
 * Attendance search input with auto-focus paired with view mode toggle (Grid/List),
 * matching AnnouncementSearchAndView and TimetableFilterBar.
 */
export const AttendanceSearchAndView: React.FC<
  AttendanceSearchAndViewProps
> = ({ searchQuery, viewMode, onSearchChange, onViewModeChange }) => {
  const { t } = useTranslation(["input", "card"]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("attendance-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1">
        <Input
          id="leave-request-search-input"
          name="searchQuery"
          aria-label={t("input:leaveRequests.searchPlaceholder")}
          placeholder={t("input:leaveRequests.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          prefix={<Icon name="search" size={15} className="text-slate-400" />}
          allowClear
          className="w-full"
          autoFocus
        />
      </div>

      {/* View Mode Toggle: Grid vs List */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#f0f0f0] shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === "grid"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Icon name="chart" size={13} />
          <span>{t("input:leaveRequests.viewCard")}</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === "list"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Icon name="menu" size={13} />
          <span>{t("input:leaveRequests.viewList")}</span>
        </button>
      </div>
    </div>
  );
};
