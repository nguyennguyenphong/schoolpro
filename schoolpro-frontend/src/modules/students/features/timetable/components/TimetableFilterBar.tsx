import React from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Select, Segmented } from "antd";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type {
  TimetableFilterMode,
  TimetableViewMode,
  ClassShift,
  ClassType,
  ClassStatus,
} from "@/modules/students/features/timetable/types";

interface TimetableFilterBarProps {
  selectedDate: string;
  filterMode: TimetableFilterMode;
  viewMode: TimetableViewMode;
  courseCode?: string;
  shift?: "all" | ClassShift;
  classType?: "all" | ClassType;
  status?: "all" | ClassStatus;
  searchQuery?: string;
  courses: { code: string; name: string }[];
  currentWeekLabel: string;
  currentMonthLabel: string;
  currentYearLabel: string;
  currentDateLabel: string;
  onDateChange: (dateStr: string) => void;
  onFilterModeChange: (mode: TimetableFilterMode) => void;
  onViewModeChange: (mode: TimetableViewMode) => void;
  onCourseChange: (code?: string) => void;
  onShiftChange: (shift?: "all" | ClassShift) => void;
  onClassTypeChange: (type?: "all" | ClassType) => void;
  onStatusChange: (status?: "all" | ClassStatus) => void;
  onSearchChange: (query: string) => void;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
}

