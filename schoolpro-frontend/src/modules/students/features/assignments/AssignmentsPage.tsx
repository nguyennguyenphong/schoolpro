import React from "react";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  AssignmentSummaryCards,
  AssignmentFilterBar,
  AssignmentCard,
  AssignmentListItem,
  AssignmentSkeleton,
} from "@/modules/students/features/assignments/components";
import { useAssignments } from "@/modules/students/features/assignments/hooks";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    assignments,
    summary,
    filter,
    loading,
    error,
    hasActiveFilters,
    setSubject,
    setStatus,
    setType,
    setSearchQuery,
    setViewMode,
    resetFilters,
    refetch,
  } = useAssignments();

  const handleOpenAssignment = (item: AssignmentItem) => {
    navigate(`/student/assignments/${item.id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with integrated Breadcrumb */}
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
                  <Icon name="edit" size={13} className="text-blue-600 shrink-0" />
                  <span>Bài tập & Nhiệm vụ học tập</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Bài tập & Nhiệm vụ Học tập
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp 11A1
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              HK1 • 2025-2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Theo dõi bài tập về nhà, bài kiểm tra trực tuyến, báo cáo thực hành và tiến độ nộp bài các môn học
          </p>
        </div>
      </div>

      {/* 2. Overview Summary Cards (Dashboard & Announcements style) */}
      <AssignmentSummaryCards summary={summary} />

      {/* 3. Filter Bar (Search, Subject, Status, Type, and View Mode) */}
      <AssignmentFilterBar
        subject={filter.subject}
        status={filter.status}
        type={filter.type}
        searchQuery={filter.searchQuery}
        viewMode={filter.viewMode}
        hasActiveFilters={hasActiveFilters}
        onSubjectChange={setSubject}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
      />

      {/* 4. Assignment Results: Grid or List view */}
      {loading && assignments.length === 0 ? (
        <AssignmentSkeleton />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không thể tải danh sách bài tập
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error.message || "Đã xảy ra lỗi khi tải dữ liệu bài tập. Vui lòng thử lại."}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Tải lại dữ liệu
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Không tìm thấy bài tập phù hợp
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Không có bài tập nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại."
                    : "Hiện tại chưa có bài tập nào được giao."}
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
                Đặt lại bộ lọc
              </Button>
            )}
          </Empty>
        </div>
      ) : filter.viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              onClick={handleOpenAssignment}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => (
            <AssignmentListItem
              key={item.id}
              assignment={item}
              onClick={handleOpenAssignment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
