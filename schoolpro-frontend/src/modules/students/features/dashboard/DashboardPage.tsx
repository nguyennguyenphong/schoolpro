import React from "react";
import { Select } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  MetricCards,
  GpaTrendChart,
  CreditDistributionChart,
  CompetencyRadarChart,
  GradeDistributionChart,
  RecentCoursesTable,
  DashboardSkeleton,
} from "@/modules/students/features/dashboard/components";
import { useDashboard } from "@/modules/students/features/dashboard/hooks";

export const DashboardPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    selectedSemester,
    setSelectedSemester,
    refetch,
  } = useDashboard();

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <Icon name="warning" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Không thể tải dữ liệu thống kê
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          {typeof error === "string" ? error : error?.message || "Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại sau."}
        </p>
        <Button
          variant="primary"
          icon={<Icon name="refresh" size={14} />}
          onClick={refetch}
          className="rounded-lg"
        >
          Tải lại dữ liệu
        </Button>
      </div>
    );
  }

  const semesterOptions = [
    { value: "all", label: "Toàn khóa học (Tích lũy)" },
    ...data.semesterHistory.map((s) => ({
      value: s.semesterId,
      label: s.semesterName,
    })),
  ];

  const currentSemesterLabel =
    data.semesterHistory.find((s) => s.semesterId === selectedSemester)
      ?.semesterName || "Học kỳ 2 (2025-2026)";

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 mb-0">
              Bảng Thống kê & Phân tích Học tập
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Thống kê Học tập
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            Tổng quan kết quả rèn luyện, năng lực chuyên môn và tiến độ hoàn thành chương trình
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Kỳ học:
            </span>
            <Select
              value={selectedSemester}
              onChange={setSelectedSemester}
              options={semesterOptions}
              className="w-52"
              size="middle"
            />
          </div>

          <Button
            variant="outline"
            icon={<Icon name="refresh" size={14} className={loading ? "animate-spin" : ""} />}
            onClick={refetch}
            disabled={loading}
            className="rounded-lg"
            title="Làm mới thống kê"
          />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <MetricCards overview={data.overview} />

      {/* Main Charts Row: GPA Trend (2 cols) & Credit Distribution (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <GpaTrendChart data={data.semesterHistory} />
        </div>
        <div className="lg:col-span-1">
          <CreditDistributionChart data={data.creditDistribution} />
        </div>
      </div>

      {/* Secondary Charts Row: Competency Radar & Grade Letter Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CompetencyRadarChart data={data.competencyRadar} />
        <GradeDistributionChart data={data.gradeDistribution} />
      </div>

      {/* Academic Results Table */}
      <RecentCoursesTable
        courses={data.recentCourses}
        semesterName={currentSemesterLabel}
      />
    </div>
  );
};
