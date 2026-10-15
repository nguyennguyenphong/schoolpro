import React, { useEffect } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  ContactBookTab,
  ContactBookSummary,
} from "@/modules/students/features/contact-book/types";

interface ContactBookFilterBarProps {
  activeTab: ContactBookTab;
  onTabChange: (tab: ContactBookTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedWeek: number | "all";
  onWeekChange: (week: number | "all") => void;
  onResetFilters: () => void;
  summary: ContactBookSummary | null;
  onOpenFeedbackModal: () => void;
}

export const ContactBookFilterBar: React.FC<ContactBookFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedWeek,
  onWeekChange,
  onResetFilters,
  summary,
  onOpenFeedbackModal,
}) => {
  // Luôn auto focus vào input search khi component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("contact-book-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tabs: Array<{
    key: ContactBookTab;
    label: string;
    icon: "book" | "calendar" | "chart" | "fileText";
    countText?: string;
  }> = [
    {
      key: "overview",
      label: "Tổng quan & Bìa sổ",
      icon: "book",
    },
    {
      key: "weekly",
      label: "Theo dõi từng tuần",
      icon: "calendar",
      countText: "4 tuần",
    },
    {
      key: "subjects",
      label: "Đánh giá bộ môn",
      icon: "chart",
      countText: "8 môn",
    },
    {
      key: "feedback",
      label: "Ý kiến Cha Mẹ học sinh",
      icon: "fileText",
      countText: `${summary?.parentFeedbackCount ?? 3} phiếu`,
    },
  ];

  const weekOptions = [
    { label: "Tất cả các tuần", value: "all" },
    { label: "Tuần 4 (22/09 - 27/09)", value: 4 },
    { label: "Tuần 3 (15/09 - 20/09)", value: 3 },
    { label: "Tuần 2 (08/09 - 13/09)", value: 2 },
    { label: "Tuần 1 (01/09 - 06/09)", value: 1 },
  ];

  const hasActiveFilters = searchQuery.trim() !== "" || selectedWeek !== "all" || activeTab !== "overview";

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Bộ lọc trạng thái ở trên (Tabs theo chuẩn sổ liên lạc) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                name={tab.icon}
                size={14}
                className={isActive ? "text-white shrink-0" : "text-slate-400 shrink-0"}
              />
              <span>{tab.label}</span>
              {tab.countText && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
                  }`}
                >
                  {tab.countText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Dưới đó là input search và hành động nhanh */}
      <div className="pt-2.5 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Input Search */}
        <div className="flex-1 w-full sm:w-auto">
          <Input
            id="contact-book-search-input"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm môn học, nhận xét giáo viên, ý kiến gia đình..."
            prefix={<Icon name="search" size={14} className="text-slate-400" />}
            allowClear
            className="rounded-lg text-xs w-full"
          />
        </div>

        {/* Action Button: Ghi ý kiến vào sổ liên lạc */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="primary"
            onClick={onOpenFeedbackModal}
            className="rounded-lg text-xs font-semibold"
          >
            <Icon name="edit" size={14} />
            <span>Ghi ý kiến vào sổ</span>
          </Button>
        </div>
      </div>

      {/* 3. Bên dưới là các bộ lọc dropdown */}
      <div className="pt-2.5 border-t border-[#f0f0f0] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Học kỳ:</span>
            <Select
              value="hk1"
              options={[
                { label: "Học kỳ 1 (2025 - 2026)", value: "hk1" },
                { label: "Học kỳ 2 (2025 - 2026)", value: "hk2" },
              ]}
              className="w-48"
            />
          </div>

          {/* Chọn tuần học */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Tuần học:</span>
            <Select
              value={selectedWeek}
              onChange={onWeekChange}
              options={weekOptions}
              className="w-48"
            />
          </div>
        </div>

        {/* Nút đặt lại */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            title="Đặt lại tất cả bộ lọc"
          >
            <Icon name="check" size={13} className="text-rose-500" />
            <span>Đặt lại</span>
          </Button>
        )}
      </div>
    </div>
  );
};
