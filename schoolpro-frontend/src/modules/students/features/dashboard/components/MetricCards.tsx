import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AcademicOverview } from "@/modules/students/features/dashboard/types";

interface MetricCardsProps {
  overview: AcademicOverview;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ overview }) => {
  const percentCredits = Math.round(
    (overview.cumulativeCredits / overview.totalRequiredCredits) * 100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. GPA Tích lũy */}
      <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs hover:border-blue-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            GPA Tích lũy (Hệ 4)
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {overview.cumulativeGpa.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 4.00</span>
          <Tag color="success" className="text-[11px] font-bold ml-auto mr-0">
            {overview.academicRank}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Hệ 10: <strong className="text-slate-700">{overview.cumulativeGpaScale10}</strong></span>
          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
            +{overview.gpaChange} so với kỳ trước
          </span>
        </div>
      </Card>

      {/* 2. Tín chỉ Tích lũy */}
      <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tiến độ Tín chỉ
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {overview.cumulativeCredits}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            / {overview.totalRequiredCredits} TC
          </span>
          <Tag color="processing" className="text-[11px] font-bold ml-auto mr-0">
            {percentCredits}%
          </Tag>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentCredits}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Còn lại: <strong className="text-slate-700">{overview.totalRequiredCredits - overview.cumulativeCredits} TC</strong></span>
          <span>Chuẩn TN: 135 TC</span>
        </div>
      </Card>

      {/* 3. Điểm Rèn luyện */}
      <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs hover:border-purple-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm Rèn luyện
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="user" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {overview.conductScore}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          <Tag color="purple" className="text-[11px] font-bold ml-auto mr-0">
            {overview.conductRank}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Hoạt động SV: <strong className="text-purple-600 font-semibold">Tích cực</strong></span>
          <span>Đạt chuẩn học bổng</span>
        </div>
      </Card>

      {/* 4. Tỷ lệ Chuyên cần */}
      <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ Chuyên cần
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {overview.attendanceRate}%
          </span>
          <Tag color="success" className="text-[11px] font-bold ml-auto mr-0">
            Tốt
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Vắng không phép: <strong className="text-slate-700">0 buổi</strong></span>
          <span className="text-emerald-600 font-medium">Đạt điều kiện thi 100%</span>
        </div>
      </Card>
    </div>
  );
};