export const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
  selectedDate,
  filterMode,
  viewMode,
  courseCode,
  shift,
  classType,
  status,
  searchQuery,
  courses,
  currentWeekLabel,
  currentMonthLabel,
  currentYearLabel,
  currentDateLabel,
  onDateChange,
  onFilterModeChange,
  onViewModeChange,
  onCourseChange,
  onShiftChange,
  onClassTypeChange,
  onStatusChange,
  onSearchChange,
  onTodayClick,
  onPrevClick,
  onNextClick,
}) => {
  const currentDayjs = dayjs(selectedDate);

  const handleDatePickerChange = (date: Dayjs | Dayjs[] | null) => {
    if (date && !Array.isArray(date)) {
      onDateChange(date.format("YYYY-MM-DD"));
    }
  };

  // Get active range label
  const getActiveRangeDisplay = () => {
    switch (filterMode) {
      case "date":
        return `Ngày ${currentDateLabel}`;
      case "week":
        return `Tuần: ${currentWeekLabel}`;
      case "month":
        return `Tháng ${currentMonthLabel}`;
      case "year":
        return `Năm học ${currentYearLabel}`;
      default:
        return currentWeekLabel;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      {/* Top Row: Date Navigation & Mode Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Navigator & Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today Button */}
          <Button
            variant="outline"
            size="small"
            onClick={onTodayClick}
            className="text-xs font-semibold rounded-lg"
          >
            Hôm nay
          </Button>

          {/* Prev / Next controls */}
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={onPrevClick}
              className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Kỳ trước"
            >
              <Icon name="chevron-left" size={14} />
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              type="button"
              onClick={onNextClick}
              className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Kỳ tiếp theo"
            >
              <Icon name="chevron-right" size={14} />
            </button>
          </div>

          {/* Current Label Banner */}
          <div className="px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs font-bold text-blue-700 flex items-center gap-1.5">
            <Icon name="calendar" size={14} className="text-blue-600" />
            <span>{getActiveRangeDisplay()}</span>
          </div>

          {/* Date / Month / Year Picker depending on filterMode */}
          <div className="w-44">
            {filterMode === "date" && (
              <DatePicker
                value={currentDayjs}
                onChange={handleDatePickerChange}
                format="DD/MM/YYYY"
                allowClear={false}
                className="w-full text-xs rounded-lg border-slate-200"
              />
            )}
            {filterMode === "week" && (
              <DatePicker
                picker="week"
                value={currentDayjs}
                onChange={handleDatePickerChange}
                format="[Tuần] w - YYYY"
                allowClear={false}
                className="w-full text-xs rounded-lg border-slate-200"
              />
            )}
            {filterMode === "month" && (
              <DatePicker
                picker="month"
                value={currentDayjs}
                onChange={handleDatePickerChange}
                format="MM/YYYY"
                allowClear={false}
                className="w-full text-xs rounded-lg border-slate-200"
              />
            )}
            {filterMode === "year" && (
              <DatePicker
                picker="year"
                value={currentDayjs}
                onChange={handleDatePickerChange}
                format="YYYY"
                allowClear={false}
                className="w-full text-xs rounded-lg border-slate-200"
              />
            )}
          </div>
        </div>

        {/* Right: Filter Mode & View Mode Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc theo: Ngày / Tuần / Tháng / Năm */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Lọc:</span>
            <Segmented
              value={filterMode}
              onChange={(val) => onFilterModeChange(val as TimetableFilterMode)}
              options={[
                { label: "Ngày", value: "date" },
                { label: "Tuần", value: "week" },
                { label: "Tháng", value: "month" },
                { label: "Năm", value: "year" },
              ]}
              size="small"
              className="bg-slate-100 p-0.5 rounded-lg text-xs"
            />
          </div>

          {/* Dạng hiển thị: Lưới tuần / Theo ngày / Danh sách */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Chế độ xem:</span>
            <Segmented
              value={viewMode}
              onChange={(val) => onViewModeChange(val as TimetableViewMode)}
              options={[
                { label: "Lưới tuần", value: "week" },
                { label: "Theo ngày", value: "day" },
                { label: "Danh sách", value: "list" },
              ]}
              size="small"
              className="bg-slate-100 p-0.5 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Detailed Secondary Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
        {/* 1. Môn học */}
        <div>
          <Select
            value={courseCode || "all"}
            onChange={(val) => onCourseChange(val === "all" ? undefined : val)}
            placeholder="Tất cả học phần"
            className="w-full text-xs"
            size="middle"
            options={[
              { value: "all", label: "Tất cả học phần" },
              ...courses.map((c) => ({
                value: c.code,
                label: `${c.code} - ${c.name}`,
              })),
            ]}
          />
        </div>

        {/* 2. Ca học */}
        <div>
          <Select
            value={shift || "all"}
            onChange={(val) => onShiftChange(val as ClassShift | "all")}
            placeholder="Ca học"
            className="w-full text-xs"
            size="middle"
            options={[
              { value: "all", label: "Tất cả ca học" },
              { value: "morning", label: "Ca Sáng (07:00 - 11:30)" },
              { value: "afternoon", label: "Ca Chiều (12:30 - 17:30)" },
              { value: "evening", label: "Ca Tối (17:45 - 21:00)" },
            ]}
          />
        </div>

        {/* 3. Loại tiết học */}
        <div>
          <Select
            value={classType || "all"}
            onChange={(val) => onClassTypeChange(val as ClassType | "all")}
            placeholder="Loại tiết học"
            className="w-full text-xs"
            size="middle"
            options={[
              { value: "all", label: "Tất cả hình thức" },
              { value: "theory", label: "Lý thuyết" },
              { value: "practice", label: "Thực hành (Lab)" },
              { value: "seminar", label: "Chuyên đề / Hội thảo" },
            ]}
          />
        </div>

        {/* 4. Trạng thái */}
        <div>
          <Select
            value={status || "all"}
            onChange={(val) => onStatusChange(val as ClassStatus | "all")}
            placeholder="Trạng thái buổi học"
            className="w-full text-xs"
            size="middle"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "upcoming", label: "Sắp diễn ra" },
              { value: "ongoing", label: "Đang diễn ra" },
              { value: "completed", label: "Đã hoàn thành" },
              { value: "cancelled", label: "Tạm nghỉ" },
            ]}
          />
        </div>

        {/* 5. Tìm kiếm nhanh */}
        <div>
          <Input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm môn, phòng, GV..."
            prefix={<Icon name="search" size={14} className="text-slate-400 mr-1" />}
            allowClear
            className="w-full text-xs rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
