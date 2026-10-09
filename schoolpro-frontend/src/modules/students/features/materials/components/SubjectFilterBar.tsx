import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectFilter, MaterialViewMode } from "@/modules/students/features/materials/types";

interface SubjectFilterBarProps {
  filter: SubjectFilter;
  totalSubjects?: number;
  onSearchChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSortByChange: (value: SubjectFilter["sortBy"]) => void;
  onViewModeChange?: (mode: MaterialViewMode) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SubjectFilterBar: React.FC<SubjectFilterBarProps> = ({
  filter,
  totalSubjects,
  onSearchChange,
  onSemesterChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { searchQuery, semester, sortBy, viewMode = "grid" } = filter;

  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("subject-search-input");
      input?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const semesterOptions = [
    { value: "all", label: "Tất cả học kỳ" },
    { value: "Học kỳ 1", label: "Học kỳ 1" },
    { value: "Học kỳ 2", label: "Học kỳ 2" },
  ];

  const sortOptions = [
    { value: "name_asc", label: "Tên môn học (A - Z)" },
    { value: "most_materials", label: "Nhiều tài liệu nhất" },
    { value: "most_downloads", label: "Lượt tải nhiều nhất" },
  ];

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Search Input & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            id="subject-search-input"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm môn học, giáo viên phụ trách, chuyên đề..."
            prefix={<Icon name="search" size={14} className="text-slate-400" />}
            allowClear
            className="rounded-lg text-xs w-full"
          />
        </div>

        {/* View Mode Toggle: Grid vs List */}
        {onViewModeChange && (
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
        )}
      </div>

      {/* 2. Dropdown Filters */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Học kỳ:</span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-44 sm:w-52"
            />
          </div>

          {totalSubjects !== undefined && (
            <span className="text-xs text-slate-400 font-medium hidden md:inline-block">
              Tổng số {totalSubjects} môn học
            </span>
          )}
        </div>

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
