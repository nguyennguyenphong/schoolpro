import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  MaterialFilter,
  MaterialViewMode,
  MaterialCategory,
  MaterialSummary,
} from "@/modules/students/features/materials/types";

interface MaterialFilterBarProps {
  filter: MaterialFilter;
  summary?: MaterialSummary | null;
  subjects?: { code: string; name: string }[];
  onSearchChange: (value: string) => void;
  onSubjectChange?: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSortByChange: (value: MaterialFilter["sortBy"]) => void;
  onViewModeChange: (mode: MaterialViewMode) => void;
  onResetFilters: () => void;
  hasActiveFilters?: boolean;
}

export const MaterialFilterBar: React.FC<MaterialFilterBarProps> = ({
  filter,
  summary,
  subjects = [],
  onSearchChange,
  onSubjectChange,
  onCategoryChange,
  onSemesterChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const { searchQuery, subject, category, semester, sortBy, viewMode } = filter;

  useEffect(() => {
    // Auto focus search input on mount
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("material-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tabs: Array<{
    key: MaterialCategory | "all";
    label: string;
    icon: "file" | "presentation" | "book" | "fileText";
    count?: number;
  }> = [
    {
      key: "all",
      label: "Tất cả danh mục",
      icon: "file",
      count: summary?.total,
    },
    {
      key: "lecture",
      label: "Bài giảng & Slide",
      icon: "presentation",
      count: summary?.lecturesCount,
    },
    {
      key: "outline",
      label: "Đề cương ôn tập",
      icon: "book",
      count: summary?.outlinesCount,
    },
    {
      key: "exam_prep",
      label: "Đề thi & Đáp án",
      icon: "fileText",
      count: summary?.examPrepsCount,
    },
    {
      key: "textbook",
      label: "Sách giáo khoa",
      icon: "book",
      count: summary?.textbooksCount,
    },
  ];

  const subjectOptions = [
    { label: "Tất cả môn học", value: "all" },
    ...subjects.map((s) => ({ label: s.name, value: s.code })),
  ];

  const categoryOptions = [
    { label: "Tất cả danh mục", value: "all" },
    { label: "Bài giảng điện tử", value: "lecture" },
    { label: "Đề cương ôn tập", value: "outline" },
    { label: "Sách giáo khoa", value: "textbook" },
    { label: "Đề thi & Đáp án", value: "exam_prep" },
    { label: "Tài liệu tham khảo", value: "reference" },
  ];

  const semesterOptions = [
    { label: "Tất cả học kỳ", value: "all" },
    { label: "Học kỳ 1", value: "HK1" },
    { label: "Học kỳ 2", value: "HK2" },
  ];

  const sortOptions = [
    { label: "Mới nhất trước", value: "newest" },
    { label: "Tải nhiều nhất", value: "most_downloaded" },
    { label: "Tên tài liệu (A-Z)", value: "title_asc" },
    { label: "Dung lượng nhỏ nhất", value: "size_asc" },
  ];

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Bộ lọc trạng thái / danh mục ở trên (Status Filter Tabs) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = category === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onCategoryChange(tab.key)}
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
                      : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
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
            id="material-search-input"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm tài liệu theo tên, chuyên đề, giáo viên..."
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

      {/* 3. Bên dưới là các bộ lọc dropdown (Dropdown Filters) */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Môn học */}
          {onSubjectChange && subjects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Môn học:</span>
              <Select
                value={subject}
                onChange={onSubjectChange}
                options={subjectOptions}
                className="w-40 sm:w-44"
              />
            </div>
          )}

          {/* Danh mục chi tiết */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Danh mục:</span>
            <Select
              value={category}
              onChange={(val: string) => onCategoryChange(val as MaterialCategory)}
              options={categoryOptions}
              className="w-40 sm:w-44"
            />
          </div>

          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Học kỳ:</span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-32 sm:w-36"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-38 sm:w-42"
            />
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title="Đặt lại tất cả bộ lọc"
          >
            <Icon name="check" size={13} className="text-rose-500" />
            <span>Đặt lại</span>
          </Button>
        )}
      </div>
    </div>
  );
};
