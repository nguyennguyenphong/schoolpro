import React from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "@/components/ui/Empty";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  MaterialSummaryCards,
  MaterialFilterBar,
  MaterialSelectionBar,
  MaterialCard,
  MaterialListItem,
  MaterialDetailModal,
  MaterialsPagination,
  MaterialsSkeleton,
} from "@/modules/students/features/materials/components";
import { useMaterials } from "@/modules/students/features/materials/hooks";

export const MaterialsPage: React.FC = () => {
  const { t } = useTranslation(["card", "button"]);

  const {
    materials,
    total,
    summary,
    subjects,
    loading,
    filter,
    selectedMaterial,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery,
    setAcademicYear,
    setSemester,
    setSubject,
    setCategory,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    downloadSelected,
    downloadMaterial,
    toggleBookmark,
    openDetail,
    closeDetail,
  } = useMaterials();

  const hasActiveFilters = Boolean(
    filter.searchQuery.trim() ||
      (filter.academicYear && filter.academicYear !== "all") ||
      (filter.semester && filter.semester !== "all") ||
      (filter.subject && filter.subject !== "all") ||
      (filter.category && filter.category !== "all") ||
      filter.sortBy !== "newest",
  );

  if (loading && materials.length === 0) {
    return <MaterialsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("card:materials.header.breadcrumbHome", "Trang chủ")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="download" size={13} className="text-blue-600 shrink-0" />
                  <span>{t("card:materials.header.breadcrumbMaterials", "Tài liệu học tập")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {t("card:materials.header.title", "Tài liệu học tập")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("card:materials.header.subtitle", "Kho bài giảng số, đề cương ôn tập, đề thi thử và giáo trình điện tử phục vụ học tập")}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards (Dashboard style) */}
      <MaterialSummaryCards summary={summary} loading={loading && !summary} />

      {/* 3. Multi-criteria Filter Bar with Category Tabs, Search, Academic Year, Semester, Subject, Sort */}
      <MaterialFilterBar
        filter={filter}
        summary={summary}
        subjects={subjects}
        onSearchChange={setSearchQuery}
        onAcademicYearChange={setAcademicYear}
        onSemesterChange={setSemester}
        onSubjectChange={setSubject}
        onCategoryChange={setCategory}
        onSortByChange={setSortBy}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Multi-selection Bar */}
      <MaterialSelectionBar
        selectedCount={selectedIds.length}
        totalOnPage={materials.length}
        isAllSelected={isAllCurrentPageSelected}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDownloadSelected={downloadSelected}
      />

      {/* 5. Results Area */}
      {materials.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  {t("card:materials.empty.noMaterialsTitle", "Không tìm thấy tài liệu học tập")}
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? t("card:materials.empty.noMaterialsDesc", "Không có tài liệu nào phù hợp với bộ lọc hiện tại. Hãy thử chọn điều kiện khác.")
                    : "Hiện tại chưa có tài liệu nào trong danh mục này."}
                </p>
              </div>
            }
          >
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mt-3"
              >
                {t("card:materials.empty.resetFilterBtn", "Đặt lại bộ lọc")}
              </Button>
            )}
          </Empty>
        </div>
      ) : filter.viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((item) => (
            <MaterialCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onDownload={downloadMaterial}
              onToggleBookmark={toggleBookmark}
              onClick={openDetail}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {materials.map((item) => (
            <MaterialListItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onDownload={downloadMaterial}
              onToggleBookmark={toggleBookmark}
              onClick={openDetail}
            />
          ))}
        </div>
      )}

      {/* 6. Synchronized Pagination matching leave-requests / attendance */}
      <MaterialsPagination
        current={filter.page}
        pageSize={filter.pageSize}
        total={total}
        itemsCount={materials.length}
        onChange={(page, pageSize) => setPage(page, pageSize)}
      />

      {/* 7. Detail Modal */}
      <MaterialDetailModal
        item={selectedMaterial}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onDownload={downloadMaterial}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
};

export default MaterialsPage;
