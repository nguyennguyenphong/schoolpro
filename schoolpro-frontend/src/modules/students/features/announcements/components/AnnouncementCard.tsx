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
): { label: string; color: string } => {
  switch (cat) {
    case "exam":
      return { label: "Khảo thí & Lịch thi", color: "red" };
    case "academic":
      return { label: "Đào tạo & Học vụ", color: "blue" };
    case "tuition":
      return { label: "Học phí & Khoản thu", color: "green" };
    case "activity":
      return { label: "Đoàn & Ngoại khóa", color: "purple" };
    case "homeroom":
      return { label: "Lớp & GVCN", color: "cyan" };
    default:
      return { label: "Thông báo chung", color: "default" };
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
    <Card
      onClick={() => onClick(item)}
      className={`h-full rounded-xl shadow-2xs transition-all cursor-pointer [&>.ant-card-body]:p-4 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
          : !item.isRead
          ? "border-l-[3.5px] border-l-blue-600 hover:border-blue-300"
          : "hover:border-blue-300"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {onToggleSelect && (
              <div onClick={handleCheckboxClick} className="shrink-0 flex items-center">
                <Checkbox
                  checked={isSelected}
                  onChange={handleCheckboxChange}
                />
              </div>
            )}

            <Tag
              color={categoryConfig.color}
              className="m-0 shrink-0 font-medium"
            >
              {categoryConfig.label}
            </Tag>

            {priorityConfig && (
              <Tag
                color={priorityConfig.color}
                className="m-0 shrink-0 font-semibold"
              >
                {priorityConfig.label}
              </Tag>
            )}
          </div>

            {!item.isRead && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Mới
              </span>
            )}
          </div>

          <h3
            className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2 h-12 leading-6"
            title={item.title}
          >
            {item.title}
          </h3>

          <p
            className="text-xs text-slate-500 mb-0 leading-5 line-clamp-2 h-10 font-normal"
            title={item.summary}
          >
            {item.summary}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon name="user" size={13} className="text-slate-400 shrink-0" />
              <span className="truncate text-slate-600 font-medium text-[11px] sm:text-xs" title={item.department}>
                {item.department}
              </span>
            </div>

            {item.attachments && item.attachments.length > 0 && (
              <div
                className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0 font-medium"
                title={`${item.attachments.length} tệp đính kèm`}
              >
                <Icon name="download" size={11} />
                <span>{item.attachments.length} tệp</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Icon name="clock" size={11} />
              <span>{item.publishDate}</span>
            </div>
            <span>{item.viewsCount} lượt xem</span>
          </div>
        </div>
      </Card>
  );
};
