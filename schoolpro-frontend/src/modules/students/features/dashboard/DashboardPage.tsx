import React from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  StudentProfileBanner,
  DashboardFilterBar,
  MetricCards,
  GpaTrendChart,
  SubjectScoreComparisonChart,
  ClassRankDistributionChart,
  SubjectGroupChart,
  CompetencyRadarChart,
  AttendanceConductCard,
  SubjectGradesTable,
  DashboardSkeleton,
} from "@/modules/students/features/dashboard/components";
import { useDashboard } from "@/modules/students/features/dashboard/hooks";

export const DashboardPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    academicYear,
    semester,
    setAcademicYear,
    setSemester,
    resetFilters,
    refetch,
  } = useDashboard();

  if (loading && !data) {
    return (
      <div className="space-y-4 sm:space-y-5 pb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-7 w-72 bg-slate-200 rounded animate-pulse" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 sm:space-y-5 pb-8">
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs my-6">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không thể tải dữ liệu thống kê
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error?.message || "Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại sau."}
          </p>
          <Button
            variant="primary"
            size="small"
            onClick={refetch}
          >
            <Icon name="refresh" size={13} className="mr-1.5" />
            Tải lại dữ liệu
          </Button>
        </div>
      </div>
    );
  }

  const currentSemesterLabel =
    semester === "hk1"
      ? `Học kỳ 1 (${academicYear})`
      : semester === "hk2"
        ? `Học kỳ 2 (${academicYear})`
        : `Cả năm học (${academicYear})`;

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
                  <Icon name="chart" size={13} className="text-blue-600 shrink-0" />
                  <span>Thống kê & Đánh giá học tập</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Thống kê & Đánh giá Học tập
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp {data.studentProfile.className}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {data.studentProfile.academicYear}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Báo cáo tổng quan học lực, kết quả rèn luyện, chuyên cần và bảng điểm chi tiết các môn học của học sinh
          </p>
        </div>
      </div>

      {/* 2. Complete High School Student Profile Overview Banner */}
      <StudentProfileBanner
        profile={data.studentProfile}
        overview={data.overview}
      />

      {/* 3. Filter Bar (Select by School Year & Semester) */}
      <DashboardFilterBar
        academicYear={academicYear}
        semester={semester}
        onYearChange={setAcademicYear}
        onSemesterChange={setSemester}
        onResetFilters={resetFilters}
      />

      {/* 4. Core Metric Cards (Style synchronized with AnnouncementSummaryCards) */}
      <MetricCards overview={data.overview} />

      {/* 5. Main Charts Row 1: GPA Trend (2 cols) & Class Rank Distribution (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 min-w-0">
          <GpaTrendChart data={data.semesterHistory} />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <ClassRankDistributionChart
            data={data.classGradeDistribution}
            studentRank={data.overview.classRank}
          />
        </div>
      </div>

      {/* 6. Detailed Subject Score Comparison Chart (Full width on large screens) */}
      <div className="min-w-0">
        <SubjectScoreComparisonChart data={data.subjectScoreComparisons} />
      </div>

      {/* 7. Comprehensive Capabilities, Groups & Attendance Row (3 equal responsive cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="min-w-0">
          <SubjectGroupChart data={data.subjectGroupPerformance} />
        </div>
        <div className="min-w-0">
          <CompetencyRadarChart data={data.competencyAssessments} />
        </div>
        <div className="md:col-span-2 lg:col-span-1 min-w-0">
          <AttendanceConductCard
            attendance={data.attendanceDetail}
            overview={data.overview}
          />
        </div>
      </div>

      {/* 8. Detailed High School Subject Grades Table */}
      <SubjectGradesTable
        grades={data.subjectGrades}
        semesterName={currentSemesterLabel}
      />
    </div>
  );
};
