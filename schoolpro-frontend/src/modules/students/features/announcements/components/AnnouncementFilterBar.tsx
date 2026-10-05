import React, { useEffect, useMemo } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  AnnouncementFilter,
  AnnouncementCategory,
  AnnouncementCategoryOption,
  AnnouncementPriority,
  AnnouncementSortOption,
  AnnouncementSummary,
} from "@/modules/students/features/announcements/types";
import { SelectDepartment } from "@/components/departments/SelectDepartment";

interface AnnouncementFilterBarProps {
  filter: AnnouncementFilter;
  summary?: AnnouncementSummary | null;
  departments: string[];
  categories?: AnnouncementCategoryOption[];
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
  summary,
  departments: _departments,
  categories,
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
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("announcement-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const readCount = Math.max(0, (summary?.total ?? 0) - (summary?.unreadCount ?? 0));

  const tabs: Array<{
    key: "all" | "unread" | "read";
    label: string;
    icon: "file" | "clock" | "checkCircle";
    count?: number;
  }> = [
    {
      key: "all",
      label: "Tất cả thông báo",
      icon: "file",
      count: summary?.total ?? 0,
    },
    {
      key: "unread",
      label: "Chưa đọc",
      icon: "clock",
      count: summary?.unreadCount ?? 0,
    },
    {
      key: "read",
      label: "Đã đọc",
      icon: "checkCircle",
      count: readCount,
    },
  ];

  const categoryOptions = useMemo(() => {
    const allOption: { label: string; value: AnnouncementCategory } = {
      label: "Tất cả chuyên mục",
      value: "all",
    };

    if (categories && categories.length > 0) {
      const dynamicList = categories.map((c) => ({
        label: c.count !== undefined && c.count > 0 ? `${c.label} (${c.count})` : c.label,
        value: c.value as AnnouncementCategory,
      }));
      return [allOption, ...dynamicList];
    }

    return [
      allOption,
      { label: "Khảo thí & Lịch thi", value: "exam" },
      { label: "Đào tạo & Học vụ", value: "academic" },
      { label: "Học phí & Khoản thu", value: "tuition" },
      { label: "Đoàn trường & Ngoại khóa", value: "activity" },
      { label: "Lớp & GVCN", value: "homeroom" },
      { label: "Thông báo chung", value: "general" },
    ];
  }, [categories]);

  const sortOptions: { label: string; value: AnnouncementSortOption }[] = [
    { label: "Mới nhất trước", value: "newest" },
    { label: "Cũ nhất trước", value: "oldest" },
    { label: "Xem nhiều nhất", value: "views" },
    { label: "Ưu tiên khẩn cấp", value: "priority" },
  ];

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* 1. Bộ lọc trạng thái ở trên (Status Filter Tabs) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = filter.readStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onReadStatusChange(tab.key)}
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
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Dưới đó là input search và chế độ xem (Search Input + View Mode Toggle) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Input Search - luôn focus */}
        <div className="flex-1 w-full sm:w-auto">
          <Input
            id="announcement-search-input"
            autoFocus
            value={filter.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm thông báo theo tiêu đề, văn bản, phòng ban, tác giả..."
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
              filter.viewMode === "grid"
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
              filter.viewMode === "list"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="menu" size={13} />
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* 3. Bên dưới là các bộ lọc dropdown (Dropdown Filters) */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chuyên mục */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Chuyên mục:</span>
            <Select
              value={filter.category}
              onChange={onCategoryChange}
              options={categoryOptions}
              className="w-44"
            />
          </div>

          {/* Đơn vị ban hành */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Đơn vị:</span>
            <SelectDepartment
              value={filter.department === "all" ? undefined : filter.department}
              onChange={(val, opt) => {
                if (!val) {
                  onDepartmentChange("all");
                  return;
                }
                const optRecord = opt as { title?: string; label?: string } | undefined;
                const deptName = optRecord?.title || optRecord?.label || String(val);
                onDepartmentChange(deptName || "all");
              }}
              placeholder="Tất cả đơn vị"
              allowClear
              className="w-40"
            />
          </div>

          {/* Mức độ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Mức độ:</span>
            <Select
              value={filter.priority}
              onChange={onPriorityChange}
              options={[
                { label: "Tất cả mức độ", value: "all" },
                { label: "Khẩn cấp", value: "urgent" },
                { label: "Quan trọng", value: "high" },
                { label: "Bình thường", value: "normal" },
              ]}
              className="w-35"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={filter.sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-36"
            />
          </div>
        </div>

        {/* Reset button */}
        {(hasActiveFilters ||
          Boolean(
            filter.searchQuery.trim() ||
              filter.category !== "all" ||
              (filter.department && filter.department !== "all") ||
              filter.readStatus !== "all" ||
              filter.priority !== "all" ||
              filter.sortBy !== "newest",
          )) && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title="Đặt lại tất cả bộ lọc"
          >
            <Icon name="check" size={13} className="text-rose-500" />
            Đặt lại
          </Button>
        )}
      </div>
    </div>
  );
};
