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
  hasActiveFilters: boolean;
}

export const MaterialFilterBar: React.FC<MaterialFilterBarProps> = ({
  filter,
  subjects,
  onSearchChange,
  onSubjectChange,
  onCategoryChange,
  onSemesterChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { searchQuery, subject, category, semester, sortBy, viewMode } = filter;

  // Auto-focus input on mount
  useEffect(() => {
    const input = document.getElementById("material-search-input");
    if (input) {
      input.focus();
    }
  }, []);

  const subjectOptions = subjects
    ? [
        { value: "all", label: "Tất cả môn học" },
        ...subjects.map((s) => ({ value: s.code, label: s.name })),
      ]
    : [];

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "lecture", label: "Bài giảng điện tử" },
    { value: "outline", label: "Đề cương ôn tập" },
    { value: "textbook", label: "Sách giáo khoa" },
    { value: "exam_prep", label: "Đề thi & Đáp án" },
    { value: "reference", label: "Tài liệu tham khảo" },
  ];

  const semesterOptions = [
    { value: "all", label: "Tất cả học kỳ" },
    { value: "HK1", label: "Học kỳ 1" },
    { value: "HK2", label: "Học kỳ 2" },
  ];

  const sortOptions = [
    { value: "newest", label: "Mới cập nhật nhất" },
    { value: "most_downloaded", label: "Tải nhiều nhất" },
    { value: "title_asc", label: "Tên tài liệu (A-Z)" },
    { value: "size_asc", label: "Dung lượng nhỏ nhất" },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
      {/* Search Input & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Input
            id="material-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm tài liệu, chuyên đề học tập, giáo viên..."
            prefix={<Icon name="search" size={16} className="text-slate-400" />}
            className="w-full"
            allowClear
          />
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1.5 self-end sm:self-center border border-slate-200 rounded-lg p-1 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Dạng lưới"
          >
            <Icon name="menu" size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Dạng danh sách"
          >
            <Icon name="filter" size={16} />
          </button>
        </div>
      </div>

      {/* Dropdown Filters (ĐÃ BỎ field Định dạng hoàn toàn) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0 mr-1">
            <Icon name="filter" size={13} className="text-blue-600" />
            <span>Bộ lọc:</span>
          </div>

          {/* 1. Môn học (nếu có truyền) */}
          {subjects && onSubjectChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Môn học:</span>
              <Select
                value={subject}
                onChange={onSubjectChange}
                options={subjectOptions}
                className="w-36 sm:w-44"
              />
            </div>
          )}

          {/* 2. Loại tài liệu (Danh mục) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Danh mục:</span>
            <Select
              value={category}
              onChange={(val: string) => onCategoryChange(val as MaterialCategory)}
              options={categoryOptions}
              className="w-40 sm:w-48"
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
              className="w-44 sm:w-48"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Icon name="refresh" size={13} className="mr-1" />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};
