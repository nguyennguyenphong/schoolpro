import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SelectSort } from "@/components/sort/SelectSort";
import { SelectSubject } from "@/components/subjects/SelectSubject";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamFilter, ExamSummary } from "@/modules/students/features/exams/types";

interface ExamFilterBarProps {
  status: ExamFilter["status"];
  subject: string;
  format: string;
  sortBy: string;
  searchQuery: string;
  summary?: ExamSummary | null;
  hasActiveFilters?: boolean;
  onStatusChange: (status: ExamFilter["status"]) => void;
  onSubjectChange: (subject: string) => void;
  onFormatChange: (format: string) => void;
  onSortByChange: (sortBy: string) => void;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
}

export const ExamFilterBar: React.FC<ExamFilterBarProps> = ({
  status,
  subject,
  format,
  sortBy,
  searchQuery,
  summary,
  hasActiveFilters = false,
  onStatusChange,
  onSubjectChange,
  onFormatChange,
  onSortByChange,
  onSearchChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["card", "button"]);
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

  const tabs: Array<{
    key: ExamFilter["status"];
    label: string;
    icon: "file" | "clock" | "checkCircle" | "calendar";
    count: number;
  }> = [
    {
      key: "all",
      label: t("card:exams.tabs.all"),
      icon: "file",
      count: summary?.total ?? 0,
    },
    {
      key: "pending",
      label: t("card:exams.tabs.pending"),
      icon: "clock",
      count: summary?.pendingCount ?? 0,
    },
    {
      key: "completed",
      label: t("card:exams.tabs.completed"),
      icon: "checkCircle",
      count: summary?.completedCount ?? 0,
    },
    {
      key: "expired",
      label: t("card:exams.tabs.expired"),
      icon: "calendar",
      count: summary?.expiredCount ?? 0,
    },
  ];

  const formatOptions = [
    { label: t("card:exams.filters.allFormats"), value: "all" },
    { label: t("card:exams.filters.formatEssay"), value: "essay" },
    { label: t("card:exams.filters.formatMultipleChoice"), value: "multiple_choice" },
    { label: t("card:exams.filters.formatMixed"), value: "mixed" },
  ];

  const sortOptions = [
    { label: t("card:exams.filters.sortNewest"), value: "newest" },
    { label: t("card:exams.filters.sortUpcoming"), value: "upcoming" },
    { label: t("card:exams.filters.sortScore"), value: "score" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#f0f0f0]">
        {tabs.map((tab) => {
          const isActive = status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
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
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search input */}
      <div className="flex items-center">
        <Input
          id="exam-search-input"
          name="examSearchQuery"
          aria-label={t("card:exams.filters.searchPlaceholder")}
          placeholder={t("card:exams.filters.searchPlaceholder")}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          prefix={<Icon name="search" size={15} className="text-slate-400" />}
          allowClear
          autoFocus
          className="w-full"
        />
      </div>

      {/* 3. Filter Dropdowns: Subject, Format, Sort, and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Môn học */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="exam-filter-subject"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:exams.filters.subject")}
            </label>
            <SelectSubject
              id="exam-filter-subject"
              includeAllOption
              allOptionLabel={t("card:exams.filters.allSubjects")}
              value={subject || "all"}
              onChange={(val) => onSubjectChange(String(val || "all"))}
              className="w-40 sm:w-44"
            />
          </div>

          {/* Hình thức */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="exam-filter-format"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:exams.filters.format")}
            </label>
            <Select
              id="exam-filter-format"
              value={format || "all"}
              onChange={onFormatChange}
              options={formatOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="exam-filter-sort"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:exams.filters.sort")}
            </label>
            <SelectSort
              id="exam-filter-sort"
              value={sortBy || "newest"}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-36 sm:w-40"
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="text-slate-600 hover:text-blue-600 whitespace-nowrap text-xs h-8"
          >
            <Icon name="refresh" size={12} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
