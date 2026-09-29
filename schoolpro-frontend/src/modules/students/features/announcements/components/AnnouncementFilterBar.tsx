import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  AnnouncementFilter,
  AnnouncementCategory,
  AnnouncementPriority,
  AnnouncementSortOption,
} from "@/modules/students/features/announcements/types";

interface AnnouncementFilterBarProps {
  filter: AnnouncementFilter;
  departments: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: AnnouncementCategory) => void;
  onDepartmentChange: (dept: string) => void;
  onReadStatusChange: (status: "all" | "unread" | "read") => void;
  onPriorityChange: (priority: "all" | AnnouncementPriority) => void;
  onSortByChange: (sort: AnnouncementSortOption) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onResetFilters: () => void;
  hasActiveFilters?: boolean;
}

export const AnnouncementFilterBar: React.FC<AnnouncementFilterBarProps> = ({
  filter,
  departments,
  onSearchChange,
  onCategoryChange,
  onDepartmentChange,
  onReadStatusChange,
  onPriorityChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  // Always auto-focus into the search input when mounted
  useEffect(() => {
    const inputEl = document.getElementById("announcement-search-input");
    inputEl?.focus();
  }, []);

  const categories: { label: string; value: AnnouncementCategory; icon: string }[] = [
    { label: "Tất cả", value: "all", icon: "file" },
    { label: "Khảo thí & Lịch thi", value: "exam", icon: "calendar" },
    { label: "Đào tạo & Học vụ", value: "academic", icon: "book" },
    { label: "Học phí & Khoản thu", value: "tuition", icon: "settings" },
    { label: "Đoàn trường & Ngoại khóa", value: "activity", icon: "user" },
    { label: "Lớp & GVCN", value: "homeroom", icon: "info" },
    { label: "Thông báo chung", value: "general", icon: "file" },
  ];

  const sortOptions: { label: string; value: AnnouncementSortOption }[] = [
    { label: "Mới nhất trước", value: "newest" },
    { label: "Cũ nhất trước", value: "oldest" },
    { label: "Xem nhiều nhất", value: "views" },
    { label: "Ưu tiên khẩn cấp", value: "priority" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* 1. Category Pills: User-friendly 1-click filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = filter.category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Toolbar Controls */}
      <div className="pt-2 border-t border-slate-100/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search input with clean auto-focus */}
        <div className="relative flex-1 min-w-55">
          <Input
            id="announcement-search-input"
            autoFocus
            placeholder="Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả..."
            value={filter.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400 mr-1" />}
            allowClear
          />
        </div>

        {/* Secondary dropdown filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Đơn vị ban hành */}
          <Select
            value={filter.department}
            onChange={onDepartmentChange}
            options={[
              { label: "Tất cả đơn vị", value: "all" },
              ...departments.map((d) => ({ label: d, value: d })),
            ]}
            className="w-36 sm:w-40 text-xs"
            size="middle"
          />

          {/* Trạng thái */}
          <Select
            value={filter.readStatus}
            onChange={onReadStatusChange}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Chưa đọc", value: "unread" },
              { label: "Đã đọc", value: "read" },
            ]}
            className="w-32 text-xs"
            size="middle"
          />

          {/* Mức độ */}
          <Select
            value={filter.priority}
            onChange={onPriorityChange}
            options={[
              { label: "Tất cả mức độ", value: "all" },
              { label: "Khẩn cấp", value: "urgent" },
              { label: "Quan trọng", value: "high" },
              { label: "Bình thường", value: "normal" },
            ]}
            className="w-32 text-xs"
            size="middle"
          />

          {/* Sắp xếp */}
          <Select
            value={filter.sortBy}
            onChange={onSortByChange}
            options={sortOptions}
            className="w-36 text-xs"
            size="middle"
          />

          {/* Reset button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              title="Đặt lại tất cả bộ lọc"
            >
              <Icon name="check" size={13} className="text-rose-500" />
              Đặt lại
            </Button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter.viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ xem dạng thẻ (Grid View)"
            >
              <Icon name="calendar" size={14} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter.viewMode === "list"
                  ? "bg-white text-blue-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ xem danh sách (List View)"
            >
              <Icon name="file" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
