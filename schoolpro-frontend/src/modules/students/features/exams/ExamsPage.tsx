import React from "react";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Icon } from "@/components/ui/Icon";
import {
  ExamSummaryCards,
  ExamFilterBar,
  ExamCard,
} from "@/modules/students/features/exams/components";
import { useExams } from "@/modules/students/features/exams/hooks";
import type { ExamItem } from "@/modules/students/features/exams/types";

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter,
    exams,
    summary,
    loading,
    setFilterStatus,
    setSearch,
    resetFilters,
  } = useExams();

  const handleOpenExam = (item: ExamItem) => {
    navigate(`/student/exams/${item.id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
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
                  <Icon name="fileText" size={13} className="text-blue-600 shrink-0" />
                  <span>Khảo thí & Đề thi</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Khảo thí & Đề thi Trắc nghiệm
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp 11A1
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Học kỳ 1 • 2025-2026
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Học sinh: Nguyễn Văn An
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Hệ thống thi trắc nghiệm trực tuyến tính giờ, tự động lưu câu trả lời và chấm điểm tức thì sau khi nộp
          </p>
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      {summary && <ExamSummaryCards summary={summary} />}

      {/* 3. Navigation Tabs & Auto-focus Search */}
      <ExamFilterBar
        filter={filter}
        summary={summary}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearch}
        onReset={resetFilters}
      />

      {/* 4. Exam List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs animate-pulse"
            >
              <div className="h-5 w-1/3 bg-slate-200 rounded" />
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((item) => (
            <ExamCard key={item.id} item={item} onOpen={handleOpenExam} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <p className="text-slate-700 font-semibold text-sm">
                  {filter.status === "pending"
                    ? "Không có đề thi nào cần thực hiện"
                    : filter.status === "completed"
                    ? "Bạn chưa hoàn thành đề thi nào"
                    : "Không tìm thấy đề thi phù hợp với bộ lọc"}
                </p>
                <p className="text-xs text-slate-400">
                  {filter.status === "pending"
                    ? "Tất cả các đề thi của học kỳ hiện tại đã được nộp thành công."
                    : "Hãy thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc."}
                </p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};
