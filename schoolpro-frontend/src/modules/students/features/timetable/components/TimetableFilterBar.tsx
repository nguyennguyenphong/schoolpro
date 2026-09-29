import React from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { TimetableViewMode } from "@/modules/students/features/timetable/types";

interface TimetableFilterBarProps {
  selectedDate: string;
  viewMode: TimetableViewMode;
  currentWeekLabel: string;
  hasActiveFilters?: boolean;
  onDateChange: (dateStr: string) => void;
  onViewModeChange: (mode: TimetableViewMode) => void;
  onResetFilters: () => void;
  onTodayClick: () => void;
  onPrevWeekClick: () => void;
  onNextWeekClick: () => void;
}

export const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
  selectedDate,
  viewMode,
  currentWeekLabel,
  hasActiveFilters = false,
  onDateChange,
  onViewModeChange,
  onResetFilters,
  onTodayClick,
  onPrevWeekClick,
  onNextWeekClick,
}) => {
  const currentDayjs = dayjs(selectedDate);

  const handleDatePickerChange = (date: Dayjs | Dayjs[] | null) => {
    if (date && !Array.isArray(date)) {
      onDateChange(date.format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Week Navigation & Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="small"
          onClick={onTodayClick}
        >
          Tuần này
        </Button>

        {/* Prev / Next Week Controls */}
        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
          <button
            type="button"
            onClick={onPrevWeekClick}
            className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Tuần trước"
          >
            <Icon name="chevron-left" size={13} />
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            type="button"
            onClick={onNextWeekClick}
            className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Tuần tiếp theo"
          >
            <Icon name="chevron-right" size={13} />
          </button>
        </div>

        {/* Week Range Display Badge */}
        <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 flex items-center gap-1.5">
          <Icon name="calendar" size={13} className="text-blue-600 shrink-0" />
          <span>Tuần: {currentWeekLabel}</span>
        </div>

        {/* Week Picker for jumping directly to any week */}
        <div className="w-40 sm:w-44">
          <DatePicker
            picker="week"
            value={currentDayjs}
            onChange={handleDatePickerChange}
            format="[Tuần] w - YYYY"
            allowClear={false}
            className="w-full"
          />
        </div>
      </div>

      {/* 2. Actions & View Mode Controls (Grid & List only) */}
      <div className="flex items-center gap-2.5 justify-end shrink-0">
        {/* Reset button if not on default week */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="small"
            onClick={onResetFilters}
            title="Đặt lại về tuần này"
          >
            <Icon name="check" size={13} className="text-rose-500 mr-1" />
            Về tuần này
          </Button>
        )}

        {/* View Mode Toggle: Grid and List ONLY */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Lưới tuần (Grid View)"
          >
            <Icon name="calendar" size={14} />
            <span>Lưới tuần</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Danh sách (List View)"
          >
            <Icon name="file" size={14} />
            <span>Danh sách</span>
          </button>
        </div>
      </div>
    </div>
  );
};
