import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { SelectSort } from "@/components/sort";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { DEFAULT_DEMO_TODAY } from "@/modules/students/features/attendance/hooks";
import type {
  AttendanceClassTypeFilter,
  AttendanceFilter,
  AttendanceShiftFilter,
  AttendanceSortOption,
} from "@/modules/students/features/attendance/types";

export interface AttendanceDropdownFiltersProps {
  filter: AttendanceFilter;
  hasActiveFilters?: boolean;
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
 * Composite dropdown & date navigation filter bar combining:
 * - Date navigator (< | Hôm nay | > + DatePicker) from TimetableFilterBar
 * - Shift, ClassType, Sort dropdowns & Reset button from AnnouncementDropdownFilters
 */
export const AttendanceDropdownFilters: React.FC<
  AttendanceDropdownFiltersProps
> = ({
  filter,
  hasActiveFilters = false,
  onDateChange,
  onTodayClick,
  onPrevDayClick,
  onNextDayClick,
  onShiftChange,
  onClassTypeChange,
  onSortByChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["input", "card", "button"]);
  const currentDayjs = dayjs(filter.selectedDate);
  const isToday =
    filter.selectedDate === DEFAULT_DEMO_TODAY ||
    currentDayjs.isSame(dayjs(), "day");

  const handleDatePickerChange = (date: Dayjs | Dayjs[] | null) => {
    if (date && !Array.isArray(date)) {
      onDateChange(date.format("YYYY-MM-DD"));
    }
  };

  const shiftOptions = [
    {
      label: t("input:attendance.allShifts", {
        defaultValue: "Tất cả buổi học",
      }),
      value: "all",
    },
    {
      label: t("input:attendance.shiftMorning", { defaultValue: "Buổi sáng" }),
      value: "morning",
    },
    {
      label: t("input:attendance.shiftAfternoon", {
        defaultValue: "Buổi chiều",
      }),
      value: "afternoon",
    },
  ];

  const classTypeOptions = [
    {
      label: t("input:attendance.allClassTypes", {
        defaultValue: "Tất cả hình thức",
      }),
      value: "all",
    },
    {
      label: t("card:timetable.classTypes.theory", {
        defaultValue: "Lý thuyết",
      }),
      value: "theory",
    },
    {
      label: t("card:timetable.classTypes.practice", {
        defaultValue: "Thực hành",
      }),
      value: "practice",
    },
  ];

  const sortOptions = [
    {
      label: t("input:attendance.sortPeriodAsc", {
        defaultValue: "Tiết học sớm nhất",
      }),
      value: "period_asc",
    },
    {
      label: t("input:attendance.sortPeriodDesc", {
        defaultValue: "Tiết học muộn nhất",
      }),
      value: "period_desc",
    },
    {
      label: t("input:attendance.sortStatusPriority", {
        defaultValue: "Ưu tiên đang mở cổng",
      }),
      value: "status_priority",
    },
  ];

  return (
    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* 1. Date Navigation (< | Hôm nay | >) like TimetableFilterBar */}
        <div className="flex items-center h-8 bg-slate-100 p-0.5 rounded-lg border border-[#f0f0f0] shrink-0">
          <button
            type="button"
            onClick={onPrevDayClick}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            title={t("button:previousDay", { defaultValue: "Ngày trước" })}
            aria-label={t("button:previousDay", { defaultValue: "Ngày trước" })}
          >
            <Icon name="chevron-left" size={15} />
          </button>

          <button
            type="button"
            onClick={onTodayClick}
            className={`px-2.5 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isToday
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            <Icon name="calendar" size={13} />
            <span>{t("button:today", { defaultValue: "Hôm nay" })}</span>
          </button>

          <button
            type="button"
            onClick={onNextDayClick}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            title={t("button:nextDay", { defaultValue: "Ngày sau" })}
            aria-label={t("button:nextDay", { defaultValue: "Ngày sau" })}
          >
            <Icon name="chevron-right" size={15} />
          </button>
        </div>

        {/* 2. Date Picker */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-date-picker"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:attendance.dateLabel", { defaultValue: "Ngày học:" })}
          </label>
          <DatePicker
            id="attendance-date-picker"
            name="attendanceDate"
            value={currentDayjs}
            onChange={handleDatePickerChange}
            format="DD/MM/YYYY"
            allowClear={false}
            className="w-36"
          />
        </div>

        {/* 3. Buổi học */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-filter-shift"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:attendance.shiftLabel", { defaultValue: "Buổi học:" })}
          </label>
          <Select
            id="attendance-filter-shift"
            value={filter.shift}
            onChange={(val) => onShiftChange(val as AttendanceShiftFilter)}
            options={shiftOptions}
            className="w-40"
          />
        </div>

        {/* 4. Hình thức học */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-filter-classtype"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:attendance.classTypeLabel", {
              defaultValue: "Hình thức:",
            })}
          </label>
          <Select
            id="attendance-filter-classtype"
            value={filter.classType}
            onChange={(val) =>
              onClassTypeChange(val as AttendanceClassTypeFilter)
            }
            options={classTypeOptions}
            className="w-40"
          />
        </div>

        {/* 5. Sắp xếp */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-filter-sort"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:filter.sort", { defaultValue: "Sắp xếp:" })}
          </label>
          <SelectSort
            id="attendance-filter-sort"
            value={filter.sortBy}
            onChange={(val) => onSortByChange(val as AttendanceSortOption)}
            options={sortOptions}
            className="w-44"
          />
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onResetFilters}
          title={t("input:filter.resetTooltip", {
            defaultValue: "Đặt lại tất cả bộ lọc",
          })}
        >
          <Icon name="refresh" size={13} />
          <span>{t("button:reset", { defaultValue: "Đặt lại" })}</span>
        </Button>
      )}
    </div>
  );
};
