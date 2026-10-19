import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentAcademicOverview } from "@/modules/students/features/dashboard/types";

interface MetricCardsProps {
  overview: StudentAcademicOverview;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Điểm TB Học kỳ (ĐTB) */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm TB Học kỳ (ĐTB)
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {overview.gpa10.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {overview.academicRank}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#f0f0f0]">
          <span>Xếp loại: <strong className="text-slate-700">Học sinh {overview.academicRank}</strong></span>
          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
            +{overview.gpaChange} so với kỳ trước
          </span>
        </div>
      </Card>

      {/* 2. Kết quả Rèn luyện */}
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
            {overview.conductRank}
          </span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            {overview.conductScore} / 100 điểm
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#f0f0f0]">
          <span>Nề nếp kỷ luật:</span>
          <strong className="text-slate-700">0 lỗi vi phạm</strong>
        </div>
      </Card>

      {/* 3. Chuyên cần & Điểm danh */}
      <Card className="rounded-xl shadow-2xs hover:border-indigo-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chuyên cần & Điểm danh
          </span>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
            {overview.attendanceRate}%
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            ({overview.attendedSessions}/{overview.totalSessions} buổi)
          </span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            Đầy đủ
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#f0f0f0]">
          <span>Vắng phép: <strong className="text-slate-700">{overview.excusedAbsences}</strong> | K.Phép: <strong className="text-slate-700">{overview.unexcusedAbsences}</strong></span>
          <span className="text-amber-600 font-medium">Muộn: {overview.lateCount}</span>
        </div>
      </Card>

      {/* 4. Xếp hạng Học tập */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Xếp hạng Học tập
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            #{overview.classRank}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            / {overview.totalStudentsInClass} học sinh lớp
          </span>
          <Tag color="warning" className="ml-auto m-0 font-semibold">
            Top 10%
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#f0f0f0]">
          <span>Toàn khối 11:</span>
          <strong className="text-blue-600 font-bold">
            #{overview.gradeRank} / {overview.totalStudentsInGrade} Học sinh
          </strong>
        </div>
      </Card>
    </div>
  );
};
