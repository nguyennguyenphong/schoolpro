import React from "react";
import type {
  AnnouncementFilter,
  AnnouncementCategory,
  AnnouncementCategoryOption,
  AnnouncementPriority,
  AnnouncementSortOption,
  AnnouncementSummary,
} from "@/modules/students/features/announcements/types";
import {
  AnnouncementStatusTabs,
  AnnouncementSearchAndView,
  AnnouncementDropdownFilters,
} from "@/modules/students/features/announcements/components/filter";

export interface AnnouncementFilterBarProps {
  filter: AnnouncementFilter;
  summary?: AnnouncementSummary | null;
  departments?: string[];
  categories?: AnnouncementCategoryOption[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: AnnouncementCategory) => void;
  onDepartmentChange: (dept: string) => void;
  onReadStatusChange: (status: "all" | "unread" | "read") => void;
  onPriorityChange: (priority: "all" | AnnouncementPriority) => void;
  onSortByChange: (sort: AnnouncementSortOption) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onResetFilters: () => void;
  hasActiveFilters?: boolean;
}

/**
 * AnnouncementFilterBar acts as the primary orchestrator component combining:
 * 1. Status Filter Tabs (All / Unread / Read)
 * 2. Search Box & View Mode Toggle (Grid / List)
 * 3. Composite Dropdown Filters (Category, Department, Priority, Sort & Reset)
 */
export const AnnouncementFilterBar: React.FC<AnnouncementFilterBarProps> = ({
  filter,
  summary,
  categories,
  onSearchChange,
  onCategoryChange,
  onDepartmentChange,
  onReadStatusChange,
  onPriorityChange,
  onSortByChange,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Status Tabs */}
      <AnnouncementStatusTabs
        readStatus={filter.readStatus}
        totalCount={summary?.total}
        unreadCount={summary?.unreadCount}
        onStatusChange={onReadStatusChange}
      />

      {/* 2. Search & View Mode Toggle */}
      <AnnouncementSearchAndView
        searchQuery={filter.searchQuery}
        viewMode={filter.viewMode}
        onSearchChange={onSearchChange}
        onViewModeChange={onViewModeChange}
      />

      {/* 3. Dropdown Filters Bar */}
      <AnnouncementDropdownFilters
        filter={filter}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onCategoryChange={onCategoryChange}
        onDepartmentChange={onDepartmentChange}
        onPriorityChange={onPriorityChange}
        onSortByChange={onSortByChange}
        onResetFilters={onResetFilters}
      />
    </div>
  );
};
