import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  AssignmentSummaryCards,
  AssignmentFilterBar,
  AssignmentCard,
  AssignmentListItem,
  AssignmentSkeleton,
  AssignmentsPageHeader,
  AssignmentsEmptyState,
  AssignmentsPagination,
} from "@/modules/students/features/assignments/components";
import { useAssignments } from "@/modules/students/features/assignments/hooks";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["button", "message"]);

  const {
    assignments,
    total,
    summary,
    filter,
    loading,
    error,
    hasActiveFilters,
    setSubject,
    setStatus,
    setType,
    setSortBy,
    setSearchQuery,
    setViewMode,
    setPage,
    resetFilters,
    refetch,
  } = useAssignments();

  const handleOpenAssignment = (item: AssignmentItem) => {
    navigate(`/student/assignments/${item.id}`);
  };

  // Resolve available class subjects from summary.subjects first (so filtering by 1 subject keeps all subjects in dropdown)
  const dynamicSubjects = useMemo(() => {
    if (summary?.subjects && summary.subjects.length > 0) {
      return summary.subjects.map((s) => ({
        value: s.code,
        label: s.name,
      }));
    }
    const map = new Map<string, string>();
    assignments.forEach((a) => {
      if (a.subjectCode && a.subjectName) {
        map.set(a.subjectCode, a.subjectName);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [summary, assignments]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with integrated Breadcrumb */}
      <AssignmentsPageHeader />

      {/* 2. Overview Summary Cards (always rendered at position 2 to prevent CLS) */}
      <AssignmentSummaryCards summary={summary} loading={loading && !summary} />

      {/* 3. Filter Bar (Status Tabs, Search, Subject, Status, Type, Sort, and View Mode) */}
      <AssignmentFilterBar
        subject={filter.subject}
        status={filter.status}
        type={filter.type}
        sortBy={filter.sortBy || "newest"}
        searchQuery={filter.searchQuery}
        viewMode={filter.viewMode}
        summary={summary}
        subjects={dynamicSubjects.length > 0 ? dynamicSubjects : undefined}
        hasActiveFilters={hasActiveFilters}
        onSubjectChange={setSubject}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onSortByChange={setSortBy}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
      />

      {/* 4. Assignment Results: Loading skeleton, Error, Empty, or Grid/List */}
      {loading ? (
        <AssignmentSkeleton viewMode={filter.viewMode} />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t("message:failedToLoadAssignments")}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error.message || t("message:serverConnectionError")}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            {t("button:reloadData")}
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <AssignmentsEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      ) : filter.viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              onClick={handleOpenAssignment}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => (
            <AssignmentListItem
              key={item.id}
              assignment={item}
              onClick={handleOpenAssignment}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination with Border Framing */}
      <AssignmentsPagination
        current={filter.page || 1}
        pageSize={filter.pageSize || 10}
        total={total}
        itemsCount={assignments.length}
        onChange={(page, pageSize) => setPage(page, pageSize)}
      />
    </div>
  );
};
