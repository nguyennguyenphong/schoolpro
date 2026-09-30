import React, { useState } from "react";
import { message } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  ContactBookSkeleton,
  ContactBookSummaryCards,
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
    messages,
    loading,
    submitting,
    handleConfirmReport,
    handleSendMessage,
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
                  <Icon name="book" size={13} className="text-blue-600 shrink-0" />
                  <span>Sổ liên lạc điện tử</span>
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
                Sổ Liên Lạc Điện Tử
              </h1>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Lớp {summary?.className || "11A1"}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {summary?.academicYear || "2025 - 2026"}
              </span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 font-mono">
                {summary?.studentCode || "HS202688"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Kênh thông tin kết nối chính thức giữa Nhà trường, Giáo viên chủ nhiệm và Quý phụ huynh học sinh
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              onClick={handleExportPdf}
              className="text-slate-700 font-semibold"
            >
              <Icon name="download" size={15} />
              <span>In sổ liên lạc</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenFeedbackModal}
              className="font-semibold"
            >
              <Icon name="edit" size={15} />
              <span>Gửi ý kiến phụ huynh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      {summary && (
        <ContactBookSummaryCards
          summary={summary}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* 3. Search & Filter Bar */}
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

      {/* 4. Tab Content Views */}
      {summary && (
        <div>
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
              messages={messages}
              onSendMessage={handleSendMessage}
              onOpenFeedbackModal={handleOpenFeedbackModal}
              submitting={submitting}
            />
          )}
        </div>
      )}

      {/* 5. Parent Feedback & Confirmation Modal */}
      <ParentFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetWeek={targetWeek}
        onConfirmWeeklyReport={handleConfirmReport}
        onSendMessage={handleSendMessage}
        submitting={submitting}
      />
    </div>
  );
};

export default ContactBookPage;
