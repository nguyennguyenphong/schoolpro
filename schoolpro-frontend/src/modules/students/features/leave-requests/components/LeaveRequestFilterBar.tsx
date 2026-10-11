import React from "react";
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
  const statusOptions = [
    { label: "Tất cả trạng thái", value: "all" },
    { label: "Chờ duyệt", value: "pending" },
    { label: "Đã duyệt", value: "approved" },
    { label: "Từ chối", value: "rejected" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  const leaveTypeOptions = [
    { label: "Tất cả loại nghỉ phép", value: "all" },
    { label: "Nghỉ ốm / Khám bệnh", value: "sick" },
    { label: "Việc gia đình", value: "family_affair" },
    { label: "Việc hiếu / Tang chế", value: "bereavement" },
    { label: "Thi đấu / Công tác trường", value: "official_competition" },
    { label: "Lý do khác", value: "other" },
  ];

  const sortOptions = [
    { label: "Mới tạo gần nhất", value: "newest" },
    { label: "Cũ nhất trước", value: "oldest" },
    { label: "Theo ngày bắt đầu nghỉ", value: "start_date" },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* Top row: Search input & View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            id="leave-request-search-input"
            placeholder="Tìm kiếm theo lý do xin nghỉ, lời phê giáo viên..."
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
            <span>Dạng thẻ</span>
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
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Loại nghỉ phép */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Loại đơn:
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
              Trạng thái:
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
              Sắp xếp:
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
            <span>Đặt lại bộ lọc</span>
          </Button>
        )}
      </div>
    </div>
  );
};
