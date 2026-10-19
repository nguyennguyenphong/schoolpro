import type React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

export interface AttendanceSearchAndViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Attendance search input with auto-focus paired with view mode toggle (Grid/List),
 * matching AnnouncementSearchAndView and TimetableFilterBar.
 */
export const AttendanceSearchAndView: React.FC<
  AttendanceSearchAndViewProps
> = ({ searchQuery, onSearchChange }) => {
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
    </div>
  );
};
