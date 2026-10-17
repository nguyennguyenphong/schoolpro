import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Empty } from "@/components/ui/Empty";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import {
  MaterialSummaryCards,
  MaterialFilterBar,
  MaterialSelectionBar,
  MaterialCard,
  MaterialListItem,
  MaterialsPagination,
  MaterialsSkeleton,
} from "@/modules/students/features/materials/components";
import { useSubjectMaterials } from "@/modules/students/features/materials/hooks";

export const SubjectMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    subject,
    subjectCode,
    materials,
    total,
    summary,
    loading,
    filter,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery,
    setAcademicYear,
    setCategory,
    setSemester,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    downloadMaterial,
    downloadSelected,
    downloadAll,
    toggleBookmark,
  } = useSubjectMaterials();

  const hasActiveFilters = Boolean(
    filter.searchQuery.trim() ||
      (filter.academicYear && filter.academicYear !== "all") ||
      (filter.semester && filter.semester !== "all") ||
      (filter.category && filter.category !== "all") ||
      filter.sortBy !== "newest",
  );

  if (loading && materials.length === 0) {
    return <MaterialsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Header with Breadcrumb and Subject Info */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
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
              href: "/student/materials",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="download" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("card:materials.header.breadcrumbMaterials", "Kho tài liệu")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="book" size={13} className="text-blue-600 shrink-0" />
                  <span>{subject ? subject.name : subjectCode}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="ghost"
                onClick={() => navigate("/student/materials")}
                className="text-slate-600 hover:text-blue-600 hover:bg-slate-100 p-1.5"
                title={t("card:materials.header.backToSubjects", "Quay lại danh mục môn học")}
              >
                <Icon name="arrow-left" size={18} />
              </Button>

              <span className="w-1.5 h-6 rounded-full bg-blue-600 inline-block" />

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0 leading-tight">
                {subject
                  ? t("card:materials.header.subjectMaterialsTitle", {
                      subject: subject.name,
                      defaultValue: `Tài liệu môn ${subject.name}`,
                    })
                  : t("card:materials.header.subjectMaterialsTitle", {
                      subject: subjectCode,
                      defaultValue: `Tài liệu môn ${subjectCode}`,
                    })}
              </h1>

              {subject && (
                <Tag color="blue" className="text-xs font-semibold m-0">
                  {subject.code}
                </Tag>
              )}
              {subject && (
                <Tag color="default" className="text-xs font-medium m-0">
                  {subject.semester} ({subject.academicYear})
                </Tag>
              )}
            </div>

            {subject && (
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pl-8">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon name="user" size={13} className="text-blue-600" />
                  {subject.teacher} ({subject.teacherTitle})
                </span>
                <span>•</span>
                <span>Khối 11 - Lớp 11A1</span>
                <span>•</span>
                <span>{subject.description}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/student/materials")}
            className="text-slate-700 font-medium self-start md:self-center"
          >
            <Icon name="arrow-left" size={14} />
            <span>{t("card:materials.header.backToSubjects", "Quay lại danh mục môn học")}</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <MaterialSummaryCards summary={summary} loading={loading && !summary} />

      {/* 3. Filter Bar */}
      <MaterialFilterBar
        filter={filter}
        summary={summary}
        onSearchChange={setSearchQuery}
        onAcademicYearChange={setAcademicYear}
        onCategoryChange={setCategory}
        onSemesterChange={setSemester}
        onSortByChange={setSortBy}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. Multi-selection Bar */}
      <MaterialSelectionBar
        selectedCount={selectedIds.length}
        totalOnPage={materials.length}
        isAllSelected={isAllCurrentPageSelected}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDownloadSelected={downloadSelected}
        onDownloadAll={downloadAll}
      />

      {/* 4. Results Area */}
      {materials.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  {t("card:materials.empty.noMaterialsTitle", "Không tìm thấy tài liệu phù hợp")}
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? t("card:materials.empty.noMaterialsDesc", "Không có tài liệu nào khớp với các điều kiện lọc đã chọn.")
                    : "Hiện tại môn học này chưa có tài liệu nào."}
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
                {t("card:materials.empty.resetFilterBtn", "Đặt lại tất cả bộ lọc")}
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
              onClick={(mat) => navigate(`/student/materials/${mat.id}`)}
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
              onClick={(mat) => navigate(`/student/materials/${mat.id}`)}
            />
          ))}
        </div>
      )}

      {/* 5. Synchronized Pagination */}
      <MaterialsPagination
        current={filter.page}
        pageSize={filter.pageSize}
        total={total}
        itemsCount={materials.length}
        onChange={(page, pageSize) => setPage(page, pageSize)}
      />
    </div>
  );
};

export default SubjectMaterialsPage;
