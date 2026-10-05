import React from "react";
import { Empty, Pagination } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  AnnouncementSummaryCards,
  AnnouncementFilterBar,
  AnnouncementSelectionBar,
  AnnouncementCard,
  AnnouncementListItem,
  AnnouncementDetailModal,
  AnnouncementsSkeleton,
} from "@/modules/students/features/announcements/components";
import { useAnnouncements } from "@/modules/students/features/announcements/hooks";

export const AnnouncementsPage: React.FC = () => {
  const {
    announcements,
    total,
    summary,
    departments,
    categories,
    loading,
    filter,
    selectedAnnouncement,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
    unreadOnPageCount,
    setSearchQuery,
    setCategory,
    setDepartment,
    setReadStatus,
    setPriority,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    markSelectedAsRead,
    markSelectedAsUnread,
    openDetail,
    closeDetail,
  } = useAnnouncements();

  const hasActiveFilters = Boolean(
    filter.searchQuery.trim() ||
      filter.category !== "all" ||
      filter.department !== "all" ||
      filter.readStatus !== "all" ||
      filter.priority !== "all" ||
      filter.sortBy !== "newest",
  );

  if (loading && announcements.length === 0) {
    return <AnnouncementsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
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
                  <Icon name="info" size={13} className="text-blue-600 shrink-0" />
                  <span>Bảng tin & Thông báo</span>
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
                Bảng tin & Thông báo học vụ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Theo dõi văn bản chỉ đạo, lịch khảo thí, học phí và các hoạt động phong trào toàn trường
            </p>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards (Dashboard style) */}
      {summary && (
        <AnnouncementSummaryCards
          summary={summary}
        />
      )}

      {/* 3. Search & Filter Bar (Always auto-focus on input, syncs with URL) */}
      <AnnouncementFilterBar
        filter={filter}
        summary={summary}
        departments={departments}
        categories={categories}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategory}
        onDepartmentChange={setDepartment}
        onReadStatusChange={setReadStatus}
        onPriorityChange={setPriority}
        onSortByChange={setSortBy}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Multi-selection Bar (Shows when items are checked) */}
      <AnnouncementSelectionBar
        selectedCount={selectedIds.length}
        totalOnPage={unreadOnPageCount}
        isAllSelected={isAllCurrentPageSelected}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onMarkAsRead={markSelectedAsRead}
        onMarkAsUnread={markSelectedAsUnread}
      />

      {/* 5. Results Area */}
      {announcements.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Không tìm thấy thông báo phù hợp
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Không có thông báo nào khớp với các bộ lọc đã chọn. Vui lòng thử lại với từ khóa hoặc điều kiện khác."
                    : "Hiện tại chưa có thông báo nào trong hệ thống."}
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
          {announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onClick={openDetail}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {announcements.map((item) => (
            <AnnouncementListItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onClick={openDetail}
            />
          ))}
        </div>
      )}

      {/* 6. Pagination with Border Framing (Responsive & Clean) */}
      {total > 0 && (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Hiển thị <strong className="text-slate-800">{announcements.length}</strong> trên tổng số{" "}
            <strong className="text-slate-800">{total}</strong> thông báo
          </div>

          <Pagination
            current={filter.page}
            pageSize={filter.pageSize}
            total={total}
            onChange={(page, pageSize) => setPage(page, pageSize)}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      )}

      {/* 7. Detail Modal */}
      <AnnouncementDetailModal
        item={selectedAnnouncement}
        isOpen={isDetailOpen}
        onClose={closeDetail}
      />
    </div>
  );
};
