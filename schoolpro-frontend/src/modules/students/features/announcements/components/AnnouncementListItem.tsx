import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "@/components/ui/Checkbox";
import type {
  AnnouncementItem,
  AnnouncementCategory,
  AnnouncementPriority,
} from "@/modules/students/features/announcements/types";

interface AnnouncementListItemProps {
  item: AnnouncementItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick: (item: AnnouncementItem) => void;
}

export const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({
  item,
  isSelected = false,
  onToggleSelect,
  onClick,
}) => {
  const { t } = useTranslation(["button", "input", "card"]);

  const getCategoryConfig = (
    cat: AnnouncementCategory,
  ): { label: string; color: string } => {
    const normalized = (cat || "").toLowerCase();
    switch (normalized) {
      case "exam":
        return {
          label: t("input:categories.exam"),
          color: "red",
        };
      case "academic":
        return {
          label: t("input:categories.academic"),
          color: "blue",
        };
      case "tuition":
      case "fees":
        return {
          label: t("input:categories.tuition"),
          color: "green",
        };
      case "activity":
      case "events":
        return {
          label: t("input:categories.activity"),
          color: "purple",
        };
      case "emulation":
        return {
          label: t("input:categories.emulation"),
          color: "orange",
        };
      case "homeroom":
        return {
          label: t("input:categories.homeroom"),
          color: "cyan",
        };
      default:
        return {
          label: cat || t("input:categories.general"),
          color: "default",
        };
    }
  };

  const getPriorityConfig = (
    priority: AnnouncementPriority,
    isPinned: boolean,
  ): { label: string; color: string } | null => {
    if (isPinned) {
      return {
        label: t("card:priority.pinned"),
        color: "gold",
      };
    }
    if (priority === "urgent") {
      return {
        label: t("card:priority.urgent"),
        color: "red",
      };
    }
    if (priority === "high") {
      return {
        label: t("card:priority.high"),
        color: "orange",
      };
    }
    return null;
  };

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
      className={`rounded-xl shadow-2xs transition-all cursor-pointer w-full ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
          : !item.isRead
          ? "border-l-4 border-l-blue-600 hover:border-blue-300"
          : "hover:border-blue-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          {onToggleSelect && !item.isRead && (
            <div onClick={handleCheckboxClick} className="pt-1 shrink-0 flex items-center">
              <Checkbox
                checked={isSelected}
                onChange={handleCheckboxChange}
              />
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Header row: Tags + Unread */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
              )}
              <Tag
                color={categoryConfig.color}
                className="m-0 font-medium"
              >
                {categoryConfig.label}
              </Tag>
              {priorityConfig && (
                <Tag
                  color={priorityConfig.color}
                  className="m-0 font-semibold"
                >
                  {priorityConfig.label}
                </Tag>
              )}
              <span className="text-xs text-slate-400">| {item.publishDate}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-0 line-clamp-1">
              {item.title}
            </h3>

            {/* Summary */}
            <p className="text-xs text-slate-500 mb-0 line-clamp-1 leading-normal font-normal">
              {item.summary}
            </p>

            {/* Department & Author */}
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
              <span className="text-slate-600 font-medium">{item.department}</span>
              <span>|</span>
              <span>{item.author}</span>
              <span>|</span>
              <span>
                {t("card:meta.views", {
                  count: item.viewsCount,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right action area */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f0f0]">
          {item.attachments && item.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
              <Icon name="download" size={12} />
              <span>
                {t("card:meta.attachmentsBadge", {
                  count: item.attachments.length,
                })}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
          >
            <span>{t("button:viewDetail")}</span>
            <Icon name="arrow-right" size={13} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
