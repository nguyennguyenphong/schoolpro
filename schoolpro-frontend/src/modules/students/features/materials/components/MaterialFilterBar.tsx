import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SelectAcademicYear } from "@/components/academic-year/SelectAcademicYear";
import { SelectSemester } from "@/components/semester/SelectSemester";
import { SelectSort } from "@/components/sort/SelectSort";
import type {
  MaterialFilter,
  MaterialViewMode,
  MaterialCategory,
  MaterialSummary,
} from "@/modules/students/features/materials/types";
import { SelectSubject } from "@/components/subjects/SelectSubject";

interface MaterialFilterBarProps {
  filter: MaterialFilter;
  summary?: MaterialSummary | null;
  subjects?: { code: string; name: string }[];
  onSearchChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onSemesterChange: (value: string, option?: unknown) => void;
  onSubjectChange?: (value: string) => void;
  onCategoryChange: (value: string) => void;
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
  onAcademicYearChange,
  onSemesterChange,
  onSubjectChange,
  onCategoryChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const { searchQuery, academicYear, subject, category, semester, sortBy, viewMode } = filter;

  const [prevSearchQuery, setPrevSearchQuery] = useState<string>(searchQuery);
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);

  // Synchronize local search state when external searchQuery prop changes (e.g. on resetFilters)
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  // Debounce search change by 350ms to eliminate continuous UI jitter and excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const tabs: Array<{
    key: MaterialCategory | "all";
    label: string;
    icon: "file" | "presentation" | "book" | "fileText" | "bookmark";
    count?: number;
  }> = [
    {
      key: "all",
      label: t("card:materials.filter.allCategories"),
      icon: "file",
      count: summary?.total,
    },
    {
      key: "lecture",
      label: t("card:materials.categories.lecture"),
      icon: "presentation",
      count: summary?.lecturesCount,
    },
    {
      key: "outline",
      label: t("card:materials.categories.outline"),
      icon: "book",
      count: summary?.outlinesCount,
    },
    {
      key: "textbook",
      label: t("card:materials.categories.textbook"),
      icon: "book",
      count: summary?.textbooksCount,
    },
    {
      key: "exam_prep",
      label: t("card:materials.categories.exam_prep"),
      icon: "fileText",
      count: summary?.examPrepsCount,
    },
    {
      key: "reference",
      label: t("card:materials.categories.reference"),
      icon: "bookmark",
    },
  ];

  const sortOptions = [
    { label: t("card:materials.filter.newest"), value: "newest" },
    { label: t("card:materials.filter.mostDownloaded"), value: "most_downloaded" },
    { label: t("card:materials.filter.titleAsc"), value: "title_asc" },
    { label: t("card:materials.filter.sizeAsc"), value: "size_asc" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Category Status Tabs at the top */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#f0f0f0]">
        {tabs.map((tab) => {
          const isActive = category === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onCategoryChange(tab.key)}
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

      {/* 2. Search input & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="material-search-input"
            name="searchQuery"
            autoFocus
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t("card:materials.filter.searchMaterialPlaceholder")}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            className="w-full"
          />
        </div>

        {/* View Mode Toggle: Grid vs List */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#f0f0f0] shrink-0 self-end sm:self-auto">
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
            <span>{t("card:materials.filter.viewGrid")}</span>
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
            <span>{t("card:materials.filter.viewList")}</span>
          </button>
        </div>
      </div>

      {/* 3. Secondary Dropdown Filters: Academic Year, Semester, Subject, Sort & Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Năm học */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.academicYearLabel")}
            </span>
            <SelectAcademicYear
              value={academicYear || undefined}
              onChange={onAcademicYearChange}
              allOptionLabel={t("card:materials.filter.allAcademicYears")}
              defaultToCurrent
              className="w-44 sm:w-50"
            />
          </div>

          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.semesterLabel")}
            </span>
            <SelectSemester
              value={semester || undefined}
              academicYearId={academicYear}
              onChange={onSemesterChange}
              allOptionLabel={t("card:materials.filter.allSemesters")}
              defaultToCurrent
              className="w-40 sm:w-46"
            />
          </div>

          {/* Môn học */}
          {subjects.length > 0 && onSubjectChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t("card:materials.filter.subjectLabel")}
              </span>
              <SelectSubject
                value={subject}
                onChange={onSubjectChange}
                className="w-44 sm:w-50"
              />
            </div>
          )}

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.sortByLabel")}
            </span>
            <SelectSort
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-44 sm:w-52"
            />
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title={t("card:materials.filter.resetTooltip")}
          >
            <Icon name="refresh" size={13} />
            <span>{t("card:materials.filter.reset")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
