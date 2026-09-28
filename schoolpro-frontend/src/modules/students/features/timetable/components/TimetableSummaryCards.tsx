import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSummary } from "@/modules/students/features/timetable/types";

interface TimetableSummaryCardsProps {
  summary: TimetableSummary;
  label?: string;
}

export const TimetableSummaryCards: React.FC<TimetableSummaryCardsProps> = ({
  summary,
  label = "trong kỳ lọc",
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số tiết học */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Tổng số buổi học
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 leading-tight">
                {summary.totalSessions}
              </span>
              <span className="text-xs text-slate-500 font-normal">buổi {label}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Icon name="calendar" size={20} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="text-blue-600 font-semibold">{summary.totalTheorySessions} lý thuyết</span>
          <span>•</span>
          <span className="text-emerald-600 font-semibold">{summary.totalPracticeSessions} thực hành</span>
        </div>
      </Card>

      {/* 2. Tổng số tín chỉ đang học */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Tín chỉ theo khóa
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 leading-tight">
                {summary.totalCredits}
              </span>
              <span className="text-xs text-slate-500 font-normal">tín chỉ đang học</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Icon name="book" size={20} />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          HK1 Năm học 2026 - 2027
        </div>
      </Card>

      {/* 3. Tiến độ buổi học */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Buổi sắp diễn ra
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600 leading-tight">
                {summary.upcomingSessions}
              </span>
              <span className="text-xs text-slate-500 font-normal">buổi tới</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Icon name="clock" size={20} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{summary.completedSessions} buổi đã hoàn thành</span>
        </div>
      </Card>

      {/* 4. Tỷ lệ chuyên cần */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Tỷ lệ chuyên cần
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 leading-tight">
                {summary.attendanceRate}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Đạt chuẩn</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Icon name="check" size={20} />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          Điểm danh quét mã QR & thẻ sinh viên
        </div>
      </Card>
    </div>
  );
};
