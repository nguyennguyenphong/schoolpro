import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  GradeFilter,
  GradeViewMode,
  GradeClassification,
} from "@/modules/students/features/gradebook/types";

interface GradeFilterBarProps {
  filter: GradeFilter;
  hasActiveFilters?: boolean;
  onSearchChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onClassificationChange: (value: GradeClassification) => void;
  onSortByChange: (value: GradeFilter["sortBy"]) => void;
  onViewModeChange: (mode: GradeViewMode) => void;
  onResetFilters: () => void;
}

export const GradeFilterBar: React.FC<GradeFilterBarProps> = ({
  filter,
  hasActiveFilters = false,
  onSearchChange,
  onAcademicYearChange,
  onSemesterChange,
  onClassificationChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const { searchQuery, academicYear, semester, classification, sortBy, viewMode } = filter;

  useEffect(() => {
    const inputEl = document.getElementById("grade-search-input");
    inputEl?.focus();
  }, []);

  const academicYearOptions = [
    { label: "Năm học 2025-2026", value: "2025-2026" },
    { label: "Năm học 2024-2025", value: "2024-2025" },
    { label: "Năm học 2023-2024", value: "2023-2024" },
  ];

  const semesterOptions = [
    { label: "Học kỳ 1", value: "HK1" },
    { label: "Học kỳ 2", value: "HK2" },
    { label: "Cả năm học", value: "all" },
  ];

  const classificationOptions = [
    { label: "Tất cả môn học", value: "all" },
    { label: "Môn Giỏi (ĐTB ≥ 8.0)", value: "excellent" },
    { label: "Môn Khá (6.5 - 7.9)", value: "good" },
    { label: "Môn Trung bình (< 6.5)", value: "average" },
    { label: "Môn Đánh giá nhận xét", value: "feedback_only" },
  ];

  const sortOptions = [
    { label: "ĐTB cao nhất trước", value: "gpa_desc" },
    { label: "ĐTB thấp nhất trước", value: "gpa_asc" },
    { label: "Tên môn học (A - Z)", value: "name_asc" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle (Identical to AssignmentFilterBar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="grade-search-input"
            autoFocus
            placeholder="Tìm kiếm môn học, giáo viên phụ trách, nhận xét..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            className="w-full"
          />
        </div>

        {/* View Mode Toggle: Bảng điểm vs Lưới thẻ */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="menu" size={13} />
            <span>Bảng điểm</span>
          </button>
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
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns (NO 'Bộ lọc' text, identical to AssignmentFilterBar) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Năm học */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Năm học:</span>
            <Select
              value={academicYear}
              onChange={onAcademicYearChange}
              options={academicYearOptions}
              className="w-40 sm:w-44"
            />
          </div>

          {/* 2. Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Học kỳ:</span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-32 sm:w-36"
            />
          </div>

          {/* 3. Xếp loại */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Xếp loại:</span>
            <Select
              value={classification}
              onChange={(val: string) => onClassificationChange(val as GradeClassification)}
              options={classificationOptions}
              className="w-44 sm:w-48"
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
