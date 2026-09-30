import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { ExamSummary } from "@/modules/students/features/exams/types";

interface ExamSummaryCardsProps {
  summary: ExamSummary;
}

export const ExamSummaryCards: React.FC<ExamSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số đề thi */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng số đề thi
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">bộ đề</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            Học kỳ 1
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Hình thức: <strong className="text-slate-700">Trắc nghiệm online</strong></span>
          <span className="text-blue-600 font-medium">Chính thức</span>
        </div>
      </Card>

      {/* 2. Cần thực hiện */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cần thực hiện
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">đề thi chờ</span>
          <Tag
            color={summary.pendingCount > 0 ? "warning" : "success"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.pendingCount > 0 ? "Cần hoàn thành" : "Đã xong hết"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Hạn nộp gần nhất: <strong className="text-slate-700">20/10/2026</strong></span>
          <span className="text-amber-600 font-medium">Đang mở</span>
        </div>
      </Card>

      {/* 3. Đã hoàn thành */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đã hoàn thành
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.completedCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">đã nộp</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            Đã chấm điểm
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Đánh giá kết quả: <strong className="text-slate-700">Tự động</strong></span>
          <span className="text-emerald-600 font-medium">Đã ghi nhận</span>
        </div>
      </Card>

      {/* 4. Điểm trung bình */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm trung bình
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
            {summary.averageScore > 0 ? summary.averageScore : "--"}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 10</span>
          <Tag color="purple" className="ml-auto m-0 font-semibold">
            Hệ số 10
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Xếp loại: <strong className="text-slate-700">Giỏi</strong></span>
          <span className="text-purple-600 font-medium">Học lực</span>
        </div>
      </Card>
    </div>
  );
};
