import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SelectSort } from "@/components/sort/SelectSort";
import { Select } from "@/components/ui/Select";
import { SelectAcademicYear } from "@/components/academic-year/SelectAcademicYear";
import { SelectSemester } from "@/components/semester/SelectSemester";

interface LeaveRequestFilterBarProps {
  status: string;
  leaveType: string;
  searchQuery: string;
  sortBy: string;
  academicYear?: string;
  semester?: string;
  hasActiveFilters?: boolean;
  onStatusChange: (val: string) => void;
  onLeaveTypeChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onAcademicYearChange: (val: string) => void;
  onSemesterChange: (val: string, option?: unknown) => void;
  onResetFilters: () => void;
}

export const LeaveRequestFilterBar: React.FC<LeaveRequestFilterBarProps> = ({
  status,
  leaveType,
  searchQuery,
  sortBy,
  academicYear,
  semester,
  hasActiveFilters = false,
  onStatusChange,
  onLeaveTypeChange,
  onSearchChange,
  onSortByChange,
  onAcademicYearChange,
  onSemesterChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["input", "card", "button"]);
  const [prevSearchQuery, setPrevSearchQuery] = React.useState<string>(searchQuery);
  const [localSearch, setLocalSearch] = React.useState<string>(searchQuery);

  // Synchronize local search state when external searchQuery prop changes (e.g. on resetFilters)
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  // Debounce search change by 350ms to eliminate continuous UI jitter and excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const statusOptions = [
    { label: t("input:leaveRequests.allStatuses"), value: "all" },
    { label: t("card:leaveRequests.statuses.pending"), value: "pending" },
    { label: t("card:leaveRequests.statuses.approved"), value: "approved" },
    { label: t("card:leaveRequests.statuses.rejected"), value: "rejected" },
    { label: t("card:leaveRequests.statuses.cancelled"), value: "cancelled" },
  ];

  const leaveTypeOptions = [
    { label: t("input:leaveRequests.allLeaveTypes"), value: "all" },
    { label: t("card:leaveRequests.leaveTypes.sick"), value: "sick" },
    { label: t("card:leaveRequests.leaveTypes.family_affair"), value: "family_affair" },
    { label: t("card:leaveRequests.leaveTypes.bereavement"), value: "bereavement" },
    {
      label: t("card:leaveRequests.leaveTypes.official_competition"),
      value: "official_competition",
    },
    { label: t("card:leaveRequests.leaveTypes.other"), value: "other" },
  ];

  const sortOptions = [
    { label: t("input:leaveRequests.sortNewest"), value: "newest" },
    { label: t("input:leaveRequests.sortOldest"), value: "oldest" },
    { label: t("input:leaveRequests.sortStartDate"), value: "start_date" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="leave-request-search-input"
            name="searchQuery"
            aria-label={t("input:leaveRequests.searchPlaceholder")}
            placeholder={t("input:leaveRequests.searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            autoFocus
            className="w-full"
          />
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Academic Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:leaveRequests.filters.academicYear")}:
            </span>
            <SelectAcademicYear
              value={academicYear || undefined}
              onChange={onAcademicYearChange}
              allOptionLabel={t("card:leaveRequests.filters.allAcademicYears")}
              defaultToCurrent
              className="w-44 sm:w-48"
            />
          </div>

          {/* 2. Semester Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:leaveRequests.filters.semester")}:
            </span>
            <SelectSemester
              value={semester || undefined}
              academicYearId={academicYear}
              onChange={onSemesterChange}
              allOptionLabel={t("card:leaveRequests.filters.allSemesters")}
              defaultToCurrent
              className="w-40 sm:w-44"
            />
          </div>

          {/* 3. Leave Type Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="leave-request-filter-type"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("input:leaveRequests.filterLeaveType")}
            </label>
            <Select
              id="leave-request-filter-type"
              value={leaveType}
              onChange={onLeaveTypeChange}
              options={leaveTypeOptions}
              className="w-50 sm:w-50"
            />
          </div>

          {/* 2. Status Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="leave-request-filter-status"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("input:leaveRequests.filterStatus")}
            </label>
            <Select
              id="leave-request-filter-status"
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* 3. Sort Order */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="leave-request-filter-sort"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("input:leaveRequests.filterSort")}
            </label>
            <SelectSort
              id="leave-request-filter-sort"
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-40 sm:w-48"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            <Icon name="refresh" size={13} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
