import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SelectSort } from "@/components/sort/SelectSort";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  AssignmentSummary,
  AssignmentViewMode,
} from "@/modules/students/features/assignments/types";
import { SelectSubject } from "@/components/subjects/SelectSubject";

interface SubjectOption {
  label: string;
  value: string;
}

interface AssignmentFilterBarProps {
  subject: string;
  status: string;
  type: string;
  sortBy: string;
  searchQuery: string;
  viewMode: AssignmentViewMode;
  summary?: AssignmentSummary | null;
  subjects?: SubjectOption[];
  hasActiveFilters?: boolean;
  onSubjectChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onViewModeChange: (mode: AssignmentViewMode) => void;
  onResetFilters: () => void;
}

export const AssignmentFilterBar: React.FC<AssignmentFilterBarProps> = ({
  subject,
  status,
  type,
  sortBy,
  searchQuery,
  viewMode,
  summary,
  hasActiveFilters = false,
  onSubjectChange,
  onStatusChange,
  onTypeChange,
  onSortByChange,
  onSearchChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["card", "button"]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("assignment-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const statusOptions = [
    { label: t("card:assignments.filters.allStatuses"), value: "all" },
    { label: t("card:assignments.statusLabels.pending"), value: "pending" },
    { label: t("card:assignments.statusLabels.submitted"), value: "submitted" },
    { label: t("card:assignments.statusLabels.graded"), value: "graded" },
    { label: t("card:assignments.statusLabels.overdue"), value: "overdue" },
  ];

  const typeOptions = [
    { label: t("card:assignments.filters.allTypes"), value: "all" },
    { label: t("card:assignments.typeLabels.homework"), value: "homework" },
    { label: t("card:assignments.typeLabels.quiz"), value: "quiz" },
    { label: t("card:assignments.typeLabels.project"), value: "project" },
    { label: t("card:assignments.typeLabels.essay"), value: "essay" },
  ];

  const sortOptions = [
    { label: t("card:assignments.filters.sortNewest"), value: "newest" },
    { label: t("card:assignments.filters.sortDueSoon"), value: "due_soon" },
    { label: t("card:assignments.filters.sortScore"), value: "score" },
  ];

  const statusTabs: Array<{
    key: string;
    label: string;
    icon: "file" | "clock" | "send" | "checkCircle" | "warning";
    count: number;
  }> = [
    {
      key: "all",
      label: t("card:assignments.tabs.all"),
      icon: "file",
      count: summary?.total ?? 0,
    },
    {
      key: "pending",
      label: t("card:assignments.tabs.pending"),
      icon: "clock",
      count: summary?.pendingCount ?? 0,
    },
    {
      key: "submitted",
      label: t("card:assignments.tabs.submitted"),
      icon: "send",
      count: summary?.submittedCount ?? 0,
    },
    {
      key: "graded",
      label: t("card:assignments.tabs.graded"),
      icon: "checkCircle",
      count: summary?.gradedCount ?? 0,
    },
    {
      key: "overdue",
      label: t("card:assignments.tabs.overdue"),
      icon: "warning",
      count: summary?.overdueCount ?? 0,
    },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#f0f0f0]">
        {statusTabs.map((tab) => {
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

      {/* 2. Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="assignment-search-input"
            name="assignmentSearchQuery"
            aria-label={t("card:assignments.filters.searchPlaceholder")}
            autoFocus
            placeholder={t("card:assignments.filters.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="chart" size={13} />
            <span>{t("card:assignments.filters.grid")}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="menu" size={13} />
            <span>{t("card:assignments.filters.list")}</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f0f0f0]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Môn học */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="assignment-filter-subject"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:assignments.filters.subject")}
            </label>
            <SelectSubject
              className="w-40 sm:w-40"
              id="assignment-filter-subject"
              includeAllOption
              allOptionLabel={t("card:assignments.filters.allSubjects")}
              value={subject || "all"}
              onChange={(val) => onSubjectChange(String(val || "all"))}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="assignment-filter-status"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:assignments.filters.status")}
            </label>
            <Select
              id="assignment-filter-status"
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
              className="w-36 sm:w-38"
            />
          </div>

          {/* Type of assignment */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="assignment-filter-type"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:assignments.filters.type")}
            </label>
            <Select
              id="assignment-filter-type"
              value={type}
              onChange={onTypeChange}
              options={typeOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="assignment-filter-sort"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              {t("card:assignments.filters.sort")}
            </label>
            <SelectSort
              id="assignment-filter-sort"
              value={sortBy || "newest"}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-40 sm:w-38"
            />
          </div>
        </div>

        {/* Reset filter button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="text-slate-600 hover:text-blue-600 whitespace-nowrap"
          >
            <Icon name="refresh" size={12} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
