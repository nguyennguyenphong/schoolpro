import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSummary } from "@/modules/students/features/timetable/types";

interface TimetableSummaryCardsProps {
  summary: TimetableSummary;
}

export const TimetableSummaryCards: React.FC<TimetableSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số buổi học */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng số buổi học
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalSessions}
          </span>
          <span className="text-xs text-slate-400 font-semibold">buổi học</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            HK1 • 26-27
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Phân loại: <strong className="text-slate-700">{summary.totalTheorySessions} LT</strong> • <strong className="text-slate-700">{summary.totalPracticeSessions} TH</strong></span>
          <span className="text-blue-600 font-medium">Đã xếp lịch</span>
        </div>
      </Card>

      {/* 2. Tín chỉ đang học */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tín chỉ đăng ký
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalCredits}
          </span>
          <span className="text-xs text-slate-400 font-semibold">tín chỉ</span>
          <Tag color="purple" className="ml-auto m-0 font-semibold">
            Chính khóa
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Tiến độ: <strong className="text-slate-700">Theo kế hoạch</strong></span>
          <span className="text-purple-600 font-medium">Học kỳ 1</span>
        </div>
      </Card>

      {/* 3. Buổi sắp diễn ra */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Buổi sắp diễn ra
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.upcomingSessions}
          </span>
          <span className="text-xs text-slate-400 font-semibold">buổi tới</span>
          <Tag color="warning" className="ml-auto m-0 font-semibold">
            Cần tham gia
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Đã hoàn thành: <strong className="text-slate-700">{summary.completedSessions} buổi</strong></span>
          <span className="text-amber-600 font-medium">Đúng lịch</span>
        </div>
      </Card>

      {/* 4. Tỷ lệ chuyên cần */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ chuyên cần
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.attendanceRate}%
          </span>
          <span className="text-xs text-slate-400 font-semibold">chuyên cần</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            Đạt chuẩn thi
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Điểm danh: <strong className="text-slate-700">QR Code & Thẻ</strong></span>
          <span className="text-emerald-600 font-medium">Đủ điều kiện</span>
        </div>
      </Card>
    </div>
  );
};
