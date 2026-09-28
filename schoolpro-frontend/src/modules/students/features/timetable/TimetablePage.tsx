import React from "react";
import { message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  TimetableSummaryCards,
  TimetableFilterBar,
  WeeklyGridView,
  DailyAgendaView,
  ListView,
  ClassDetailModal,
  TimetableSkeleton,
} from "@/modules/students/features/timetable/components";
import { useTimetable } from "@/modules/students/features/timetable/hooks";

export const TimetablePage: React.FC = () => {
  const {
    slots,
    summary,
    courses,
    filter,
    loading,
    error,
    selectedSlot,
    isDetailOpen,
    currentWeekLabel,
    currentMonthLabel,
    currentYearLabel,
    currentDateLabel,
    setSelectedDate,
    setFilterMode,
    setViewMode,
    setCourseCode,
    setShift,
    setClassType,
    setStatus,
    setSearchQuery,
    openSlotDetail,
    closeSlotDetail,
    goToToday,
    goToPrevious,
    goToNext,
    refetch,
  } = useTimetable();

  const handleExportPdf = () => {
    message.success("Đang chuẩn bị file PDF Thời khóa biểu để tải xuống...");
  };

  const handleSyncCalendar = () => {
    message.info("Tính năng đồng bộ lịch học với Google Calendar / iCal!");
  };

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 mb-0">
              Thời khóa biểu & Lịch học
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              HK1 • 2026-2027
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            Tra cứu lịch học tuần, lọc theo ngày/tháng/năm, phòng học và thông tin giảng viên
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="middle"
            onClick={handleSyncCalendar}
            icon={<Icon name="calendar" size={14} />}
            className="rounded-lg text-xs"
          >
            Đồng bộ Calendar
          </Button>

          <Button
            variant="primary"
            size="middle"
            onClick={handleExportPdf}
            icon={<Icon name="download" size={14} />}
            className="rounded-lg text-xs"
          >
            Xuất TKB (PDF)
          </Button>

          <Button
            variant="outline"
            size="middle"
            onClick={() => refetch()}
            icon={<Icon name="refresh" size={14} className={loading ? "animate-spin" : ""} />}
            className="rounded-lg text-xs"
            title="Làm mới thời khóa biểu"
          />
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      <TimetableSummaryCards summary={summary} />

      {/* 3. Comprehensive Date / Month / Year Filter Bar */}
      <TimetableFilterBar
        selectedDate={filter.selectedDate}
        filterMode={filter.filterMode}
        viewMode={filter.viewMode}
        courseCode={filter.courseCode}
        shift={filter.shift}
        classType={filter.classType}
        status={filter.status}
        searchQuery={filter.searchQuery}
        courses={courses}
        currentWeekLabel={currentWeekLabel}
        currentMonthLabel={currentMonthLabel}
        currentYearLabel={currentYearLabel}
        currentDateLabel={currentDateLabel}
        onDateChange={setSelectedDate}
        onFilterModeChange={setFilterMode}
        onViewModeChange={setViewMode}
        onCourseChange={setCourseCode}
        onShiftChange={setShift}
        onClassTypeChange={setClassType}
        onStatusChange={setStatus}
        onSearchChange={setSearchQuery}
        onTodayClick={goToToday}
        onPrevClick={goToPrevious}
        onNextClick={goToNext}
      />

      {/* 4. Main Timetable Schedule View (Week / Day / List) */}
      {loading && slots.length === 0 ? (
        <TimetableSkeleton />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không thể tải thời khóa biểu
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error.message || "Đã xảy ra lỗi khi tải dữ liệu thời khóa biểu. Vui lòng thử lại."}
          </p>
          <Button variant="primary" onClick={() => refetch()} className="rounded-lg text-xs">
            Tải lại thời khóa biểu
          </Button>
        </div>
      ) : (
        <div>
          {filter.viewMode === "week" && (
            <WeeklyGridView
              selectedDate={filter.selectedDate}
              slots={slots}
              onSlotClick={openSlotDetail}
            />
          )}

          {filter.viewMode === "day" && (
            <DailyAgendaView
              selectedDate={filter.selectedDate}
              slots={slots}
              onSlotClick={openSlotDetail}
              onGoToToday={goToToday}
            />
          )}

          {filter.viewMode === "list" && (
            <ListView slots={slots} onSlotClick={openSlotDetail} />
          )}
        </div>
      )}

      {/* 5. Class Detail Modal Popup */}
      <ClassDetailModal
        slot={selectedSlot}
        isOpen={isDetailOpen}
        onClose={closeSlotDetail}
      />
    </div>
  );
};
