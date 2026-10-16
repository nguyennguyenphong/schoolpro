import type React from "react";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";
import {
  GradebookPageHeader,
  GradeSummaryCards,
  GradeFilterBar,
  GradeTableView,
  GradeGridCard,
  SubjectGradeDetailModal,
  GradeTranscriptModal,
  GradeSkeleton,
  GradeEmptyState,
} from "@/modules/students/features/gradebook/components";
import { useGradebook } from "@/modules/students/features/gradebook/hooks";

export const GradebookPage: React.FC = () => {
  const { t } = useTranslation(["card", "button", "message", "navigation"]);
  const {
    grades,
    summary,
    loading,
    error,
    filter,
    hasActiveFilters,
    selectedSubject,
    transcriptData,
    isTranscriptLoading,
    isDetailModalOpen,
    isTranscriptModalOpen,
    setSearchQuery,
    setAcademicYear,
    setSemester,
    setClassification,
    setSortBy,
    openSubjectDetail,
    closeSubjectDetail,
    closeTranscriptModal,
    handleExportPdf,
    handlePrintGradebook,
    resetFilters,
  } = useGradebook();

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Unified Page Header with Breadcrumb & Single Print Action */}
      <GradebookPageHeader onPrintGradebook={handlePrintGradebook} />

      {/* Error alert matching LeaveRequests */}
      {error && (
        <Alert
          type="error"
          showIcon
          title={t("card:gradebook.messages.loadError")}
          description={error}
          className="rounded-xl"
        />
      )}

      {/* 2. Overview Summary Cards matching Leave Requests, Attendance, and Exams */}
      <GradeSummaryCards summary={summary} loading={loading && !summary} />

      {/* 3. Filter Bar (Classification Tabs, Debounced Search, Dropdowns, View Mode Toggle, and Reset) */}
      <GradeFilterBar
        filter={filter}
        summary={summary}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchQuery}
        onAcademicYearChange={setAcademicYear}
        onSemesterChange={setSemester}
        onClassificationChange={setClassification}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
      />

      {/* 4. Grade Content: Skeleton, Empty State, or Grid / Table view with loading transition */}
      {loading && grades.length === 0 ? (
        <GradeSkeleton viewMode={filter.viewMode} />
      ) : filter.viewMode === "grid" ? (
        grades.length === 0 ? (
          <GradeEmptyState
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
              loading ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            {grades.map((item) => (
              <GradeGridCard
                key={item.id}
                item={item}
                onOpenDetail={openSubjectDetail}
              />
            ))}
          </div>
        )
      ) : (
        <div
          className={`transition-opacity duration-200 ${
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          <GradeTableView
            grades={grades}
            summary={summary}
          />
        </div>
      )}

      {/* 5. Modals */}
      <SubjectGradeDetailModal
        isOpen={isDetailModalOpen}
        item={selectedSubject}
        onClose={closeSubjectDetail}
      />

      <GradeTranscriptModal
        isOpen={isTranscriptModalOpen}
        grades={grades}
        summary={summary}
        transcriptData={transcriptData}
        isLoading={isTranscriptLoading}
        onClose={closeTranscriptModal}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
};

export default GradebookPage;
