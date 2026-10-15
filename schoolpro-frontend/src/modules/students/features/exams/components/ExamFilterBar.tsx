import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamFilter, ExamSummary } from "@/modules/students/features/exams/types";

interface ExamFilterBarProps {
  status: ExamFilter["status"];
  searchQuery: string;
  viewMode: "grid" | "list";
  summary?: ExamSummary | null;
  hasActiveFilters?: boolean;
  onStatusChange: (status: ExamFilter["status"]) => void;
  onSearchChange: (q: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onResetFilters: () => void;
}

export const ExamFilterBar: React.FC<ExamFilterBarProps> = ({
  status,
  searchQuery,
  viewMode,
  summary,
  hasActiveFilters = false,
  onStatusChange,
  onSearchChange,
  onViewModeChange,
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

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
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

      {/* 2. Search input, View Mode & Reset filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
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

        <div className="flex items-center gap-2 self-end sm:self-auto">
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

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#f0f0f0] shrink-0">
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
              <span>{t("card:exams.filters.viewGrid")}</span>
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
              <span>{t("card:exams.filters.viewList")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
