import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentViewMode } from "@/modules/students/features/assignments/types";

interface SubjectOption {
  label: string;
  value: string;
}

interface AssignmentFilterBarProps {
  subject: string;
  status: string;
  type: string;
  searchQuery: string;
  viewMode: AssignmentViewMode;
  subjects?: SubjectOption[];
  hasActiveFilters?: boolean;
  onSubjectChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onViewModeChange: (mode: AssignmentViewMode) => void;
  onResetFilters: () => void;
}

export const AssignmentFilterBar: React.FC<AssignmentFilterBarProps> = ({
  subject,
  status,
  type,
  searchQuery,
  viewMode,
  subjects,
  hasActiveFilters = false,
  onSubjectChange,
  onStatusChange,
  onTypeChange,
  onSearchChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["card", "button", "common"]);

  useEffect(() => {
    const inputEl = document.getElementById("assignment-search-input");
    inputEl?.focus();
  }, []);

  const defaultSubjectOptions: SubjectOption[] = [
    { label: t("card:assignments.filters.allSubjects"), value: "all" },
    { label: "Toán học", value: "M839201" },
    { label: "Ngữ văn", value: "L928374" },
    { label: "Tiếng Anh", value: "E837465" },
    { label: "Tin học", value: "CS643291" },
    { label: "Vật lý", value: "P298374" },
    { label: "Hóa học", value: "C187465" },
    { label: "Sinh học", value: "B976584" },
    { label: "Lịch sử", value: "H746582" },
  ];

  const subjectOptions =
    subjects && subjects.length > 0
      ? [{ label: t("card:assignments.filters.allSubjects"), value: "all" }, ...subjects]
      : defaultSubjectOptions;

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

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="assignment-search-input"
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-end sm:self-auto">
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
            <span>{t("card:assignments.filters.grid")}</span>
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
            <span>{t("card:assignments.filters.list")}</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Môn học */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:assignments.filters.subject")}
            </span>
            <Select
              value={subject}
              onChange={onSubjectChange}
              options={subjectOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* 2. Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:assignments.filters.status")}
            </span>
            <Select
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* 3. Hình thức bài tập */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("card:assignments.filters.type")}
            </span>
            <Select
              value={type}
              onChange={onTypeChange}
              options={typeOptions}
              className="w-36 sm:w-44"
            />
          </div>
        </div>

        {/* Reset filter button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="text-slate-600 hover:text-blue-600"
          >
            <Icon name="refresh" size={12} className="mr-1" />
            {t("button:resetFilters")}
          </Button>
        )}
      </div>
    </div>
  );
};
