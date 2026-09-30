import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type {
  ContactBookSummary,
  ContactBookTab,
} from "@/modules/students/features/contact-book/types";

interface ContactBookSummaryCardsProps {
  summary: ContactBookSummary;
  activeTab?: ContactBookTab;
  onSelectTab?: (tab: ContactBookTab) => void;
}

export const ContactBookSummaryCards: React.FC<ContactBookSummaryCardsProps> = ({
  summary,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Điểm trung bình & Xếp loại */}
      <Card
        onClick={() => onSelectTab?.("subjects")}
        className={`rounded-xl shadow-2xs transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 ${
          onSelectTab ? "cursor-pointer" : ""
        } ${
          activeTab === "subjects"
            ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
            : "hover:border-blue-400"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm trung bình (GPA)
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="chart" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {summary.currentGpa.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 10</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            Hạng {summary.ranking}/{summary.totalStudents}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Học lực: <strong className="text-slate-700">Giỏi xuất sắc</strong></span>
          <span className="text-blue-600 font-medium">8 môn đánh giá</span>
        </div>
      </Card>

      {/* 2. Rèn luyện & Hạnh kiểm */}
      <Card
        onClick={() => onSelectTab?.("weekly")}
        className={`rounded-xl shadow-2xs transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 ${
          onSelectTab ? "cursor-pointer" : ""
        } ${
          activeTab === "weekly"
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
            : "hover:border-emerald-400"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Hạnh kiểm & Rèn luyện
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.conduct}
          </span>
          <span className="text-xs text-slate-400 font-semibold">nề nếp</span>
          <Tag color="success" className="ml-auto m-0 font-semibold">
            {summary.disciplineScore} điểm
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Xếp loại: <strong className="text-slate-700">Tổ 1 xuất sắc</strong></span>
          <span className="text-emerald-600 font-medium">Đạt tiêu chuẩn</span>
        </div>
      </Card>

      {/* 3. Chuyên cần học kỳ */}
      <Card
        onClick={() => onSelectTab?.("weekly")}
        className="rounded-xl shadow-2xs transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 hover:border-amber-400"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chuyên cần học kỳ
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.attendanceRate}%
          </span>
          <span className="text-xs text-slate-400 font-semibold">có mặt</span>
          <Tag color="warning" className="ml-auto m-0 font-semibold">
            Vắng: {summary.excusedAbsence} buổi
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Không phép: <strong className="text-slate-700">{summary.unexcusedAbsence}</strong></span>
          <span className="text-slate-500 font-medium">Đi muộn: {summary.lateCount}</span>
        </div>
      </Card>

      {/* 4. Giáo viên chủ nhiệm & Phụ huynh */}
      <Card
        onClick={() => onSelectTab?.("feedback")}
        className={`rounded-xl shadow-2xs transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 ${
          onSelectTab ? "cursor-pointer" : ""
        } ${
          activeTab === "feedback"
            ? "border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
            : "hover:border-purple-400"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            GVCN & Phụ huynh
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="user" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {summary.homeroomTeacher.name}
          </span>
          <Tag color="purple" className="ml-auto m-0 font-semibold shrink-0">
            Đã ký sổ
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="truncate">SĐT: <strong className="text-slate-700">{summary.homeroomTeacher.phone}</strong></span>
          <span className="text-purple-600 font-medium shrink-0">
            {summary.parentFeedbackCount} trao đổi
          </span>
        </div>
      </Card>
    </div>
  );
};
