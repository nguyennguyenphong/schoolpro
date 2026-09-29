import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradeSummaryCardsProps {
  summary: GradeSummary;
}

export const GradeSummaryCards: React.FC<GradeSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Điểm trung bình học kỳ */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm trung bình (ĐTB)
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.gpa.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            Học kỳ 1
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Phạm vi: <strong className="text-slate-700">13 môn học</strong></span>
          <span className="text-blue-600 font-medium">Xuất sắc</span>
        </div>
      </Card>

      {/* 2. Xếp loại Học lực */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Xếp loại Học lực
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight">
            {summary.academicRank}
          </span>
          <Tag color="purple" className="ml-auto m-0 font-semibold">
            {summary.excellentSubjectsCount}/{summary.totalSubjectsCount} môn Giỏi
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Đạt chuẩn: <strong className="text-slate-700">Thông tư 22 BGD</strong></span>
          <span className="text-purple-600 font-medium">Khen thưởng</span>
        </div>
      </Card>

      {/* 3. Kết quả Rèn luyện (Hạnh kiểm) */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kết quả Rèn luyện
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.conductRank}
          </span>
          <span className="text-xs text-slate-400 font-semibold">hạnh kiểm</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {summary.attendanceRate}% chuyên cần
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Vi phạm nề nếp: <strong className="text-slate-700">0 lần</strong></span>
          <span className="text-emerald-600 font-medium">Tích cực</span>
        </div>
      </Card>

      {/* 4. Thứ hạng trong lớp */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Thứ hạng trong lớp
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="user" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            Hạng {summary.classPosition}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ {summary.totalClassStudents} HS</span>
          <Tag color="warning" className="ml-auto m-0 font-semibold">
            Top 7%
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Danh hiệu: <strong className="text-slate-700">Học sinh Giỏi</strong></span>
          <span className="text-amber-600 font-medium">Xuất sắc</span>
        </div>
      </Card>
    </div>
  );
};
