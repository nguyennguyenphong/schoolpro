import React from "react";
import dayjs from "dayjs";
import { Icon } from "@/components/ui/Icon";

interface DateSelectorProps {
  selectedDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    open: number;
    present: number;
    absent: number;
  };
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const currentDayjs = dayjs(selectedDate);
  const isToday = selectedDate === "2026-09-29" || selectedDate === dayjs().format("YYYY-MM-DD");

  const getVietnameseDayOfWeek = (d: dayjs.Dayjs) => {
    const day = d.day();
    switch (day) {
      case 0:
        return "Chủ Nhật";
      case 1:
        return "Thứ Hai";
      case 2:
        return "Thứ Ba";
      case 3:
        return "Thứ Tư";
      case 4:
        return "Thứ Năm";
      case 5:
        return "Thứ Sáu";
      case 6:
        return "Thứ Bảy";
      default:
        return "";
    }
  };

  const formattedDisplay = `${getVietnameseDayOfWeek(currentDayjs)}, ngày ${currentDayjs.format("DD/MM/YYYY")}`;

  const filterTabs = [
    { key: "all", label: "Tất cả môn", count: counts.all },
    { key: "open", label: "Đang mở điểm danh", count: counts.open, highlight: true },
    { key: "present", label: "Đã điểm danh", count: counts.present },
    { key: "absent", label: "Vắng / Quá hạn", count: counts.absent },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
      {/* Top row: Date navigation & Quick Today button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-[#f0f0f0]">
            <button
              type="button"
              onClick={onPreviousDay}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Ngày trước"
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
              <span>Hôm nay</span>
            </button>

            <button
              type="button"
              onClick={onNextDay}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Ngày sau"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>

          {/* Current Date Display */}
          <div className="pl-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-0 flex items-center gap-2">
              <span>{formattedDisplay}</span>
              {isToday && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Hôm nay
                </span>
              )}
            </h2>
            <span className="text-xs text-slate-400 block sm:inline">
              Danh sách các môn học có lịch điểm danh trong ngày
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Filter Status Tabs */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
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
    </div>
  );
};
