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
    loading,
    filter,
    selectedAnnouncement,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
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
      {/* 0. Breadcrumb Navigation */}
      <div className="flex items-center justify-between py-2 px-3.5 rounded-md bg-white border border-slate-200">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="flex items-center gap-1.5">
                  <Icon name="home" size={14} className="text-slate-400 shrink-0" />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              title: (
                <span className="flex items-center gap-1.5">
                  <Icon name="info" size={14} className="text-blue-600 shrink-0" />
                  <span>Bảng tin & Thông báo</span>
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* 1. Header Section with clean border separation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
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

      {/* 2. Summary Metric Cards (Equal Height & Bordered) */}
      {summary && (
        <AnnouncementSummaryCards
          summary={summary}
          onFilterUnread={() => setReadStatus("unread")}
          onFilterUrgent={() => setPriority("urgent")}
          onFilterAcademic={() => setCategory("exam")}
        />
      )}

      {/* 3. Search & Filter Bar (Always auto-focus on input, syncs with URL) */}
      <AnnouncementFilterBar
        filter={filter}
        departments={departments}
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
        totalOnPage={announcements.length}
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
                className="text-xs font-semibold mt-3"
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
        <div className="space-y-3">
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
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
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
            pageSizeOptions={["6", "9", "12", "18"]}            
            className="text-xs"
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
