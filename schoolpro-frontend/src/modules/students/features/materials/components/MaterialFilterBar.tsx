import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  MaterialFilter,
  MaterialViewMode,
  MaterialCategory,
  MaterialSummary,
} from "@/modules/students/features/materials/types";

interface MaterialFilterBarProps {
  filter: MaterialFilter;
  summary?: MaterialSummary | null;
  subjects?: { code: string; name: string }[];
  onSearchChange: (value: string) => void;
  onSubjectChange?: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
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
  onSubjectChange,
  onCategoryChange,
  onSemesterChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const { t } = useTranslation();
  const { searchQuery, subject, category, semester, sortBy, viewMode } = filter;

  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("material-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tabs: Array<{
    key: MaterialCategory | "all";
    label: string;
    icon: "file" | "presentation" | "book" | "fileText";
    count?: number;
  }> = [
    {
      key: "all",
      label: t("card:materials.filter.allCategories", "Tất cả danh mục"),
      icon: "file",
      count: summary?.total,
    },
    {
      key: "lecture",
      label: t("card:materials.categories.lecture", "Bài giảng"),
      icon: "presentation",
      count: summary?.lecturesCount,
    },
    {
      key: "outline",
      label: t("card:materials.categories.outline", "Đề cương"),
      icon: "book",
      count: summary?.outlinesCount,
    },
    {
      key: "exam_prep",
      label: t("card:materials.categories.exam_prep", "Đề thi"),
      icon: "fileText",
      count: summary?.examPrepsCount,
    },
    {
      key: "textbook",
      label: t("card:materials.categories.textbook", "Sách giáo khoa"),
      icon: "book",
      count: summary?.textbooksCount,
    },
  ];

  const subjectOptions = [
    { label: t("card:materials.filter.allSubjects", "Tất cả môn học"), value: "all" },
    ...subjects.map((s) => ({ label: s.name, value: s.code })),
  ];

  const categoryOptions = [
    { label: t("card:materials.filter.allCategories", "Tất cả danh mục"), value: "all" },
    { label: t("card:materials.categories.lecture", "Bài giảng"), value: "lecture" },
    { label: t("card:materials.categories.outline", "Đề cương"), value: "outline" },
    { label: t("card:materials.categories.textbook", "Sách giáo khoa"), value: "textbook" },
    { label: t("card:materials.categories.exam_prep", "Đề thi"), value: "exam_prep" },
    { label: t("card:materials.categories.reference", "Tham khảo"), value: "reference" },
  ];

  const semesterOptions = [
    { label: t("card:materials.filter.allSemesters", "Tất cả học kỳ"), value: "all" },
    { label: t("card:materials.filter.semester1", "Học kỳ 1"), value: "HK1" },
    { label: t("card:materials.filter.semester2", "Học kỳ 2"), value: "HK2" },
  ];

  const sortOptions = [
    { label: t("card:materials.filter.newest", "Mới nhất"), value: "newest" },
    { label: t("card:materials.filter.mostDownloaded", "Lượt tải nhiều nhất"), value: "most_downloaded" },
    { label: t("card:materials.filter.titleAsc", "Tên tài liệu (A - Z)"), value: "title_asc" },
    { label: t("card:materials.filter.sizeAsc", "Dung lượng nhỏ nhất"), value: "size_asc" },
  ];

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = category === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onCategoryChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                name={tab.icon}
                size={14}
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

      {/* 2. Search Input + View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            id="material-search-input"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("card:materials.filter.searchMaterialPlaceholder", "Tìm kiếm bài giảng, đề cương, tác giả, tài liệu...")}
            prefix={<Icon name="search" size={14} className="text-slate-400" />}
            allowClear
            className="rounded-lg text-xs w-full"
          />
        </div>

        {/* View Mode Toggle: Grid vs List */}
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
            <span>{t("card:materials.filter.viewGrid", "Lưới thẻ")}</span>
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
            <span>{t("card:materials.filter.viewList", "Danh sách")}</span>
          </button>
        </div>
      </div>

      {/* 3. Dropdown Filters */}
      <div className="pt-2.5 border-t border-[#f0f0f0] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Môn học */}
          {onSubjectChange && subjects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t("card:materials.filter.subjectLabel", "Môn học:")}
              </span>
              <Select
                value={subject}
                onChange={onSubjectChange}
                options={subjectOptions}
                className="w-40 sm:w-44"
              />
            </div>
          )}

          {/* Danh mục */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.categoryLabel", "Danh mục:")}
            </span>
            <Select
              value={category}
              onChange={(val: string) => onCategoryChange(val as MaterialCategory)}
              options={categoryOptions}
              className="w-40 sm:w-44"
            />
          </div>

          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.semesterLabel", "Học kỳ:")}
            </span>
            <Select
              value={semester}
              onChange={onSemesterChange}
              options={semesterOptions}
              className="w-32 sm:w-36"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:materials.filter.sortByLabel", "Sắp xếp:")}
            </span>
            <Select
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-38 sm:w-42"
            />
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title={t("card:materials.filter.resetTooltip", "Đặt lại tất cả bộ lọc")}
          >
            <Icon name="check" size={13} className="text-rose-500" />
            <span>{t("card:materials.filter.reset", "Đặt lại")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
