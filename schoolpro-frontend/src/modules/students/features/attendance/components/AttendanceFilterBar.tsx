import type React from "react";
import {
  AttendanceDropdownFilters,
  AttendanceSearchAndView,
  AttendanceStatusTabs,
} from "@/modules/students/features/attendance/components/filter";
import type {
  AttendanceClassTypeFilter,
  AttendanceFilter,
  AttendanceShiftFilter,
  AttendanceSortOption,
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
  onClassTypeChange: (classType: AttendanceClassTypeFilter) => void;
  onSortByChange: (sortBy: AttendanceSortOption) => void;
  onResetFilters: () => void;
}

/**
 * AttendanceFilterBar orchestrates:
 * 1. Status Filter Tabs (All / Open / Present / Upcoming / Absent)
 * 2. Search Input & View Mode Toggle (Grid / List)
 * 3. Date Navigation (< | Hôm nay | > + DatePicker) & Dropdown Filters (Shift, ClassType, Sort, Reset)
 */
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
  onClassTypeChange,
  onSortByChange,
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

      {/* 3. Date Navigation & Dropdown Filters */}
      <AttendanceDropdownFilters
        filter={filter}
        hasActiveFilters={hasActiveFilters}
        onDateChange={onDateChange}
        onTodayClick={onTodayClick}
        onPrevDayClick={onPrevDayClick}
        onNextDayClick={onNextDayClick}
        onShiftChange={onShiftChange}
        onClassTypeChange={onClassTypeChange}
        onSortByChange={onSortByChange}
        onResetFilters={onResetFilters}
      />
    </div>
  );
};
