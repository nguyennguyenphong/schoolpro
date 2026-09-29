import React from "react";
import { Empty } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  GradeSummaryCards,
  GradeTableView,
  SubjectGradeDetailModal,
  GradeTranscriptModal,
  GradeSkeleton,
} from "@/modules/students/features/gradebook/components";
import { useGradebook } from "@/modules/students/features/gradebook/hooks";

export const GradebookPage: React.FC = () => {
  const {
    grades,
    summary,
    loading,
    error,
    selectedSubject,
    isDetailModalOpen,
    isTranscriptModalOpen,
    openSubjectDetail,
    closeSubjectDetail,
    openTranscriptModal,
    closeTranscriptModal,
    handleExportPdf,
    resetFilters,
  } = useGradebook();

  if (loading && grades.length === 0) {
    return <GradeSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
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
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="chart" size={13} className="text-blue-600 shrink-0" />
                  <span>Bảng điểm & Học bạ</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                Bảng điểm & Học bạ Điện tử
              </h1>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Lớp 11A1
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Học kỳ 1 • 2025-2026
              </span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 font-mono">
                Mã HS: SV202688
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Bảng điểm chi tiết kết quả học tập và rèn luyện chính thức của học sinh theo Thông tư số 22/2021/TT-BGDĐT
            </p>
          </div>

          {/* Action buttons (No className mr on Icon) */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              onClick={openTranscriptModal}
              className="text-slate-700 font-semibold"
            >
              <Icon name="fileText" size={15} />
              <span>Xem Học bạ Điện tử</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPdf}
              className="font-semibold"
            >
              <Icon name="download" size={15} />
              <span>Tải PDF Ký số</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Overview Summary Cards (Designed identically to AnnouncementsPage) */}
      {summary && <GradeSummaryCards summary={summary} />}

      {/* 3. Detailed Grade Table with visible borders for easy viewing */}
      {error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không thể tải bảng điểm học bạ
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error || "Đã xảy ra lỗi khi tải dữ liệu kết quả học tập. Vui lòng thử lại."}
          </p>
          <Button variant="primary" onClick={resetFilters}>
            Tải lại dữ liệu
          </Button>
        </div>
      ) : grades.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Chưa có dữ liệu bảng điểm
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  Hiện tại nhà trường chưa cập nhật bảng điểm cho học kỳ này.
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <GradeTableView
          grades={grades}
          summary={summary}
          onOpenDetail={openSubjectDetail}
        />
      )}

      {/* 4. Modals */}
      <SubjectGradeDetailModal
        isOpen={isDetailModalOpen}
        item={selectedSubject}
        onClose={closeSubjectDetail}
      />

      <GradeTranscriptModal
        isOpen={isTranscriptModalOpen}
        grades={grades}
        summary={summary}
        onClose={closeTranscriptModal}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
};

export default GradebookPage;
