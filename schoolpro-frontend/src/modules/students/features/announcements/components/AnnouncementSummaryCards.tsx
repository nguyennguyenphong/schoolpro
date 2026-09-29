import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AnnouncementSummary } from "@/modules/students/features/announcements/types";

interface AnnouncementSummaryCardsProps {
  summary: AnnouncementSummary;
}

export const AnnouncementSummaryCards: React.FC<AnnouncementSummaryCardsProps> = ({ summary }) => {
  const readCount = Math.max(0, summary.total - summary.unreadCount);
  const readPercentage = summary.total > 0 ? Math.round((readCount / summary.total) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số thông báo */}
      <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng số thông báo
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="file" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.total}
          </span>
          <span className="text-xs text-slate-400 font-semibold">bản tin</span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            Học kỳ II
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Phạm vi: <strong className="text-slate-700">Toàn trường & Lớp</strong></span>
          <span className="text-blue-600 font-medium">Đã cập nhật</span>
        </div>
      </Card>

      {/* 2. Bản tin chưa đọc */}
      <Card className="rounded-xl shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bản tin chưa đọc
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.unreadCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">tin mới</span>
          <Tag
            color={summary.unreadCount > 0 ? "warning" : "success"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.unreadCount > 0 ? "Cần xem" : "Đã đọc hết"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Tiến độ đã đọc: <strong className="text-slate-700">{readPercentage}%</strong></span>
          <span className="text-amber-600 font-medium">{readCount}/{summary.total} tin</span>
        </div>
      </Card>

      {/* 3. Khẩn cấp & Ưu tiên */}
      <Card className="rounded-xl shadow-2xs hover:border-rose-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Khẩn & Quan trọng
          </span>
          <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Icon name="warning" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {summary.urgentCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">thông báo</span>
          <Tag color="error" className="ml-auto m-0 font-semibold">
            Ưu tiên cao
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Trọng tâm: <strong className="text-slate-700">Lịch thi, học vụ</strong></span>
          <span className="text-rose-600 font-semibold">Xem ngay</span>
        </div>
      </Card>

      {/* 4. Khảo thí & Học vụ */}
      <Card className="rounded-xl shadow-2xs hover:border-purple-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Khảo thí & Học vụ
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="book" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.examCount + summary.academicCount}
          </span>
          <span className="text-xs text-slate-400 font-semibold">văn bản</span>
          <Tag color="purple" className="ml-auto m-0 font-semibold">
            Chính khóa
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Lịch thi: <strong className="text-slate-700">{summary.examCount}</strong></span>
          <span>Học vụ: <strong className="text-slate-700">{summary.academicCount}</strong></span>
        </div>
      </Card>
    </div>
  );
};
