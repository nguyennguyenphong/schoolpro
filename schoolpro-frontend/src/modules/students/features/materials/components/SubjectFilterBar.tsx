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

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
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
        </div>

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
