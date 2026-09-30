import React from "react";
import { Empty } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  TimetableSummaryCards,
  TimetableFilterBar,
  WeeklyGridView,
  ListView,
  ClassDetailModal,
  TimetableSkeleton,
} from "@/modules/students/features/timetable/components";
import { useTimetable } from "@/modules/students/features/timetable/hooks";

export const TimetablePage: React.FC = () => {
  const {
    slots,
    summary,
    filter,
    loading,
    error,
    selectedSlot,
    isDetailOpen,
    hasActiveFilters,
    currentWeekLabel,
    setSelectedDate,
    setViewMode,
    resetFilters,
    openSlotDetail,
    closeSlotDetail,
    goToToday,
    goToPreviousWeek,
    goToNextWeek,
    refetch,
  } = useTimetable();

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="calendar" size={13} className="text-blue-600 shrink-0" />
                  <span>Thời khóa biểu & Lịch học</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Thời khóa biểu & Lịch học
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              HK1 • 2026-2027
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Tra cứu lịch học tuần, giảng đường, giảng viên và ca học các môn trong tuần
          </p>
        </div>
      </div>

      {/* 2. Overview Summary Cards (Dashboard style) */}
      <TimetableSummaryCards summary={summary} />

      {/* 3. Filter Bar (Select by week and view mode) */}
      <TimetableFilterBar
        selectedDate={filter.selectedDate}
        viewMode={filter.viewMode}
        currentWeekLabel={currentWeekLabel}
        hasActiveFilters={hasActiveFilters}
        onDateChange={setSelectedDate}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        onTodayClick={goToToday}
        onPrevWeekClick={goToPreviousWeek}
        onNextWeekClick={goToNextWeek}
      />

      {/* 4. Schedule Results View (Grid & List only) */}
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
          <Button variant="primary" onClick={() => refetch()}>
            Tải lại thời khóa biểu
          </Button>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Không có lịch học trong tuần này
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  Hiện tại chưa có buổi học nào được xếp lịch trong khoảng thời gian đã chọn.
                </p>
              </div>
            }
          >
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mt-3"
              >
                Đặt lại về tuần này
              </Button>
            )}
          </Empty>
        </div>
      ) : filter.viewMode === "grid" ? (
        <WeeklyGridView
          selectedDate={filter.selectedDate}
          slots={slots}
          onSlotClick={openSlotDetail}
        />
      ) : (
        <ListView slots={slots} onSlotClick={openSlotDetail} />
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
