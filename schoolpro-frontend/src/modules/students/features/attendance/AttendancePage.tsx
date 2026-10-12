import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import {
  AttendanceDetailModal,
  AttendanceModal,
  AttendancePageHeader,
  AttendanceSkeleton,
  AttendanceSummaryCards,
  DateSelector,
  SubjectAttendanceCard,
  TeacherSessionConfigModal,
} from "@/modules/students/features/attendance/components";
import { useAttendance } from "@/modules/students/features/attendance/hooks";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

export const AttendancePage: React.FC = () => {
  const { t } = useTranslation(["card", "button"]);
  const {
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    records,
    filteredRecords,
    summary,
    loading,
    submitting,
    filterStatus,
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
    openOrUpdateTeacherSession,
    expireSessionNow,
    reload,
  } = useAttendance();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [teacherConfigOpen, setTeacherConfigOpen] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] =
    useState<AttendanceRecord | null>(null);
  const [selectedRecordForTeacher, setSelectedRecordForTeacher] =
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

  const handleOpenTeacherConfig = (record?: AttendanceRecord) => {
    setSelectedRecordForTeacher(
      record ||
        records.find((r) => r.status === "open") ||
        records[0] ||
        null,
    );
    setTeacherConfigOpen(true);
  };

  const handleCloseTeacherConfig = () => {
    setTeacherConfigOpen(false);
    setSelectedRecordForTeacher(null);
  };

  // Counts for filter tabs
  const counts = {
    all: records.length,
    open: records.filter((r) => r.status === "open").length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter(
      (r) => r.status === "absent" || r.status === "excused",
    ).length,
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-10">
      {/* 1. Header with Breadcrumb, Realtime Status & Teacher Session Generator Button */}
      <AttendancePageHeader
        summary={summary}
        loading={loading}
        isRealtimeConnected={isRealtimeConnected}
        onOpenTeacherConfig={() => handleOpenTeacherConfig()}
        onRefresh={() => void reload()}
      />

      {/* 2. Overview Summary Cards */}
      <AttendanceSummaryCards summary={summary} loading={loading} />

      {/* 3. Date Navigation, Search & Filter Tabs */}
      <DateSelector
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        counts={counts}
      />

      {/* 4. Subject Attendance List */}
      {loading ? (
        <AttendanceSkeleton count={4} />
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <SubjectAttendanceCard
              key={record.id}
              record={record}
              onOpenCheckIn={handleOpenCheckIn}
              onViewDetail={handleOpenDetail}
              onConfigureSession={handleOpenTeacherConfig}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-12 text-center shadow-2xs flex flex-col items-center gap-3">
          <Empty
            description={
              <div className="space-y-1">
                <p className="text-slate-800 font-bold text-sm mb-0">
                  {filterStatus === "open"
                    ? t("card:attendance.empty.noOpenTitle", {
                        defaultValue:
                          "Hiện không có môn học nào đang mở cổng điểm danh",
                      })
                    : filterStatus === "present"
                      ? t("card:attendance.empty.noPresentTitle", {
                          defaultValue:
                            "Chưa có môn học nào được điểm danh trong ngày này",
                        })
                      : filterStatus === "absent"
                        ? t("card:attendance.empty.noAbsentTitle", {
                            defaultValue:
                              "Không có môn học nào bị đánh dấu vắng mặt hoặc quá hạn",
                          })
                        : t("card:attendance.empty.noScheduleTitle", {
                            defaultValue:
                              "Không tìm thấy lịch điểm danh phù hợp trong ngày được chọn",
                          })}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-0">
                  {hasActiveFilters
                    ? t("card:attendance.empty.filterHint", {
                        defaultValue:
                          "Hãy thử đặt lại bộ lọc hoặc kiểm tra từ khóa tìm kiếm.",
                      })
                    : t("card:attendance.empty.dateHint", {
                        defaultValue:
                          "Bạn có thể bấm 'Hôm nay' hoặc chọn ngày học khác trong tuần để xem lịch điểm danh.",
                      })}
                </p>
              </div>
            }
          />
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="text-xs font-semibold"
            >
              {t("button:viewAllSubjects", {
                defaultValue: "Xem tất cả môn học",
              })}
            </Button>
          )}
        </div>
      )}

      {/* 5. Student Check-in Modal (6-Digit PIN + QR Camera/Image Upload + GPS Anti-Cheat) */}
      <AttendanceModal
        open={modalOpen}
        record={activeRecordForModal}
        onClose={handleCloseCheckIn}
        onSubmitCheckIn={performCheckIn}
        onOpenTeacherConfig={handleOpenTeacherConfig}
        submitting={submitting}
      />

      {/* 6. Teacher Session Configurator Modal (Generate 6-Digit PIN + QR + Scan Radius + Expiration) */}
      <TeacherSessionConfigModal
        key={`${selectedRecordForTeacher?.id || "default"}-${teacherConfigOpen ? "open" : "closed"}`}
        open={teacherConfigOpen}
        records={records}
        initialRecord={selectedRecordForTeacher}
        submitting={submitting}
        onClose={handleCloseTeacherConfig}
        onOpenOrUpdateSession={openOrUpdateTeacherSession}
        onExpireSessionNow={expireSessionNow}
      />

      {/* 7. Attendance Proof & GPS Coordinates Detail Modal */}
      <AttendanceDetailModal
        open={detailModalOpen}
        record={selectedRecordForDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
