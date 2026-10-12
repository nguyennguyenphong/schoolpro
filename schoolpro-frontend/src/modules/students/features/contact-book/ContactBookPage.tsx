import React, { useState } from "react";
import { message } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  ContactBookSkeleton,
  ContactBookFilterBar,
  OverviewTabView,
  WeeklyReportListView,
  SubjectFeedbackListView,
  ParentExchangeView,
  ParentFeedbackModal,
} from "@/modules/students/features/contact-book/components";
import { useContactBook } from "@/modules/students/features/contact-book/hooks";

export const ContactBookPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedWeek,
    setSelectedWeek,
    resetFilters,
    summary,
    weeklyReports,
    subjectFeedbacks,
    parentNotes,
    loading,
    submitting,
    handleConfirmReport,
    handleAddParentNote,
  } = useContactBook();

  // Feedback / Confirmation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetWeek, setTargetWeek] = useState<number | undefined>(undefined);

  const handleOpenFeedbackModal = () => {
    setTargetWeek(undefined);
    setIsModalOpen(true);
  };

  const handleOpenConfirmWeeklyModal = (weekNum: number) => {
    setTargetWeek(weekNum);
    setIsModalOpen(true);
  };

  const handleExportPdf = () => {
    message.success("Đang chuẩn bị file Sổ liên lạc điện tử PDF có chữ ký số...");
    setTimeout(() => {
      message.info("Tải xuống bản in Sổ liên lạc điện tử thành công.");
    }, 1000);
  };

  if (loading && !summary) {
    return <ContactBookSkeleton />;
  }

  const hasFilters = Boolean(searchQuery.trim() || selectedWeek !== "all");

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-12 w-full">
      {/* 1. Page Header with integrated Breadcrumb & Key Metrics */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-3.5">
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
                  <Icon name="book" size={13} className="text-blue-600 shrink-0" />
                  <span>Sổ liên lạc điện tử</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                Sổ Liên Lạc Điện Tử
              </h1>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Lớp {summary?.className || "11A1"}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#f0f0f0]">
                {summary?.academicYear || "2025 - 2026"}
              </span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {summary?.studentCode || "HS202688"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Sổ theo dõi kết quả rèn luyện, học tập và phối hợp giáo dục giữa Nhà trường, Giáo viên chủ nhiệm và Cha Mẹ học sinh
            </p>
          </div>

          {/* Quick status badges & Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {summary && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-[#f0f0f0] text-xs">
                <span className="text-slate-500">GPA: <strong className="text-blue-600">{summary.currentGpa.toFixed(1)}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Hạnh kiểm: <strong className="text-emerald-600">{summary.conduct}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Chuyên cần: <strong className="text-amber-600">{summary.attendanceRate}%</strong></span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleExportPdf}
              className="text-slate-700 font-semibold text-xs"
            >
              <Icon name="download" size={14} />
              <span>In sổ</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenFeedbackModal}
              className="font-semibold text-xs"
            >
              <Icon name="edit" size={14} />
              <span>Ghi ý kiến vào sổ</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <ContactBookFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        onResetFilters={resetFilters}
        summary={summary}
        onOpenFeedbackModal={handleOpenFeedbackModal}
      />

      {/* 3. Tab Content Views */}
      {summary && (
        <div className="pt-1">
          {activeTab === "overview" && (
            <OverviewTabView
              summary={summary}
              onSelectTab={setActiveTab}
              onOpenFeedbackModal={handleOpenFeedbackModal}
            />
          )}

          {activeTab === "weekly" && (
            <WeeklyReportListView
              reports={weeklyReports}
              onOpenConfirmModal={handleOpenConfirmWeeklyModal}
              onResetFilters={resetFilters}
              hasFilters={hasFilters}
            />
          )}

          {activeTab === "subjects" && (
            <SubjectFeedbackListView
              feedbacks={subjectFeedbacks}
              searchQuery={searchQuery}
              onResetFilters={resetFilters}
            />
          )}

          {activeTab === "feedback" && (
            <ParentExchangeView
              parentNotes={parentNotes}
              onAddParentNote={handleAddParentNote}
              onOpenFeedbackModal={handleOpenFeedbackModal}
              submitting={submitting}
            />
          )}
        </div>
      )}

      {/* 4. Parent Feedback & Confirmation Modal */}
      <ParentFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetWeek={targetWeek}
        onConfirmWeeklyReport={handleConfirmReport}
        onSendMessage={handleAddParentNote}
        submitting={submitting}
      />
    </div>
  );
};

export default ContactBookPage;
