import React from "react";
import { useTranslation } from "react-i18next";
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
  semesterLabel?: string;
  minDate?: string;
  maxDate?: string;
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
  semesterLabel,
  minDate,
  maxDate,
  hasActiveFilters = false,
  onDateChange,
  onViewModeChange,
  onResetFilters,
  onTodayClick,
  onPrevWeekClick,
  onNextWeekClick,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const currentDayjs = dayjs(selectedDate);
  const minDayjs = minDate ? dayjs(minDate) : null;
  const maxDayjs = maxDate ? dayjs(maxDate) : null;

  const isPrevDisabled = minDayjs ? currentDayjs.isBefore(minDayjs) || currentDayjs.isSame(minDayjs, "day") : false;
  const isNextDisabled = maxDayjs ? currentDayjs.isAfter(maxDayjs) || currentDayjs.isSame(maxDayjs, "day") : false;

  const onPreviousDay = onPrevWeekClick;
  const onToday = onTodayClick;
  const onNextDay = onNextWeekClick;
  const isToday = currentDayjs.isSame(dayjs(), "day");

  const handleDatePickerChange = (date: Dayjs | Dayjs[] | null) => {
    if (date && !Array.isArray(date)) {
      onDateChange(date.format("YYYY-MM-DD"));
    }
  };

  const disabledDate = (current: Dayjs) => {
    if (!current) return false;
    if (minDayjs && current.isBefore(minDayjs, "day")) return true;
    if (maxDayjs && current.isAfter(maxDayjs, "day")) return true;
    return false;
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Week Navigation & Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center h-8 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={onPreviousDay}
            disabled={isPrevDisabled}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
              isPrevDisabled
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            }`}
            title={isPrevDisabled ? t("card:timetable.minLimitReached") : t("button:previousDay")}
          >
            <Icon name="chevron-left" size={15} />
          </button>

          <button
            type="button"
            onClick={onToday}
            className={`px-2.5 h-7 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isToday
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            <Icon name="calendar" size={13} />
            <span>{t("button:today")}</span>
          </button>

          <button
            type="button"
            onClick={onNextDay}
            disabled={isNextDisabled}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
              isNextDisabled
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            }`}
            title={isNextDisabled ? t("card:timetable.maxLimitReached") : t("button:nextDay")}
          >
            <Icon name="chevron-right" size={15} />
          </button>
        </div>

        {/* Semester Badge */}
        {semesterLabel && (
          <div className="h-8 px-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            <span>{semesterLabel}</span>
          </div>
        )}

        {/* Week Range Display Badge */}
        <div className="h-8 px-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 flex items-center gap-1.5">
          <Icon name="calendar" size={13} className="text-blue-600 shrink-0" />
          <span>{t("card:timetable.weekPrefix", { label: currentWeekLabel })}</span>
        </div>

        {/* Week Picker for jumping directly to any week with boundary checking */}
        <div className="w-40 sm:w-44">
          <DatePicker
            picker="week"
            value={currentDayjs}
            onChange={handleDatePickerChange}
            disabledDate={disabledDate}
            format={t("card:timetable.weekPickerFormat")}
            allowClear={false}
            className="w-full"
            name="timetable-week-picker"
          />
        </div>
      </div>

      {/* 2. Actions & View Mode Controls (Grid & List only) */}
      <div className="flex items-center gap-2.5 justify-end shrink-0">
        {/* Reset button if not on default week */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title={t("card:timetable.backToCurrentWeek")}
          >
            <Icon name="refresh" size={13} />
            {t("card:timetable.backToCurrentWeek")}
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
            title={t("card:timetable.viewGrid")}
          >
            <Icon name="calendar" size={14} />
            <span>{t("card:timetable.viewGrid")}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title={t("card:timetable.viewList")}
          >
            <Icon name="file" size={14} />
            <span>{t("card:timetable.viewList")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
