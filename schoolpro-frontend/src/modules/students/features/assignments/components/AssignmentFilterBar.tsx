import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentViewMode } from "@/modules/students/features/assignments/types";

interface AssignmentFilterBarProps {
  subject: string;
  status: string;
  type: string;
  searchQuery: string;
  viewMode: AssignmentViewMode;
  hasActiveFilters?: boolean;
  onSubjectChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onViewModeChange: (mode: AssignmentViewMode) => void;
  onResetFilters: () => void;
}

export const AssignmentFilterBar: React.FC<AssignmentFilterBarProps> = ({
  subject,
  status,
  type,
  searchQuery,
  viewMode,
  hasActiveFilters = false,
  onSubjectChange,
  onStatusChange,
  onTypeChange,
  onSearchChange,
  onViewModeChange,
  onResetFilters,
}) => {
  useEffect(() => {
    // Auto focus search input on mount as requested
    const inputEl = document.getElementById("assignment-search-input");
    inputEl?.focus();
  }, []);

  const subjectOptions = [
    { label: "Tất cả môn học", value: "all" },
    { label: "Toán học", value: "MATH11" },
    { label: "Vật lý", value: "PHYS11" },
    { label: "Hóa học", value: "CHEM11" },
    { label: "Sinh học", value: "BIO11" },
    { label: "Tin học", value: "IT11" },
    { label: "Ngữ văn", value: "LIT11" },
    { label: "Lịch sử", value: "HIST11" },
    { label: "Địa lý", value: "GEO11" },
    { label: "Tiếng Anh", value: "ENG11" },
    { label: "GDKT & Pháp luật", value: "LAW11" },
  ];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "all" },
    { label: "Chưa hoàn thành", value: "pending" },
    { label: "Đã nộp (Chờ chấm)", value: "submitted" },
    { label: "Đã chấm điểm", value: "graded" },
    { label: "Đã quá hạn", value: "overdue" },
  ];

  const typeOptions = [
    { label: "Tất cả hình thức", value: "all" },
    { label: "Bài tập về nhà", value: "homework" },
    { label: "Trắc nghiệm online", value: "quiz" },
    { label: "Báo cáo / Dự án", value: "project" },
    { label: "Bài viết / Tự luận", value: "essay" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="assignment-search-input"
            autoFocus
            placeholder="Tìm kiếm bài tập theo tên, môn học, giáo viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            className="w-full"
          />
        </div>

        {/* View Mode Toggle: Grid vs List */}
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

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Môn học */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Môn học:</span>
            <Select
              value={subject}
              onChange={onSubjectChange}
              options={subjectOptions}
              className="w-36 sm:w-40"
            />
          </div>

          {/* 2. Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Trạng thái:</span>
            <Select
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
              className="w-36 sm:w-40"
            />
          </div>

          {/* 3. Hình thức bài tập */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Hình thức:</span>
            <Select
              value={type}
              onChange={onTypeChange}
              options={typeOptions}
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
