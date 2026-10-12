import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { LeaveRequestViewMode } from "@/modules/students/features/leave-requests/types";
import { SelectSort } from "@/components/sort/SelectSort";
import { Select } from "@/components/ui/Select";

interface LeaveRequestFilterBarProps {
  status: string;
  leaveType: string;
  searchQuery: string;
  sortBy: string;
  viewMode: LeaveRequestViewMode;
  hasActiveFilters?: boolean;
  onStatusChange: (val: string) => void;
  onLeaveTypeChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onViewModeChange: (mode: LeaveRequestViewMode) => void;
  onResetFilters: () => void;
}

export const LeaveRequestFilterBar: React.FC<LeaveRequestFilterBarProps> = ({
  status,
  leaveType,
  searchQuery,
  sortBy,
  viewMode,
  hasActiveFilters = false,
  onStatusChange,
  onLeaveTypeChange,
  onSearchChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
}) => {
  const { t } = useTranslation(["input", "card", "button"]);

  const statusOptions = [
    { label: t("input:leaveRequests.allStatuses"), value: "all" },
    { label: t("card:leaveRequests.statuses.pending"), value: "pending" },
    { label: t("card:leaveRequests.statuses.approved"), value: "approved" },
    { label: t("card:leaveRequests.statuses.rejected"), value: "rejected" },
    { label: t("card:leaveRequests.statuses.cancelled"), value: "cancelled" },
  ];

  const leaveTypeOptions = [
    { label: t("input:leaveRequests.allLeaveTypes"), value: "all" },
    { label: t("card:leaveRequests.leaveTypes.sick"), value: "sick" },
    { label: t("card:leaveRequests.leaveTypes.family_affair"), value: "family_affair" },
    { label: t("card:leaveRequests.leaveTypes.bereavement"), value: "bereavement" },
    {
      label: t("card:leaveRequests.leaveTypes.official_competition"),
      value: "official_competition",
    },
    { label: t("card:leaveRequests.leaveTypes.other"), value: "other" },
  ];

  const sortOptions = [
    { label: t("input:leaveRequests.sortNewest"), value: "newest" },
    { label: t("input:leaveRequests.sortOldest"), value: "oldest" },
    { label: t("input:leaveRequests.sortStartDate"), value: "start_date" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="leave-request-search-input"
            placeholder={t("input:leaveRequests.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Icon name="search" size={15} className="text-slate-400" />}
            allowClear
            className="w-full"
            autoFocus
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
            <span>{t("input:leaveRequests.viewCard")}</span>
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
            <span>{t("input:leaveRequests.viewList")}</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Loại nghỉ phép */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("input:leaveRequests.filterLeaveType")}
            </span>
            <Select
              value={leaveType}
              onChange={onLeaveTypeChange}
              options={leaveTypeOptions}
              className="w-44 sm:w-48"
            />
          </div>

          {/* 2. Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("input:leaveRequests.filterStatus")}
            </span>
            <Select
              value={status}
              onChange={onStatusChange}
              options={statusOptions}
              className="w-36 sm:w-44"
            />
          </div>

          {/* 3. Sắp xếp */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {t("input:leaveRequests.filterSort")}
            </span>
            <SelectSort
              value={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              className="w-40 sm:w-48"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            <Icon name="refresh" size={13} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
