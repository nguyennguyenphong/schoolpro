import React, { useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export interface AnnouncementSearchAndViewProps {
  /**
   * Current search query string.
   */
  searchQuery: string;

  /**
   * Current display mode (grid or list).
   */
  viewMode: "grid" | "list";

  /**
   * Callback fired when search query changes.
   */
  onSearchChange: (query: string) => void;

  /**
   * Callback fired when view mode changes.
   */
  onViewModeChange: (mode: "grid" | "list") => void;

  /**
   * Custom placeholder for search input.
   */
  placeholder?: string;
}

/**
 * Announcement search input with auto-focus paired with view mode toggle (Grid/List).
 */
export const AnnouncementSearchAndView: React.FC<AnnouncementSearchAndViewProps> = ({
  searchQuery,
  viewMode,
  onSearchChange,
  onViewModeChange,
  placeholder = "Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả...",
}) => {
  // Always auto-focus into the search input when mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("announcement-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Input Search - always auto-focused */}
      <div className="flex-1 w-full sm:w-auto">
        <Input
          id="announcement-search-input"
          autoFocus
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          prefix={<Icon name="search" size={14} className="text-slate-400" />}
          allowClear
          className="rounded-lg text-xs w-full"
        />
      </div>

      {/* View Mode Toggle: Grid vs List */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === "grid"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Icon name="chart" size={13} />
          <span>Lưới thẻ</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === "list"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Icon name="menu" size={13} />
          <span>Danh sách</span>
        </button>
      </div>
    </div>
  );
};
