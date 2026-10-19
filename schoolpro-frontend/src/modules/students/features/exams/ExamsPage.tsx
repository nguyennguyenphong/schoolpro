import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ExamsPageHeader,
  ExamSummaryCards,
  ExamFilterBar,
  ExamCard,
  ExamSkeleton,
  ExamsEmptyState,
} from "@/modules/students/features/exams/components";
import { useExams } from "@/modules/students/features/exams/hooks";
import type { ExamItem } from "@/modules/students/features/exams/types";

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter,
    exams,
    summary,
    loading,
    hasActiveFilters,
    setFilterStatus,
    setSearch,
    resetFilters,
  } = useExams();

  const handleOpenExam = (item: ExamItem) => {
    navigate(`/student/exams/${item.id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Standard Page Header with integrated Breadcrumb */}
      <ExamsPageHeader />

      {/* 2. Overview Summary Cards matching Leave Requests & Attendance */}
      <ExamSummaryCards summary={summary} loading={loading && !summary} />

      {/* 3. Filter Bar (Status Tabs, Debounced Search, View Mode Toggle, and Reset) */}
      <ExamFilterBar
        status={filter.status}
        searchQuery={filter.searchQuery}
        summary={summary}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearch}
        onResetFilters={resetFilters}
      />

      {/* 4. Exam Content: Skeleton, Empty State, or Grid / List view */}
      {loading && exams.length === 0 ? (
        <ExamSkeleton />
      ) : exams.length === 0 ? (
        <ExamsEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {exams.map((item) => (
            <ExamCard key={item.id} item={item} onOpen={handleOpenExam} />
          ))}
        </div>
      )}
    </div>
  );
};
