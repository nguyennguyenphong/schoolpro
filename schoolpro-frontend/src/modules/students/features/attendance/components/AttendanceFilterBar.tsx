import type React from "react";
import {
  AttendanceDropdownFilters,
  AttendanceSearchAndView,
  AttendanceStatusTabs,
} from "@/modules/students/features/attendance/components/filter";
import type {
  AttendanceFilter,
  AttendanceShiftFilter,
  AttendanceStatusFilter,
  AttendanceViewMode,
} from "@/modules/students/features/attendance/types";

export interface AttendanceFilterBarProps {
  filter: AttendanceFilter;
  counts: {
    all: number;
    open: number;
    present: number;
    upcoming: number;
    excused: number;
    absent: number;
  };
  hasActiveFilters?: boolean;
  onStatusChange: (status: AttendanceStatusFilter) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: AttendanceViewMode) => void;
  onDateChange: (dateStr: string) => void;
  onTodayClick: () => void;
  onPrevDayClick: () => void;
  onNextDayClick: () => void;
  onShiftChange: (shift: AttendanceShiftFilter) => void;
  onResetFilters: () => void;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  filter,
  counts,
  hasActiveFilters = false,
  onStatusChange,
  onSearchChange,
  onViewModeChange,
  onDateChange,
  onTodayClick,
  onPrevDayClick,
  onNextDayClick,
  onShiftChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Tabs */}
      <AttendanceStatusTabs
        status={filter.status}
        counts={counts}
        onStatusChange={onStatusChange}
      />

      {/* 2. Search & View Mode Toggle */}
      <AttendanceSearchAndView
        searchQuery={filter.searchQuery}
        viewMode={filter.viewMode}
        onSearchChange={onSearchChange}
        onViewModeChange={onViewModeChange}
      />

      {/* 3. Date Navigation (Hôm nay / Ngày học) & Buổi học Filter */}
      <AttendanceDropdownFilters
        filter={filter}
        hasActiveFilters={hasActiveFilters}
        onDateChange={onDateChange}
        onTodayClick={onTodayClick}
        onPrevDayClick={onPrevDayClick}
        onNextDayClick={onNextDayClick}
        onShiftChange={onShiftChange}
        onResetFilters={onResetFilters}
      />
    </div>
  );
};
