import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectFilter } from "@/modules/students/features/materials/types";

interface SubjectFilterBarProps {
  filter: SubjectFilter;
  onSearchChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSortByChange: (value: SubjectFilter["sortBy"]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SubjectFilterBar: React.FC<SubjectFilterBarProps> = ({
  filter,
  onSearchChange,
  onSemesterChange,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { searchQuery, semester, sortBy } = filter;

  useEffect(() => {
    const input = document.getElementById("subject-search-input");
    if (input) {
      input.focus();
    }
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
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Input
            id="subject-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm môn học, giáo viên phụ trách, chuyên đề..."
            prefix={<Icon name="search" size={16} className="text-slate-400" />}
            className="w-full"
            allowClear
          />
        </div>
      </div>

      {/* Dropdown Filters (BỎ field Định dạng) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0 mr-1">
            <Icon name="filter" size={13} className="text-blue-600" />
            <span>Bộ lọc:</span>
          </div>

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
