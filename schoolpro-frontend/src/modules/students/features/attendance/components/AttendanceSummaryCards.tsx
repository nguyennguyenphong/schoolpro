import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tỷ lệ chuyên cần chung */}
      <Card className="rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ chuyên cần
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="userCheck" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {summary.overallRate}%
          </span>
          <Tag color="success" className="ml-auto m-0 font-bold">
            Xuất sắc
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Điểm rèn luyện: <strong className="text-slate-800">{summary.disciplineScore}/100</strong></span>
          <span className="text-emerald-600 font-semibold">Tốt</span>
        </div>
      </Card>

      {/* 2. Môn học hôm nay */}
      <Card className="rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Lịch học hôm nay
          </span>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">môn / tiết</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            HK1 2025-2026
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Khung giờ: <strong className="text-slate-700">07:30 - 17:00</strong></span>
          <span className="text-slate-500">4 ca học</span>
        </div>
      </Card>

      {/* 3. Đã điểm danh */}
      <Card className="rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đã điểm danh
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.attendedToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ {summary.totalToday} môn</span>
          <Tag
            color={summary.attendedToday > 0 ? "success" : "default"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.totalToday > 0
              ? `${Math.round((summary.attendedToday / summary.totalToday) * 100)}%`
              : "0%"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Đúng giờ: <strong className="text-emerald-700">{summary.attendedToday} ca</strong></span>
          <span className="text-emerald-600 font-medium">Hợp lệ</span>
        </div>
      </Card>

      {/* 4. Cần điểm danh ngay / Chờ điểm danh */}
      <Card className="rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cần điểm danh
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">môn cần làm</span>
          {summary.pendingToday > 0 ? (
            <span className="ml-auto relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          ) : (
            <Tag color="success" className="ml-auto m-0 font-semibold">
              Hoàn tất
            </Tag>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Vắng/Quá hạn: <strong className={summary.absentToday > 0 ? "text-rose-600" : "text-slate-700"}>{summary.absentToday} môn</strong></span>
          <span className="text-amber-600 font-medium">Đang mở cổng</span>
        </div>
      </Card>
    </div>
  );
};
