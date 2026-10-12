import type React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

/**
 * Student Attendance Summary Cards matching AnnouncementSummaryCards style.
 */
export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  summary,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số môn học trong ngày */}
      <Card className="rounded-xl shadow-2xs transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.todayScheduleTitle", {
              defaultValue: "Tổng số tiết học",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalToday}
          </span>
        </div>
      </Card>

      {/* 2. Đang mở điểm danh */}
      <Card className="rounded-xl shadow-2xs transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.filter.open", {
              defaultValue: "Đang mở điểm danh",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.openToday ?? summary.pendingToday}
          </span>
        </div>
      </Card>

      {/* 3. Đã điểm danh hợp lệ */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.attendedTitle", {
              defaultValue: "Đã điểm danh",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.attendedToday}
          </span>
        </div>
      </Card>

      {/* 4. Vắng mặt / Quá hạn */}
      <Card className="rounded-xl shadow-2xs hover:border-rose-400 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.filter.absent", {
              defaultValue: "Vắng / Quá hạn",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Icon name="warning" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {summary.absentToday}
          </span>
        </div>
      </Card>
    </div>
  );
};
