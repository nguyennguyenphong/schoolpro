import type React from "react";
import { useTranslation } from "react-i18next";
import { StudentMetricCard } from "@/modules/students/components";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

/**
 * Student Attendance Summary Cards using shared StudentMetricCard.
 */
export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  summary,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số môn học trong ngày */}
      <StudentMetricCard
        title={t("card:attendance.summary.todayScheduleTitle")}
        value={summary.totalToday}
        iconName="calendar"
        iconBgClass="bg-blue-50 text-blue-600 border-blue-200"
        hoverBorderClass="hover:border-blue-400"
      />

      {/* 2. Đang mở điểm danh */}
      <StudentMetricCard
        title={t("card:attendance.filter.open")}
        value={summary.openToday ?? summary.pendingToday}
        iconName="clock"
        iconBgClass="bg-amber-50 text-amber-600 border-amber-200"
        hoverBorderClass="hover:border-amber-400"
      />

      {/* 3. Đã điểm danh hợp lệ */}
      <StudentMetricCard
        title={t("card:attendance.summary.attendedTitle")}
        value={summary.attendedToday}
        iconName="checkCircle"
        iconBgClass="bg-emerald-50 text-emerald-600 border-emerald-200"
        hoverBorderClass="hover:border-emerald-400"
      />

      {/* 4. Vắng mặt / Quá hạn */}
      <StudentMetricCard
        title={t("card:attendance.filter.absent")}
        value={summary.absentToday}
        iconName="warning"
        iconBgClass="bg-rose-50 text-rose-600 border-rose-200"
        hoverBorderClass="hover:border-rose-400"
      />
    </div>
  );
};

