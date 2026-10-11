import { Alert, Col, Row } from "antd";
import type React from "react";
import { useNavigate } from "react-router-dom";
import {
  LeaveRequestCard,
  LeaveRequestFilterBar,
  LeaveRequestListItem,
  LeaveRequestSkeleton,
  LeaveRequestsEmptyState,
  LeaveRequestsPageHeader,
  LeaveRequestsPagination,
  LeaveRequestSummaryCards,
} from "@/modules/students/features/leave-requests/components";
import { useLeaveRequests } from "@/modules/students/features/leave-requests/hooks";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

const LeaveRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    items,
    total,
    summary,
    filter,
    loading,
    error,
    hasActiveFilters,
    setStatus,
    setLeaveType,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
  } = useLeaveRequests();

  const handleOpenCreatePage = () => {
    navigate("/student/leave-requests/create");
  };

  const handleViewDetailPage = (item: LeaveRequestItem) => {
    navigate(`/student/leave-requests/${item.id}`);
  };

  return (
    <div className="space-y-4 pb-6">
      <LeaveRequestsPageHeader
        summary={summary}
        loading={loading}
        onCreateClick={handleOpenCreatePage}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          title="Không thể tải danh sách đơn xin nghỉ phép"
          description={error.message}
          className="rounded-xl"
        />
      )}

      <LeaveRequestSummaryCards summary={summary} loading={loading} />

      <LeaveRequestFilterBar
        status={filter.status}
        leaveType={filter.leaveType}
        searchQuery={filter.searchQuery}
        sortBy={filter.sortBy}
        viewMode={filter.viewMode}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setStatus}
        onLeaveTypeChange={setLeaveType}
        onSearchChange={setSearchQuery}
        onSortByChange={setSortBy}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
      />

      {loading ? (
        <LeaveRequestSkeleton />
      ) : items.length === 0 ? (
        <LeaveRequestsEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          onCreateClick={handleOpenCreatePage}
        />
      ) : filter.viewMode === "grid" ? (
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={24} md={12} xl={8} key={item.id}>
              <LeaveRequestCard item={item} onViewDetail={handleViewDetailPage} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <LeaveRequestListItem
              key={item.id}
              item={item}
              onViewDetail={handleViewDetailPage}
            />
          ))}
        </div>
      )}

      {!loading && total > 0 && (
        <LeaveRequestsPagination
          current={filter.page}
          pageSize={filter.pageSize}
          total={total}
          itemsCount={items.length}
          onChange={setPage}
        />
      )}
    </div>
  );
};

export default LeaveRequestsPage;
