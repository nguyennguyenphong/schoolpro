import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { Icon } from "@/components/ui/Icon";
import {
  AttendanceDetailModal,
  AttendanceFilterBar,
  AttendanceListView,
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
    setClassType,
    setSortBy,
    setViewMode,
    records,
    filteredRecords,
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

  // Counts for status filter tabs (matching AnnouncementFilterBar pattern)
  const counts = {
    all: records.length,
    open: records.filter((r) => r.status === "open").length,
    present: records.filter((r) => r.status === "present").length,
    upcoming: records.filter((r) => r.status === "upcoming").length,
    absent: records.filter(
      (r) => r.status === "absent" || r.status === "excused",
    ).length,
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb & Realtime Badge */}
      <AttendancePageHeader
        summary={summary}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* 2. Summary Metric Cards (matching AnnouncementSummaryCards) */}
      {summary && <AttendanceSummaryCards summary={summary} />}

      {/* 3. Filter Bar (Status Tabs + Search & View Toggle + Date Navigation & Dropdowns) */}
      <AttendanceFilterBar
        filter={filter}
        counts={counts}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
        onDateChange={setSelectedDate}
        onTodayClick={goToToday}
        onPrevDayClick={goToPreviousDay}
        onNextDayClick={goToNextDay}
        onShiftChange={setShift}
        onClassTypeChange={setClassType}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
      />

      {/* 4. Schedule & Attendance Results Area (Grid Cards or Table List like Timetable) */}
      {loading && records.length === 0 ? (
        <AttendanceSkeleton count={4} viewMode={filter.viewMode} />
      ) : filteredRecords.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  {hasActiveFilters
                    ? t("message:empty.noFilteredResults", {
                        defaultValue:
                          "Không tìm thấy môn học phù hợp với bộ lọc",
                      })
                    : t("card:attendance.empty.noScheduleTitle", {
                        defaultValue:
                          "Không có lịch học cần điểm danh trong ngày này",
                      })}
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? t("message:empty.noFilteredDescription", {
                        defaultValue:
                          "Hãy thử thay đổi điều kiện lọc hoặc đặt lại bộ lọc để xem toàn bộ danh sách.",
                      })
                    : t("card:attendance.empty.dateHint", {
                        defaultValue:
                          "Bạn có thể bấm 'Hôm nay' hoặc chọn ngày học khác để xem lịch điểm danh.",
                      })}
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
                <span>{t("button:reset", { defaultValue: "Đặt lại" })}</span>
              </Button>
            )}
          </Empty>
        </div>
      ) : filter.viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredRecords.map((record) => (
            <SubjectAttendanceCard
              key={record.id}
              record={record}
              onOpenCheckIn={handleOpenCheckIn}
              onViewDetail={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <AttendanceListView
          records={filteredRecords}
          onOpenCheckIn={handleOpenCheckIn}
          onViewDetail={handleOpenDetail}
        />
      )}

      {/* 5. Student Check-in Modal (6-Digit PIN + QR Camera/Image Upload + GPS Verification) */}
      <AttendanceModal
        open={modalOpen}
        record={activeRecordForModal}
        onClose={handleCloseCheckIn}
        onSubmitCheckIn={performCheckIn}
        submitting={submitting}
      />

      {/* 6. Attendance Proof & GPS Coordinates Detail Modal */}
      <AttendanceDetailModal
        open={detailModalOpen}
        record={selectedRecordForDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
