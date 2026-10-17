import type React from "react";
import {
  TimetableWeekNavigator,
  TimetableWeekBadge,
  TimetableActionGroup,
} from "@/modules/students/features/timetable/components/filter";

export interface TimetableFilterBarProps {
  selectedDate: string;
  currentWeekLabel?: string;
  semesterLabel?: string;
  minDate?: string;
  maxDate?: string;
  hasActiveFilters?: boolean;
  isPrinting?: boolean;
  onDateChange: (dateStr: string) => void;
  onResetFilters: () => void;
  onTodayClick: () => void;
  onPrevWeekClick: () => void;
  onNextWeekClick: () => void;
  onPrint?: () => void;
}

export const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
  selectedDate,
  currentWeekLabel,
  semesterLabel,
  minDate,
  maxDate,
  hasActiveFilters = false,
  isPrinting = false,
  onDateChange,
  onResetFilters,
  onTodayClick,
  onPrevWeekClick,
  onNextWeekClick,
  onPrint,
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* 1. Left side: Week navigation and current week badge */}
      <div className="flex flex-wrap items-center gap-3">
        <TimetableWeekNavigator
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onDateChange={onDateChange}
          onTodayClick={onTodayClick}
          onPrevWeekClick={onPrevWeekClick}
          onNextWeekClick={onNextWeekClick}
        />

        <TimetableWeekBadge
          currentWeekLabel={currentWeekLabel}
          semesterLabel={semesterLabel}
        />
      </div>

      {/* 2. Right side: Action controls (Print & Reset filter) */}
      <div className="flex items-center justify-end shrink-0 pt-2 md:pt-0 border-t border-[#f0f0f0] md:border-t-0">
        <TimetableActionGroup
          hasActiveFilters={hasActiveFilters}
          isPrinting={isPrinting}
          onResetFilters={onResetFilters}
          onPrint={onPrint}
        />
      </div>
    </div>
  );
};
