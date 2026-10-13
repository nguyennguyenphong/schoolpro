import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import type {
  AttendanceFilter,
  AttendanceShiftFilter,
} from "@/modules/students/features/attendance/types";

export interface AttendanceDropdownFiltersProps {
  filter: AttendanceFilter;
  hasActiveFilters?: boolean;
  onDateChange: (dateStr: string) => void;
  onTodayClick: () => void;
  onPrevDayClick: () => void;
  onNextDayClick: () => void;
  onShiftChange: (shift: AttendanceShiftFilter) => void;
  onResetFilters: () => void;
}

/**
 * Date navigation (< | Hôm nay | >), DatePicker (Ngày học), and fixed Shift selector (Buổi sáng, Buổi chiều, Buổi tối).
 * All selected values sync directly to URL query parameters and trigger backend API filtering.
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
  onResetFilters,
}) => {
  const { t } = useTranslation(["input", "button"]);
  const currentDayjs = dayjs(filter.selectedDate);
  const isToday = currentDayjs.isSame(dayjs(), "day");

  const handleDatePickerChange = (date: Dayjs | Dayjs[] | null) => {
    if (date && !Array.isArray(date)) {
      onDateChange(date.format("YYYY-MM-DD"));
    }
  };

  // Fixed shift options: Tất cả buổi học, Buổi sáng, Buổi chiều, Buổi tối
  const shiftOptions = [
    {
      label: t("input:attendance.allShifts"),
      value: "all",
    },
    {
      label: t("input:attendance.shiftMorning"),
      value: "morning",
    },
    {
      label: t("input:attendance.shiftAfternoon"),
      value: "afternoon",
    },
    {
      label: t("input:attendance.shiftEvening"),
      value: "evening",
    },
  ];

  return (
    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* 1. Hôm nay & Date Navigation (< | Hôm nay | >) */}
        <div className="flex items-center h-8 bg-slate-100 p-0.5 rounded-lg border border-[#f0f0f0] shrink-0">
          <button
            type="button"
            onClick={onPrevDayClick}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            title={t("button:previousDay")}
            aria-label={t("button:previousDay")}
          >
            <Icon name="chevron-left" size={15} />
          </button>

          <button
            type="button"
            onClick={onTodayClick}
            className={`px-2.5 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
            onClick={onNextDayClick}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
            title={t("button:nextDay")}
            aria-label={t("button:nextDay")}
          >
            <Icon name="chevron-right" size={15} />
          </button>
        </div>

        {/* 2. Ngày học (DatePicker) */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-date-picker"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:attendance.dateLabel")}
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

        {/* 3. Buổi học (Fixed values: Buổi sáng, Buổi chiều, Buổi tối) */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="attendance-filter-shift"
            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
          >
            {t("input:attendance.shiftLabel")}
          </label>
          <Select
            id="attendance-filter-shift"
            value={filter.shift}
            onChange={(val) => onShiftChange(val as AttendanceShiftFilter)}
            options={shiftOptions}
            className="w-40"
          />
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onResetFilters}
          className="whitespace-nowrap shrink-0"
          title={t("input:filter.resetTooltip")}
        >
          <Icon name="refresh" size={13} />
          <span>{t("button:reset")}</span>
        </Button>
      )}
    </div>
  );
};
