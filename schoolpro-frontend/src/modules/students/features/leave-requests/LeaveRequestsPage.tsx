import type React from "react";
import { Alert } from "@/components/ui/Alert";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LeaveRequestCard,
  LeaveRequestFilterBar,
  LeaveRequestSkeleton,
  LeaveRequestsEmptyState,
  LeaveRequestsPageHeader,
  LeaveRequestsPagination,
  LeaveRequestSummaryCards,
} from "@/modules/students/features/leave-requests/components";
import { useLeaveRequests } from "@/modules/students/features/leave-requests/hooks";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

const LeaveRequestsPage: React.FC = () => {
  const { t } = useTranslation(["message"]);
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
    <div className="flex flex-col gap-4 pb-6">
      <LeaveRequestsPageHeader
        onCreateClick={handleOpenCreatePage}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          title={t("message:failedToLoadLeaveRequests")}
          description={error.message}
          className="rounded-xl"
        />
      )}

      <LeaveRequestSummaryCards summary={summary} loading={loading && !summary} />

      <LeaveRequestFilterBar
        status={filter.status}
        leaveType={filter.leaveType}
        searchQuery={filter.searchQuery}
        sortBy={filter.sortBy}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setStatus}
        onLeaveTypeChange={setLeaveType}
        onSearchChange={setSearchQuery}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
      />

      {loading && items.length === 0 ? (
        <LeaveRequestSkeleton />
      ) : items.length === 0 ? (
        <LeaveRequestsEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          onCreateClick={handleOpenCreatePage}
        />
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {items.map((item) => (
            <LeaveRequestCard key={item.id} item={item} onViewDetail={handleViewDetailPage} />
          ))}
        </div>
      )}

      {total > 0 && (
        <div
          className={`transition-opacity duration-200 ${
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          <LeaveRequestsPagination
            current={filter.page}
            pageSize={filter.pageSize}
            total={total}
            itemsCount={items.length}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsPage;
