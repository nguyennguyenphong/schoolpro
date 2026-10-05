import React from "react";
import { Icon } from "@/components/ui/Icon";

export interface AnnouncementStatusTabsProps {
  /**
   * Currently active read status filter.
   */
  readStatus: "all" | "unread" | "read";

  /**
   * Total number of announcements.
   */
  totalCount?: number;

  /**
   * Number of unread announcements.
   */
  unreadCount?: number;

  /**
   * Callback fired when status tab is selected.
   */
  onStatusChange: (status: "all" | "unread" | "read") => void;
}

/**
 * Status filter tabs (All, Unread, Read) with badge counters and icons.
 */
export const AnnouncementStatusTabs: React.FC<AnnouncementStatusTabsProps> = ({
  readStatus,
  totalCount = 0,
  unreadCount = 0,
  onStatusChange,
}) => {
  const readCount = Math.max(0, totalCount - unreadCount);

  const tabs: Array<{
    key: "all" | "unread" | "read";
    label: string;
    icon: "file" | "clock" | "checkCircle";
    count: number;
  }> = [
    {
      key: "all",
      label: "Tất cả thông báo",
      icon: "file",
      count: totalCount,
    },
    {
      key: "unread",
      label: "Chưa đọc",
      icon: "clock",
      count: unreadCount,
    },
    {
      key: "read",
      label: "Đã đọc",
      icon: "checkCircle",
      count: readCount,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const isActive = readStatus === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon
              name={tab.icon}
              size={14}
              className={isActive ? "text-white shrink-0" : "text-slate-400 shrink-0"}
            />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
