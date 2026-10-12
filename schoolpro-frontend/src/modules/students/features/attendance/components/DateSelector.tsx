import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { DEFAULT_DEMO_TODAY } from "@/modules/students/features/attendance/hooks";

interface DateSelectorProps {
  selectedDate: string;
  onDateSelect?: (dateStr: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  counts: {
    all: number;
    open: number;
    present: number;
    absent: number;
  };
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  onPreviousDay,
  onNextDay,
  onToday,
  activeFilter,
  onFilterChange,
  searchQuery = "",
  onSearchChange,
  hasActiveFilters = false,
  onResetFilters,
  counts,
}) => {
  const { t } = useTranslation(["card", "input", "button", "common"]);
  const currentDayjs = dayjs(selectedDate);
  const isToday =
    selectedDate === DEFAULT_DEMO_TODAY ||
    selectedDate === dayjs().format("YYYY-MM-DD");

  const getDayOfWeekLabel = (d: dayjs.Dayjs) => {
    const day = d.day();
    const map: Record<number, string> = {
      0: t("common:days.sunday", { defaultValue: "Chủ Nhật" }),
      1: t("common:days.monday", { defaultValue: "Thứ Hai" }),
      2: t("common:days.tuesday", { defaultValue: "Thứ Ba" }),
      3: t("common:days.wednesday", { defaultValue: "Thứ Tư" }),
      4: t("common:days.thursday", { defaultValue: "Thứ Năm" }),
      5: t("common:days.friday", { defaultValue: "Thứ Sáu" }),
      6: t("common:days.saturday", { defaultValue: "Thứ Bảy" }),
    };
    return map[day] || "";
  };

  const formattedDisplay = `${getDayOfWeekLabel(currentDayjs)}, ${currentDayjs.format("DD/MM/YYYY")}`;

  const filterTabs = [
    {
      key: "all",
      label: t("card:attendance.filter.all", { defaultValue: "Tất cả môn học" }),
      count: counts.all,
    },
    {
      key: "open",
      label: t("card:attendance.filter.open", {
        defaultValue: "Đang mở điểm danh",
      }),
      count: counts.open,
      highlight: true,
    },
    {
      key: "present",
      label: t("card:attendance.filter.present", {
        defaultValue: "Đã điểm danh",
      }),
      count: counts.present,
    },
    {
      key: "absent",
      label: t("card:attendance.filter.absent", {
        defaultValue: "Vắng / Quá hạn",
      }),
      count: counts.absent,
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-4">
      {/* Top row: Date navigation & Search Input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Date Navigator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-[#f0f0f0]">
            <button
              type="button"
              onClick={onPreviousDay}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title={t("button:previousDay", { defaultValue: "Ngày trước" })}
              aria-label={t("button:previousDay", { defaultValue: "Ngày trước" })}
            >
              <Icon name="chevron-left" size={16} />
            </button>

            <button
              type="button"
              onClick={onToday}
              className={`px-3 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isToday
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              <Icon name="calendar" size={13} />
              <span>
                {t("button:today", { defaultValue: "Hôm nay" })}
              </span>
            </button>

            <button
              type="button"
              onClick={onNextDay}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title={t("button:nextDay", { defaultValue: "Ngày sau" })}
              aria-label={t("button:nextDay", { defaultValue: "Ngày sau" })}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>

          {onDateSelect && (
            <div className="flex items-center">
              <label htmlFor="attendance-date-picker" className="sr-only">
                {t("input:attendance.selectDateLabel", {
                  defaultValue: "Chọn ngày điểm danh",
                })}
              </label>
              <DatePicker
                id="attendance-date-picker"
                name="attendanceDate"
                value={currentDayjs}
                format="DD/MM/YYYY"
                allowClear={false}
                onChange={(val) => {
                  if (val && !Array.isArray(val)) {
                    onDateSelect(val.format("YYYY-MM-DD"));
                  }
                }}
                className="w-36 rounded-xl"
              />
            </div>
          )}

          {/* Current Date Display */}
          <div className="pl-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-0 flex items-center gap-2">
              <span>{formattedDisplay}</span>
              {isToday && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t("button:today", { defaultValue: "Hôm nay" })}
                </span>
              )}
            </h2>
            <span className="text-xs text-slate-400 block">
              {t("card:attendance.filter.dateSubtitle", {
                defaultValue:
                  "Danh sách các môn học có lịch điểm danh trong ngày",
              })}
            </span>
          </div>
        </div>

        {/* Right: Search Input with accessible label */}
        {onSearchChange && (
          <div className="flex items-center gap-2 w-full lg:w-72">
            <label htmlFor="attendance-search-input" className="sr-only">
              {t("input:attendance.searchPlaceholder", {
                defaultValue: "Tìm môn học, mã môn, giáo viên, phòng học...",
              })}
            </label>
            <Input
              id="attendance-search-input"
              name="attendanceSearch"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("input:attendance.searchPlaceholder", {
                defaultValue: "Tìm môn học, giáo viên, phòng học...",
              })}
              prefix={<Icon name="search" size={14} className="text-slate-400" />}
              allowClear
              className="rounded-xl text-xs"
            />
          </div>
        )}
      </div>

      {/* Bottom row: Filter Status Tabs */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-50 text-slate-600 border-[#f0f0f0] hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4.5 text-center ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.highlight && tab.count > 0
                        ? "bg-amber-100 text-amber-700 font-extrabold"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Icon name="refresh" size={13} />
            <span>
              {t("button:resetFilters", { defaultValue: "Đặt lại bộ lọc" })}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
