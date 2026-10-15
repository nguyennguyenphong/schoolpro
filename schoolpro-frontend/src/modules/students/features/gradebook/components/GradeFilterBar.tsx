import React from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  GradeFilter,
  GradeViewMode,
  GradeClassification,
  GradeSummary,
} from "@/modules/students/features/gradebook/types";

interface GradeFilterBarProps {
  filter: GradeFilter;
  summary?: GradeSummary | null;
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
  summary,
  hasActiveFilters = false,
  onSearchChange,
  onAcademicYearChange,
  onSemesterChange,
  onClassificationChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const { searchQuery, academicYear, semester, classification, sortBy, viewMode } = filter;

  const [prevSearchQuery, setPrevSearchQuery] = React.useState<string>(searchQuery);
  const [localSearch, setLocalSearch] = React.useState<string>(searchQuery);

  // Synchronize local search state when external searchQuery prop changes (e.g. on resetFilters)
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  // Debounce search change by 350ms to eliminate continuous UI jitter and excessive calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const academicYearOptions = [
    { label: "2025-2026", value: "2025-2026" },
    { label: "2024-2025", value: "2024-2025" },
    { label: "2023-2024", value: "2023-2024" },
  ];

  const semesterOptions = [
    { label: t("card:gradebook.filters.allSemesters"), value: "all" },
    { label: t("card:gradebook.filters.semester1"), value: "HK1" },
    { label: t("card:gradebook.filters.semester2"), value: "HK2" },
  ];

  const sortOptions = [
    { label: t("card:gradebook.filters.sortGpaDesc"), value: "gpa_desc" },
    { label: t("card:gradebook.filters.sortGpaAsc"), value: "gpa_asc" },
    { label: t("card:gradebook.filters.sortNameAsc"), value: "name_asc" },
  ];

  const tabs: Array<{
    key: GradeClassification;
    label: string;
    icon: "book" | "sparkles" | "checkCircle" | "check" | "fileText";
    count?: number;
  }> = [
    {
      key: "all",
      label: t("card:gradebook.filters.allClassifications"),
      icon: "book",
      count: summary?.totalSubjectsCount ?? 13,
    },
    {
      key: "excellent",
      label: t("card:gradebook.filters.excellent"),
      icon: "sparkles",
      count: summary?.excellentSubjectsCount ?? 9,
    },
    {
      key: "good",
      label: t("card:gradebook.filters.good"),
      icon: "checkCircle",
      count: 2,
    },
    {
      key: "average",
      label: t("card:gradebook.filters.average"),
      icon: "check",
      count: 0,
    },
    {
      key: "feedback_only",
      label: t("card:gradebook.filters.feedbackOnly"),
      icon: "fileText",
      count: summary?.passSubjectsCount ?? 2,
    },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Filter Tabs with Counts matching ExamFilterBar and AttendanceFilterBar */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#f0f0f0]">
        {tabs.map((tab) => {
          const isActive = classification === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onClassificationChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                name={tab.icon}
                size={13}
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

      {/* 2. Search input, View Mode & Reset filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="grade-search-input"
            name="gradeSearchQuery"
            aria-label={t("card:gradebook.filters.searchPlaceholder")}
            placeholder={t("card:gradebook.filters.searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            autoFocus
            className="w-full"
          />
        </div>

        {/* View Mode Toggle: Table vs Grid */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#f0f0f0] shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="menu" size={13} />
            <span>{t("card:gradebook.filters.viewTable")}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="chart" size={13} />
            <span>{t("card:gradebook.filters.viewGrid")}</span>
          </button>
        </div>
      </div>

      {/* 3. Secondary Dropdown Filters: Academic Year, Semester, Sort & Reset Filters button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:gradebook.filters.academicYear")}:
            </span>
            <Select
              value={academicYear}
              onChange={onAcademicYearChange}
              options={academicYearOptions}
              className="w-36 sm:w-40"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:gradebook.filters.semester")}:
            </span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-32 sm:w-36"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:gradebook.filters.sort")}:
            </span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-44 sm:w-60"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            <Icon name="refresh" size={13} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
