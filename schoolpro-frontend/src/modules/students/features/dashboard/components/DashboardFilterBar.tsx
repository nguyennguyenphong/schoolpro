import React from "react";
import { Select } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface DashboardFilterBarProps {
  academicYear: string;
  semester: string;
  onYearChange: (year: string) => void;
  onSemesterChange: (semester: string) => void;
  onResetFilters: () => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  academicYear,
  semester,
  onYearChange,
  onSemesterChange,
  onResetFilters,
}) => {
  const yearOptions = [
    { value: "2025-2026", label: "Năm học 2025 - 2026" },
    { value: "2024-2025", label: "Năm học 2024 - 2025" },
    { value: "2023-2024", label: "Năm học 2023 - 2024" },
  ];

  const semesterOptions = [
    { value: "hk1", label: "Học kỳ 1" },
    { value: "hk2", label: "Học kỳ 2" },
    { value: "full", label: "Cả năm học" },
  ];

  const isFiltered = academicYear !== "2025-2026" || semester !== "hk1";

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Năm học:
          </span>
          <Select
            value={academicYear}
            onChange={onYearChange}
            options={yearOptions}
            className="w-44"
            size="middle"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Kỳ học:
          </span>
          <Select
            value={semester}
            onChange={onSemesterChange}
            options={semesterOptions}
            className="w-36"
            size="middle"
          />
        </div>
      </div>

      {/* Right: Reset to default if filtered */}
      {isFiltered && (
        <Button
          variant="outline"
          size="small"
          onClick={onResetFilters}
          className="text-xs text-slate-600 hover:text-blue-600"
        >
          <Icon name="refresh" size={12} className="mr-1" />
          Về mặc định
        </Button>
      )}
    </div>
  );
};
