import React from "react";
import { useSearchParams } from "react-router-dom";
import { Empty, Pagination } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  MaterialSummaryCards,
  MaterialFilterBar,
  SubjectFilterBar,
  MaterialSelectionBar,
  SubjectCard,
  SubjectListItem,
  MaterialCard,
  MaterialListItem,
  MaterialDetailModal,
  MaterialsSkeleton,
} from "@/modules/students/features/materials/components";
import { useMaterials, useSubjects } from "@/modules/students/features/materials/hooks";

export const MaterialsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as "subjects" | "all") || "subjects";

  // 1. Data hooks
  const {
    subjects,
    total: subjectsTotal,
    loading: subjectsLoading,
    filter: subjectFilter,
    setSearchQuery: setSubjectSearch,
    setSemester: setSubjectSemester,
    setSortBy: setSubjectSortBy,
    setViewMode: setSubjectViewMode,
    setPage: setSubjectPage,
    resetFilters: resetSubjectFilters,
  } = useSubjects();

  const {
    materials,
    total: materialsTotal,
    summary,
    subjects: availableSubjects,
    loading: materialsLoading,
    filter: materialFilter,
    selectedMaterial,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery: setMaterialSearch,
    setSubject: setMaterialSubject,
    setCategory: setMaterialCategory,
    setSemester: setMaterialSemester,
    setSortBy: setMaterialSortBy,
    setViewMode: setMaterialViewMode,
    setPage: setMaterialPage,
    resetFilters: resetMaterialFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    downloadSelected,
    downloadMaterial,
    toggleBookmark,
    openDetail,
    closeDetail,
  } = useMaterials();

  const handleTabChange = (tab: "subjects" | "all") => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "subjects") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const hasActiveSubjectFilters = Boolean(
    subjectFilter.searchQuery.trim() ||
      subjectFilter.semester !== "all" ||
      subjectFilter.sortBy !== "name_asc",
  );

  const hasActiveMaterialFilters = Boolean(
    materialFilter.searchQuery.trim() ||
      materialFilter.subject !== "all" ||
      materialFilter.category !== "all" ||
      materialFilter.semester !== "all" ||
      materialFilter.sortBy !== "newest",
  );

  const isLoading = currentTab === "subjects" ? subjectsLoading : materialsLoading;

  if (isLoading && ((currentTab === "subjects" && subjects.length === 0) || (currentTab === "all" && materials.length === 0))) {
    return <MaterialsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f0f0f0] shadow-2xs space-y-2">
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
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="download" size={13} className="text-blue-600 shrink-0" />
                  <span>Kho tài liệu học tập</span>
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
                Kho tài liệu & Bài giảng số
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Tra cứu và tải xuống sách giáo khoa, đề cương ôn tập, bài giảng điện tử và đề thi của các bộ môn
            </p>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards (Dashboard style) */}
      {summary && <MaterialSummaryCards summary={summary} />}

      {/* 3. Navigation View Switcher (Theo môn học vs Tất cả tài liệu) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#f0f0f0] shadow-2xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleTabChange("subjects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentTab === "subjects"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Icon
            name="book"
            size={14}
            className={currentTab === "subjects" ? "text-white" : "text-slate-400"}
          />
          <span>Danh mục theo môn học</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
              currentTab === "subjects"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
            }`}
          >
            {subjectsTotal || 10} môn
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentTab === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Icon
            name="fileText"
            size={14}
            className={currentTab === "all" ? "text-white" : "text-slate-400"}
          />
          <span>Tất cả tài liệu</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
              currentTab === "all"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
            }`}
          >
            {materialsTotal} tài liệu
          </span>
        </button>
      </div>

      {/* 4. Content Area based on Tab */}
      {currentTab === "subjects" ? (
        /* TAB 1: DANH MỤC THEO MÔN HỌC */
        <div className="space-y-4 sm:space-y-5">
          <SubjectFilterBar
            filter={subjectFilter}
            totalSubjects={subjectsTotal}
            onSearchChange={setSubjectSearch}
            onSemesterChange={setSubjectSemester}
            onSortByChange={setSubjectSortBy}
            onViewModeChange={setSubjectViewMode}
            onResetFilters={resetSubjectFilters}
            hasActiveFilters={hasActiveSubjectFilters}
          />

          {subjects.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
              <Empty
                description={
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-700 mb-0">
                      Không tìm thấy môn học phù hợp
                    </p>
                    <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                      {hasActiveSubjectFilters
                        ? "Không có môn học nào khớp với từ khóa hoặc điều kiện lọc đã chọn."
                        : "Hiện tại chưa có môn học nào trong danh mục."}
                    </p>
                  </div>
                }
              >
                {hasActiveSubjectFilters && (
                  <Button
                    variant="outline"
                    onClick={resetSubjectFilters}
                    className="mt-3"
                  >
                    Đặt lại bộ lọc
                  </Button>
                )}
              </Empty>
            </div>
          ) : subjectFilter.viewMode === "list" ? (
            <div className="flex flex-col gap-3 sm:gap-3.5">
              {subjects.map((item) => (
                <SubjectListItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((item) => (
                <SubjectCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Phân trang danh sách môn học */}
          {subjectsTotal > 0 && (
            <div className="p-3.5 bg-white rounded-xl border border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Hiển thị <strong className="text-slate-800">{subjects.length}</strong> trên tổng số{" "}
                <strong className="text-slate-800">{subjectsTotal}</strong> môn học
              </div>

              <Pagination
                current={subjectFilter.page}
                pageSize={subjectFilter.pageSize}
                total={subjectsTotal}
                onChange={(page, pageSize) => setSubjectPage(page, pageSize)}
                showSizeChanger
                pageSizeOptions={["6", "9", "12", "18"]}
              />
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: TẤT CẢ TÀI LIỆU */
        <div className="space-y-4 sm:space-y-5">
          {/* Multi-criteria Filter Bar */}
          <MaterialFilterBar
            filter={materialFilter}
            summary={summary}
            subjects={availableSubjects}
            onSearchChange={setMaterialSearch}
            onSubjectChange={setMaterialSubject}
            onCategoryChange={setMaterialCategory}
            onSemesterChange={setMaterialSemester}
            onSortByChange={setMaterialSortBy}
            onViewModeChange={setMaterialViewMode}
            onResetFilters={resetMaterialFilters}
            hasActiveFilters={hasActiveMaterialFilters}
          />

          {/* Multi-selection Bar */}
          <MaterialSelectionBar
            selectedCount={selectedIds.length}
            totalOnPage={materials.length}
            isAllSelected={isAllCurrentPageSelected}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onDownloadSelected={downloadSelected}
          />

          {/* Results Area */}
          {materials.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
              <Empty
                description={
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-700 mb-0">
                      Không tìm thấy tài liệu phù hợp
                    </p>
                    <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                      {hasActiveMaterialFilters
                        ? "Không có tài liệu nào khớp với các điều kiện lọc đã chọn. Hãy thử tìm kiếm bằng từ khóa hoặc điều kiện khác."
                        : "Hiện tại chưa có tài liệu nào trong danh mục này."}
                    </p>
                  </div>
                }
              >
                {hasActiveMaterialFilters && (
                  <Button
                    variant="outline"
                    onClick={resetMaterialFilters}
                    className="mt-3"
                  >
                    Đặt lại tất cả bộ lọc
                  </Button>
                )}
              </Empty>
            </div>
          ) : materialFilter.viewMode === "grid" ? (
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

          {/* Phân trang danh sách tài liệu */}
          {materialsTotal > 0 && (
            <div className="p-3.5 bg-white rounded-xl border border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Hiển thị <strong className="text-slate-800">{materials.length}</strong> trên tổng số{" "}
                <strong className="text-slate-800">{materialsTotal}</strong> tài liệu học tập
              </div>

              <Pagination
                current={materialFilter.page}
                pageSize={materialFilter.pageSize}
                total={materialsTotal}
                onChange={(page, pageSize) => setMaterialPage(page, pageSize)}
                showSizeChanger
                pageSizeOptions={["9", "18", "36", "72"]}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Detail Modal */}
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
