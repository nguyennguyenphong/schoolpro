import React, { useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type { ExamFilter, ExamSummary } from "@/modules/students/features/exams/types";

interface ExamFilterBarProps {
  filter: ExamFilter;
  summary: ExamSummary | null;
  onStatusChange: (status: ExamFilter["status"]) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
}

export const ExamFilterBar: React.FC<ExamFilterBarProps> = ({
  filter,
  summary,
  onStatusChange,
  onSearchChange,
}) => {
  // Luôn auto focus vào input search khi render
  useEffect(() => {
    const timer = setTimeout(() => {
      const inputEl = document.getElementById("exam-search-input");
      inputEl?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tabs: Array<{
    key: ExamFilter["status"];
    label: string;
    icon: "clock" | "checkCircle" | "file";
    count?: number;
  }> = [
    {
      key: "pending",
      label: "Cần thực hiện",
      icon: "clock",
      count: summary?.pendingCount ?? 0,
    },
    {
      key: "completed",
      label: "Đã hoàn thành",
      icon: "checkCircle",
      count: summary?.completedCount ?? 0,
    },
    {
      key: "all",
      label: "Tất cả đề thi",
      icon: "file",
      count: summary?.total ?? 0,
    },
  ];

  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      {/* Navigation Tabs - normal compact style like EvaluationPage */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = filter.status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
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
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Input Search - luôn focus */}
      <div className="w-full sm:w-64">
        <Input
          id="exam-search-input"
          autoFocus
          value={filter.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm đề thi, môn học..."
          prefix={<Icon name="search" size={14} className="text-slate-400" />}
          allowClear
          className="rounded-lg text-xs"
        />
      </div>
    </div>
  );
};
