import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { AnnouncementSummary } from "@/modules/students/features/announcements/types";

interface AnnouncementSummaryCardsProps {
  summary: AnnouncementSummary;
  onFilterUnread?: () => void;
  onFilterUrgent?: () => void;
  onFilterAcademic?: () => void;
}

export const AnnouncementSummaryCards: React.FC<AnnouncementSummaryCardsProps> = ({
  summary,
  onFilterUnread,
  onFilterUrgent,
  onFilterAcademic,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số thông báo */}
      <Card className="border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-all h-full [&>.ant-card-body]:p-4 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng thông báo</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Icon name="file" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 leading-tight">
              {summary.total}
            </span>
            <span className="text-xs text-slate-500 font-normal">bản tin</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tin tức từ toàn trường & GVCN</span>
        </div>
      </Card>

      {/* 2. Thông báo chưa đọc */}
      <Card
        onClick={onFilterUnread}
        className="border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all cursor-pointer h-full [&>.ant-card-body]:p-4 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Bản tin chưa đọc</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Icon name="clock" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600 leading-tight">
              {summary.unreadCount}
            </span>
            <span className="text-xs text-slate-500 font-normal">cần xem</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-amber-700 font-medium">Nhấn để lọc tin chưa đọc</span>
          <Icon name="arrow-right" size={12} className="text-amber-500" />
        </div>
      </Card>

      {/* 3. Khẩn & Quan trọng */}
      <Card
        onClick={onFilterUrgent}
        className="border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs hover:border-rose-300 transition-all cursor-pointer h-full [&>.ant-card-body]:p-4 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Khẩn & Quan trọng</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <Icon name="info" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-600 leading-tight">
              {summary.urgentCount}
            </span>
            <span className="text-xs text-slate-500 font-normal">thông báo ưu tiên</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-rose-700 font-medium">Quy chế thi, lịch học khẩn</span>
          <Icon name="arrow-right" size={12} className="text-rose-500" />
        </div>
      </Card>

      {/* 4. Khảo thí & Học vụ */}
      <Card
        onClick={onFilterAcademic}
        className="border border-slate-200 bg-white rounded-xl shadow-2xs hover:shadow-xs hover:border-violet-300 transition-all cursor-pointer h-full [&>.ant-card-body]:p-4 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Khảo thí & Đào tạo</span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shrink-0">
              <Icon name="book" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-violet-600 leading-tight">
              {summary.examCount + summary.academicCount}
            </span>
            <span className="text-xs text-slate-500 font-normal">thông báo học vụ</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-violet-700 font-medium">{summary.examCount} thi cử • {summary.academicCount} học tập</span>
        </div>
      </Card>
    </div>
  );
};
