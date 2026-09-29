import React from "react";
import { useNavigate } from "react-router-dom";
import { Empty, Pagination } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import {
  MaterialFilterBar,
  MaterialSelectionBar,
  MaterialCard,
  MaterialListItem,
  MaterialsSkeleton,
} from "@/modules/students/features/materials/components";
import { useSubjectMaterials } from "@/modules/students/features/materials/hooks";

export const SubjectMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
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
    toggleBookmark,
  } = useSubjectMaterials();

  const hasActiveFilters = Boolean(
    filter.searchQuery.trim() ||
      filter.category !== "all" ||
      filter.semester !== "all" ||
      filter.sortBy !== "newest",
  );

  if (loading && materials.length === 0) {
    return <MaterialsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Header with Breadcrumb and Subject Info */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              href: "/student/materials",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="download" size={13} className="text-slate-400 shrink-0" />
                  <span>Kho tài liệu</span>
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
                title="Quay lại danh sách môn học"
              >
                <Icon name="arrow-left" size={18} />
              </Button>

              <span className="w-1.5 h-6 rounded-full bg-blue-600 inline-block" />

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0 leading-tight">
                {subject ? subject.name : `Tài liệu môn ${subjectCode}`}
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
                <span>Lớp 11A1</span>
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
            <Icon name="arrow-left" size={14} className="mr-1.5" />
            Đổi môn học khác
          </Button>
        </div>

        {/* Quick summary stats strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Tổng số tài liệu:</span>
              <strong className="text-slate-800 text-sm">{summary.total}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Bài giảng điện tử:</span>
              <strong className="text-blue-600 text-sm">{summary.lecturesCount}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Đề cương & Đề thi:</span>
              <strong className="text-orange-600 text-sm">{summary.outlinesCount + summary.examPrepsCount}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Lượt tải về:</span>
              <strong className="text-emerald-600 text-sm">{summary.totalDownloads}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter Bar (BỎ field Định dạng, có search, category, semester, sort, viewMode) */}
      <MaterialFilterBar
        filter={filter}
        onSearchChange={setSearchQuery}
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
      />

      {/* 4. Results Area (NO MODAL, direct download) */}
      {materials.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Không tìm thấy tài liệu phù hợp trong môn học này
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Không có tài liệu nào khớp với các điều kiện lọc đã chọn. Hãy thử tìm kiếm bằng từ khóa hoặc điều kiện khác."
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
                Đặt lại tất cả bộ lọc
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
            />
          ))}
        </div>
      )}

      {/* 5. Pagination with Border Framing */}
      {total > 0 && (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Hiển thị <strong className="text-slate-800">{materials.length}</strong> trên tổng số{" "}
            <strong className="text-slate-800">{total}</strong> tài liệu môn {subject?.name || subjectCode}
          </div>

          <Pagination
            current={filter.page}
            pageSize={filter.pageSize}
            total={total}
            onChange={(page, pageSize) => setPage(page, pageSize)}
            showSizeChanger
            pageSizeOptions={["6", "9", "18", "36"]}
          />
        </div>
      )}
    </div>
  );
};
export default SubjectMaterialsPage;
