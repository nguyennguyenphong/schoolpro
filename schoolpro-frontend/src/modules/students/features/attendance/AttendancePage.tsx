import React, { useState } from "react";
import { Empty, Skeleton } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAttendance } from "@/modules/students/features/attendance/hooks";
import {
  AttendanceSummaryCards,
  DateSelector,
  SubjectAttendanceCard,
  AttendanceModal,
  AttendanceDetailModal,
} from "@/modules/students/features/attendance/components";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

export const AttendancePage: React.FC = () => {
  const {
    selectedDate,
    records,
    filteredRecords,
    summary,
    loading,
    submitting,
    filterStatus,
    setFilterStatus,
    activeRecordForModal,
    setActiveRecordForModal,
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

  // Counts for filter tabs
  const counts = {
    all: records.length,
    open: records.filter((r) => r.status === "open").length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-12">
      {/* 1. Header with Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={14} />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="userCheck" size={13} className="text-blue-600 shrink-0" />
                  <span>Điểm danh môn học</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Điểm danh môn học theo ngày
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Điểm danh nhanh bằng <strong>Quét mã QR</strong>, <strong>Tải ảnh QR</strong> hoặc <strong>Nhập mã code</strong> do thầy cô cung cấp.
          </p>
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      {summary && <AttendanceSummaryCards summary={summary} />}

      {/* 3. Date Navigation & Filter Tabs */}
      <DateSelector
        selectedDate={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        counts={counts}
      />

      {/* 4. Subject Attendance List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs"
            >
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <p className="text-slate-800 font-bold text-sm">
                  {filterStatus === "open"
                    ? "Hiện không có môn học nào đang mở cổng điểm danh"
                    : filterStatus === "present"
                    ? "Chưa có môn học nào được điểm danh trong ngày này"
                    : filterStatus === "absent"
                    ? "Không có môn học nào bị đánh dấu vắng mặt"
                    : "Không có lịch học nào trong ngày được chọn"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {filterStatus === "all"
                    ? "Em có thể bấm 'Hôm nay' hoặc chọn các ngày khác trong tuần để xem lịch điểm danh."
                    : "Hãy thử đổi bộ lọc hoặc kiểm tra lại lịch học của ngày hôm nay."}
                </p>
              </div>
            }
          />
          {filterStatus !== "all" && (
            <Button
              variant="outline"
              onClick={() => setFilterStatus("all")}
              className="text-xs font-semibold"
            >
              Xem tất cả môn học
            </Button>
          )}
        </div>
      )}

      {/* 5. Attendance Check-in Modal (QR Camera + QR Upload + Code Entry) */}
      <AttendanceModal
        open={modalOpen}
        record={activeRecordForModal}
        onClose={handleCloseCheckIn}
        onSubmitCheckIn={performCheckIn}
        submitting={submitting}
      />

      {/* 6. Attendance Detail View Modal */}
      <AttendanceDetailModal
        open={detailModalOpen}
        record={selectedRecordForDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
