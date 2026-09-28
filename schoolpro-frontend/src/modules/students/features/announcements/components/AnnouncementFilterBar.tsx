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

  const categoryOptions: { label: string; value: AnnouncementCategory }[] = [
    { label: "Tất cả chuyên mục", value: "all" },
    { label: "Khảo thí & Lịch thi", value: "exam" },
    { label: "Đào tạo & Học vụ", value: "academic" },
    { label: "Học phí & Khoản thu", value: "tuition" },
    { label: "Đoàn trường & Ngoại khóa", value: "activity" },
    { label: "Lớp & Giáo viên CN", value: "homeroom" },
    { label: "Thông báo chung", value: "general" },
  ];

  const sortOptions: { label: string; value: AnnouncementSortOption }[] = [
    { label: "Mới nhất trước", value: "newest" },
    { label: "Cũ nhất trước", value: "oldest" },
    { label: "Lượt xem nhiều nhất", value: "views" },
    { label: "Mức độ ưu tiên cao", value: "priority" },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
      {/* 1. Top row: Search input (always auto-focused) + View mode toggle + Reset filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="announcement-search-input"
            autoFocus
            placeholder="Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả..."
            value={filter.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={16} className="text-slate-400" />}
            allowClear
            className="rounded-lg h-10 text-xs sm:text-sm border-slate-200 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="text-xs font-medium text-rose-600 border-rose-200 hover:border-rose-400 hover:bg-rose-50"
            >
              <Icon name="check" size={13} className="mr-1 text-rose-500" />
              Đặt lại bộ lọc
            </Button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter.viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ xem dạng thẻ (Grid View)"
            >
              <Icon name="calendar" size={14} />
              <span className="hidden sm:inline">Dạng thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter.viewMode === "list"
                  ? "bg-white text-blue-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ xem danh sách (List View)"
            >
              <Icon name="file" size={14} />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bottom row: 5 Filter dropdowns with clean borders */}
      <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Bộ lọc 1: Danh mục thông báo */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Danh mục thông báo
          </label>
          <Select
            value={filter.category}
            onChange={onCategoryChange}
            options={categoryOptions}
            className="w-full text-xs"
            size="middle"
          />
        </div>

        {/* Bộ lọc 2: Đơn vị ban hành */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Đơn vị ban hành
          </label>
          <Select
            value={filter.department}
            onChange={onDepartmentChange}
            options={[
              { label: "Tất cả đơn vị ban hành", value: "all" },
              ...departments.map((d) => ({ label: d, value: d })),
            ]}
            className="w-full text-xs"
            size="middle"
          />
        </div>

        {/* Bộ lọc 3: Trạng thái xem */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Trạng thái xem
          </label>
          <Select
            value={filter.readStatus}
            onChange={onReadStatusChange}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Chưa đọc", value: "unread" },
              { label: "Đã đọc", value: "read" },
            ]}
            className="w-full text-xs"
            size="middle"
          />
        </div>

        {/* Bộ lọc 4: Mức độ ưu tiên */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Mức độ ưu tiên
          </label>
          <Select
            value={filter.priority}
            onChange={onPriorityChange}
            options={[
              { label: "Tất cả mức độ", value: "all" },
              { label: "Khẩn cấp", value: "urgent" },
              { label: "Quan trọng", value: "high" },
              { label: "Bình thường", value: "normal" },
            ]}
            className="w-full text-xs"
            size="middle"
          />
        </div>

        {/* Bộ lọc 5: Sắp xếp */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Sắp xếp hiển thị
          </label>
          <Select
            value={filter.sortBy}
            onChange={onSortByChange}
            options={sortOptions}
            className="w-full text-xs"
            size="middle"
          />
        </div>
      </div>
    </div>
  );
};
