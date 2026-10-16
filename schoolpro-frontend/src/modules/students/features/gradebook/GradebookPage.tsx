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
    openTranscriptModal,
    closeTranscriptModal,
    handleExportPdf,
    resetFilters,
  } = useGradebook();

  const isHk2 =
    filter.semester === "HK2" ||
    filter.semester === "2" ||
    filter.semester.toLowerCase().includes("sem_20262027_2") ||
    filter.semester.endsWith("000000000002");

  const isHk1 =
    filter.semester === "HK1" ||
    filter.semester === "1" ||
    filter.semester.toLowerCase().includes("sem_20262027_1") ||
    filter.semester.endsWith("000000000001");

  const semesterLabel = isHk1
    ? t("card:gradebook.filters.semester1")
    : isHk2
    ? t("card:gradebook.filters.semester2")
    : summary?.semester || t("card:gradebook.filters.allSemesters");

  const academicYearLabel =
    filter.academicYear &&
    !filter.academicYear.includes("-0000") &&
    !filter.academicYear.includes("-402")
      ? filter.academicYear
      : summary?.academicYear || "2026 - 2027";

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Unified Page Header with Breadcrumb & Actions matching LeaveRequests & Attendance */}
      <GradebookPageHeader
        className={summary?.className || "Lớp 11A1"}
        semesterText={`${semesterLabel} • ${academicYearLabel}`}
        studentCode="SV202688"
        onOpenTranscript={openTranscriptModal}
        onExportPdf={handleExportPdf}
      />

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
      ) : grades.length === 0 ? (
        <GradeEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      ) : filter.viewMode === "grid" ? (
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
