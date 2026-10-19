import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { Icon } from "@/components/ui/Icon";
import {
  AttendanceDetailModal,
  AttendanceFilterBar,
  AttendanceModal,
  AttendancePageHeader,
  AttendanceSkeleton,
  AttendanceSummaryCards,
  SubjectAttendanceCard,
} from "@/modules/students/features/attendance/components";
import { useAttendance } from "@/modules/students/features/attendance/hooks";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

export const AttendancePage: React.FC = () => {
  const { t } = useTranslation(["card", "button", "message"]);
  const {
    filter,
    setSelectedDate,
    setSearchQuery,
    setShift,
    records,
    summary,
    loading,
    submitting,
    setFilterStatus,
    hasActiveFilters,
    resetFilters,
    activeRecordForModal,
    setActiveRecordForModal,
    isRealtimeConnected,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    performCheckIn,
  } = useAttendance();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] =
    useState<AttendanceRecord | null>(null);

  const handleOpenCheckIn = (record: AttendanceRecord) => {
    setActiveRecordForModal(record);
    setModalOpen(true);
  };

  const handleCloseCheckIn = () => {
    setModalOpen(false);
    setActiveRecordForModal(null);
  };

  const handleOpenDetail = (record: AttendanceRecord) => {
    setSelectedRecordForDetail(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecordForDetail(null);
  };

  // Counts for status filter tabs come from API summary so they stay accurate when status filter is active
  const counts = {
    all: summary?.totalToday ?? records.length,
    open: summary?.openToday ?? 0,
    present: summary?.attendedToday ?? 0,
    upcoming: summary?.upcomingToday ?? 0,
    excused: summary?.excusedToday ?? 0,
    absent: summary?.absentToday ?? 0,
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb & Leave Requests Link */}
      <AttendancePageHeader
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* 2. Summary Metric Cards */}
      {summary && <AttendanceSummaryCards summary={summary} />}

      {/* 3. Filter Bar (Status Tabs + Search & View Toggle + Today/Date/Shift URL Filters) */}
      <AttendanceFilterBar
        filter={filter}
        counts={counts}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearchQuery}
        onDateChange={setSelectedDate}
        onTodayClick={goToToday}
        onPrevDayClick={goToPreviousDay}
        onNextDayClick={goToNextDay}
        onShiftChange={setShift}
        onResetFilters={resetFilters}
      />

      {/* 4. Schedule & Attendance Results Area (Grid Cards or Table List) */}
      {loading && records.length === 0 ? (
        <AttendanceSkeleton count={6} />
      ) : records.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  {hasActiveFilters
                    ? t("message:empty.noFilteredResults")
                    : t("card:attendance.empty.noScheduleTitle")}
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? t("message:empty.noFilteredDescription")
                    : t("card:attendance.empty.dateHint")}
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
                <Icon name="refresh" size={13} />
                <span>{t("button:reset")}</span>
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {records.map((record) => (
            <SubjectAttendanceCard
              key={record.id}
              record={record}
              onOpenCheckIn={handleOpenCheckIn}
              onViewDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* 5. Student Check-in Modal (6-Digit PIN + QR Camera/Image Upload + GPS Verification) */}
      <AttendanceModal
        open={modalOpen}
        record={activeRecordForModal}
        onClose={handleCloseCheckIn}
        onSubmitCheckIn={performCheckIn}
        submitting={submitting}
      />

      {/* 6. Attendance Detail Modal */}
      <AttendanceDetailModal
        open={detailModalOpen}
        record={selectedRecordForDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
