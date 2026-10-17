import type React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";

export interface TimetableWeekNavigatorProps {
  selectedDate: string;
  minDate?: string;
  maxDate?: string;
  onDateChange: (dateStr: string) => void;
  onTodayClick: () => void;
  onPrevWeekClick: () => void;
  onNextWeekClick: () => void;
}

export const TimetableWeekNavigator: React.FC<TimetableWeekNavigatorProps> = ({
  selectedDate,
  minDate,
  maxDate,
  onDateChange,
  onTodayClick,
  onPrevWeekClick,
  onNextWeekClick,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const currentDayjs = dayjs(selectedDate);
  const minDayjs = minDate ? dayjs(minDate) : null;
  const maxDayjs = maxDate ? dayjs(maxDate) : null;

  const isPrevDisabled = minDayjs
    ? currentDayjs.isBefore(minDayjs) || currentDayjs.isSame(minDayjs, "day")
    : false;
  const isNextDisabled = maxDayjs
    ? currentDayjs.isAfter(maxDayjs) || currentDayjs.isSame(maxDayjs, "day")
    : false;

  const isCurrentWeek = currentDayjs.isSame(dayjs(), "isoWeek");

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
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Quick Week Navigation Buttons */}
      <div className="flex items-center h-8 bg-slate-100 p-0.5 rounded-lg border border-[#f0f0f0] shrink-0">
        <button
          type="button"
          onClick={onPrevWeekClick}
          disabled={isPrevDisabled}
          aria-label={t("button:previousWeek")}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
            isPrevDisabled
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
          }`}
          title={isPrevDisabled ? t("card:timetable.minLimitReached") : t("button:previousWeek")}
        >
          <Icon name="chevron-left" size={15} />
        </button>

        <button
          type="button"
          onClick={onTodayClick}
          aria-label={t("button:today")}
          className={`px-2.5 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            isCurrentWeek
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-700 hover:bg-white"
          }`}
          title={t("button:backToCurrentWeek")}
        >
          <Icon name="calendar" size={13} />
          <span>{t("button:today")}</span>
        </button>

        <button
          type="button"
          onClick={onNextWeekClick}
          disabled={isNextDisabled}
          aria-label={t("button:nextWeek")}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
            isNextDisabled
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer"
          }`}
          title={isNextDisabled ? t("card:timetable.maxLimitReached") : t("button:nextWeek")}
        >
          <Icon name="chevron-right" size={15} />
        </button>
      </div>

      {/* 2. Week Picker for direct jumping with boundaries */}
      <div className="w-full sm:w-44">
        <DatePicker
          picker="week"
          value={currentDayjs}
          onChange={handleDatePickerChange}
          disabledDate={disabledDate}
          format={t("card:timetable.weekPickerFormat")}
          allowClear={false}
          className="w-full"
          name="timetable-week-picker"
          aria-label={t("card:timetable.weekLabel")}
        />
      </div>
    </div>
  );
};
