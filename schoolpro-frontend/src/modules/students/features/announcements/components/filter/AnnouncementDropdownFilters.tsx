import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  AnnouncementFilter,
  AnnouncementCategory,
  AnnouncementCategoryOption,
  AnnouncementPriority,
  AnnouncementSortOption,
} from "@/modules/students/features/announcements/types";
import { SelectDepartment } from "@/components/departments/SelectDepartment";
import { SelectPriority } from "@/components/priority";
import { SelectSort } from "@/components/sort";
import { AnnouncementCategorySelect } from "@/modules/students/features/announcements/components/filter/AnnouncementCategorySelect";

export interface AnnouncementDropdownFiltersProps {
  /**
   * Current filter state object.
   */
  filter: AnnouncementFilter;

  /**
   * Available categories for user's school.
   */
  categories?: AnnouncementCategoryOption[];

  /**
   * Override flag indicating whether active filters exist.
   */
  hasActiveFilters?: boolean;

  /**
   * Callback fired when category selection changes.
   */
  onCategoryChange: (category: AnnouncementCategory) => void;

  /**
   * Callback fired when department selection changes.
   */
  onDepartmentChange: (dept: string) => void;

  /**
   * Callback fired when priority selection changes.
   */
  onPriorityChange: (priority: "all" | AnnouncementPriority) => void;

  /**
   * Callback fired when sort option changes.
   */
  onSortByChange: (sort: AnnouncementSortOption) => void;

  /**
   * Callback fired when reset button is clicked.
   */
  onResetFilters: () => void;
}

/**
 * Composite dropdown filters bar combining Category, Department, Priority, Sort and Reset controls.
 */
export const AnnouncementDropdownFilters: React.FC<AnnouncementDropdownFiltersProps> = ({
  filter,
  categories,
  hasActiveFilters = false,
  onCategoryChange,
  onDepartmentChange,
  onPriorityChange,
  onSortByChange,
  onResetFilters,
}) => {
  const isFilterActive =
    hasActiveFilters ||
    Boolean(
      filter.searchQuery.trim() ||
        filter.category !== "all" ||
        (filter.department && filter.department !== "all") ||
        filter.readStatus !== "all" ||
        filter.priority !== "all" ||
        filter.sortBy !== "newest"
    );

  return (
    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Chuyên mục */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Chuyên mục:</span>
          <AnnouncementCategorySelect
            value={filter.category}
            onChange={onCategoryChange}
            categories={categories}
            className="w-44"
          />
        </div>

        {/* Đơn vị ban hành */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Đơn vị:</span>
          <SelectDepartment
            value={filter.department || "all"}
            includeAllOption={true}
            allOptionLabel="Tất cả đơn vị"
            allOptionValue="all"
            onChange={(val, opt) => {
              if (!val || val === "all") {
                onDepartmentChange("all");
                return;
              }
              const optRecord = opt as { title?: string; label?: string } | undefined;
              const deptName = optRecord?.title || optRecord?.label || String(val);
              onDepartmentChange(deptName || "all");
            }}
            placeholder="Tất cả đơn vị"
            allowClear={true}
            className="w-60"
          />
        </div>

        {/* Mức độ */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Mức độ:</span>
          <SelectPriority
            value={filter.priority}
            onChange={onPriorityChange}
            className="w-35"
          />
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
          <SelectSort
            value={filter.sortBy}
            onChange={onSortByChange}
            className="w-36"
          />
        </div>
      </div>

      {/* Reset button */}
      {isFilterActive && (
        <Button
          variant="outline"
          onClick={onResetFilters}
          title="Đặt lại tất cả bộ lọc"
        >
          <Icon name="check" size={13} className="text-rose-500" />
          Đặt lại
        </Button>
      )}
    </div>
  );
};
