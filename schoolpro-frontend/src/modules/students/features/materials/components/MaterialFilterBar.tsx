import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  MaterialFilter,
  MaterialViewMode,
  MaterialCategory,
} from "@/modules/students/features/materials/types";

interface MaterialFilterBarProps {
  filter: MaterialFilter;
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
    const inputEl = document.getElementById("material-search-input");
    inputEl?.focus();
  }, []);

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
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle (Identical to AssignmentFilterBar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="material-search-input"
            autoFocus
            placeholder="Tìm kiếm tài liệu theo tên, chuyên đề, giáo viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            className="w-full"
          />
        </div>

        {/* View Mode Toggle: Grid vs List with 'Lưới thẻ' and 'Danh sách' */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
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

      {/* Bottom row: Filter Dropdowns (NO 'Bộ lọc' text, identical to AssignmentFilterBar) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Môn học */}
          {onSubjectChange && subjects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Môn học:</span>
              <Select
                value={subject}
                onChange={onSubjectChange}
                options={subjectOptions}
                className="w-36 sm:w-40"
              />
            </div>
          )}

          {/* 2. Danh mục */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Danh mục:</span>
            <Select
              value={category}
              onChange={(val: string) => onCategoryChange(val as MaterialCategory)}
              options={categoryOptions}
              className="w-36 sm:w-40"
            />
          </div>

          {/* 3. Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Học kỳ:</span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-32 sm:w-36"
            />
          </div>

          {/* 4. Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-36 sm:w-40"
            />
          </div>
        </div>

        {/* Reset filter button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="text-slate-600 hover:text-blue-600"
          >
            <Icon name="refresh" size={12} className="mr-1" />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};
