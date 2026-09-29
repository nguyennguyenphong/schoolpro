import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { MaterialSummary } from "@/modules/students/features/materials/types";

interface MaterialSummaryCardsProps {
  summary: MaterialSummary;
}

export const MaterialSummaryCards: React.FC<MaterialSummaryCardsProps> = ({ summary }) => {
  const outlinesAndExams = summary.outlinesCount + summary.examPrepsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số tài liệu */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kho tài liệu học tập
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">tài liệu</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            HK1 2025-2026
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Phạm vi: <strong className="text-slate-700">Khối 11 - Lớp 11A1</strong></span>
          <span className="text-blue-600 font-medium">Bản chuẩn</span>
        </div>
      </Card>

      {/* 2. Bài giảng điện tử & Slide */}
      <Card className="rounded-xl shadow-2xs hover:border-indigo-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bài giảng & Slide điện tử
          </span>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Icon name="presentation" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
            {summary.lecturesCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">bài học</span>
          <Tag color="blue" className="ml-auto m-0 font-semibold">
            PPTX / Video
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Nguồn: <strong className="text-slate-700">Tổ Chuyên môn</strong></span>
          <span className="text-indigo-600 font-medium">Trực quan</span>
        </div>
      </Card>

      {/* 3. Đề cương & Đề thi thử */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đề cương & Đề thi thử
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {outlinesAndExams}
          </span>
          <span className="text-xs text-slate-400 font-semibold">bộ đề</span>
          <Tag color="warning" className="ml-auto m-0 font-semibold">
            Có đáp án
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Trọng tâm: <strong className="text-slate-700">Giữa kỳ & Cuối kỳ</strong></span>
          <span className="text-amber-600 font-medium">Ôn tập tốt</span>
        </div>
      </Card>

      {/* 4. Tổng lượt tải về */}
      <Card className="rounded-xl shadow-2xs hover:border-emerald-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng lượt tải tài liệu
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="download" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.totalDownloads.toLocaleString("vi-VN")}
          </span>
          <span className="text-xs text-slate-400 font-semibold">lượt tải</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            Phổ biến
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Tài nguyên: <strong className="text-slate-700">Mở miễn phí 100%</strong></span>
          <span className="text-emerald-600 font-medium">Tốc độ cao</span>
        </div>
      </Card>
    </div>
  );
};
