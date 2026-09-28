import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "@/components/ui/Checkbox";
import type {
  AnnouncementItem,
  AnnouncementCategory,
  AnnouncementPriority,
} from "@/modules/students/features/announcements/types";

interface AnnouncementCardProps {
  item: AnnouncementItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick: (item: AnnouncementItem) => void;
}

const getCategoryConfig = (
  cat: AnnouncementCategory,
): { label: string; color: string; bgClass: string; textClass: string } => {
  switch (cat) {
    case "exam":
      return {
        label: "Khảo thí & Lịch thi",
        color: "red",
        bgClass: "bg-rose-50 border-rose-200",
        textClass: "text-rose-600",
      };
    case "academic":
      return {
        label: "Đào tạo & Học vụ",
        color: "blue",
        bgClass: "bg-blue-50 border-blue-200",
        textClass: "text-blue-600",
      };
    case "tuition":
      return {
        label: "Học phí & Khoản thu",
        color: "green",
        bgClass: "bg-emerald-50 border-emerald-200",
        textClass: "text-emerald-600",
      };
    case "activity":
      return {
        label: "Đoàn trường & Ngoại khóa",
        color: "purple",
        bgClass: "bg-purple-50 border-purple-200",
        textClass: "text-purple-600",
      };
    case "homeroom":
      return {
        label: "Lớp & GVCN",
        color: "cyan",
        bgClass: "bg-cyan-50 border-cyan-200",
        textClass: "text-cyan-600",
      };
    default:
      return {
        label: "Thông báo chung",
        color: "default",
        bgClass: "bg-slate-50 border-slate-200",
        textClass: "text-slate-600",
      };
  }
};

const getPriorityConfig = (
  priority: AnnouncementPriority,
  isPinned: boolean,
): { label: string; color: string } | null => {
  if (isPinned) {
    return { label: "Ghim đầu trang", color: "gold" };
  }
  if (priority === "urgent") {
    return { label: "Khẩn cấp", color: "red" };
  }
  if (priority === "high") {
    return { label: "Quan trọng", color: "orange" };
  }
  return null;
};

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  item,
  isSelected = false,
  onToggleSelect,
  onClick,
}) => {
  const categoryConfig = getCategoryConfig(item.category);
  const priorityConfig = getPriorityConfig(item.priority, item.isPinned);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCheckboxChange = (e: any) => {
    e.stopPropagation?.();
    onToggleSelect?.(item.id);
  };

  return (
    <div className="h-full">
      <Card
        onClick={() => onClick(item)}
        className={`h-full border rounded-xl shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group bg-white relative overflow-hidden flex flex-col justify-between [&>.ant-card-body]:p-5 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
            : !item.isRead
            ? "border-l-4 border-l-blue-600 border-slate-200 hover:border-blue-300"
            : "border-slate-200 hover:border-blue-300"
        }`}
      >
        <div>
          {/* 1. Header row: Checkbox + Category Tag + Priority Tag + Unread Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {onToggleSelect && (
                <div onClick={handleCheckboxClick} className="shrink-0 flex items-center">
                  <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox mr-0"
                  />
                </div>
              )}

              <Tag
                color={categoryConfig.color}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md border mr-0 shrink-0"
              >
                {categoryConfig.label}
              </Tag>

              {priorityConfig && (
                <Tag
                  color={priorityConfig.color}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md border mr-0 shrink-0"
                >
                  {priorityConfig.label}
                </Tag>
              )}
            </div>

            {!item.isRead && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Mới
              </span>
            )}
          </div>

          {/* 2. Title: Exactly 2 lines (h-12 leading-6) for equal height */}
          <h3
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 h-12 leading-6"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* 3. Summary: Exactly 2 lines (h-10 leading-5) for equal height */}
          <p
            className="text-xs text-slate-500 mb-0 leading-5 line-clamp-2 h-10 font-normal"
            title={item.summary}
          >
            {item.summary}
          </p>
        </div>

        {/* 4. Footer row: Department, Date, Attachments */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon name="user" size={13} className="text-slate-400 shrink-0" />
              <span className="truncate text-slate-600 font-medium" title={item.department}>
                {item.department}
              </span>
            </div>

            {item.attachments && item.attachments.length > 0 && (
              <div
                className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0 font-medium"
                title={`${item.attachments.length} tệp đính kèm`}
              >
                <Icon name="download" size={11} />
                <span>{item.attachments.length} tệp</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Icon name="clock" size={12} />
              <span>{item.publishDate}</span>
            </div>
            <span>{item.viewsCount} lượt xem</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
