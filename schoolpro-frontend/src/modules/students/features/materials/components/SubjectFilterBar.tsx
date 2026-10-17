import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
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
  const { t } = useTranslation(["card", "button"]);
  const { searchQuery, semester, sortBy, viewMode = "grid" } = filter;

  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("subject-search-input");
      input?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const semesterOptions = [
    { value: "all", label: t("card:materials.filter.allSemesters") },
    { value: "Học kỳ 1", label: t("card:materials.filter.semester1") },
    { value: "Học kỳ 2", label: t("card:materials.filter.semester2") },
  ];

  const sortOptions = [
    { value: "name_asc", label: t("card:materials.filter.nameAsc") },
    { value: "most_materials", label: t("card:materials.filter.mostMaterials") },
    { value: "most_downloads", label: t("card:materials.filter.mostDownloads") },
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
            placeholder={t("card:materials.filter.searchSubjectPlaceholder")}
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="menu" size={13} />
              <span>{t("card:materials.filter.viewList")}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Dropdown Filters */}
      <div className="pt-2.5 border-t border-[#f0f0f0] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.semesterLabel")}
            </span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.sortByLabel")}
            </span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-44 sm:w-52"
            />
          </div>

          {totalSubjects !== undefined && (
            <span className="text-xs text-slate-400 font-medium hidden md:inline-block">
              {t("card:materials.filter.totalSubjectsCount", {
                count: totalSubjects,
              })}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title={t("card:materials.filter.resetTooltip")}
          >
            <Icon name="check" size={13} className="text-rose-500" />
            <span>{t("card:materials.filter.reset")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
