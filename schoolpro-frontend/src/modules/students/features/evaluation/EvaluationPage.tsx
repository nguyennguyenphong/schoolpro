import React from "react";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Icon } from "@/components/ui/Icon";
import {
  EvaluationSummaryCards,
  SurveyCard,
  EvaluationSkeleton,
} from "@/modules/students/features/evaluation/components";
import { useEvaluation } from "@/modules/students/features/evaluation/hooks";
import type { SurveyItem } from "@/modules/students/features/evaluation/types";

export const EvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    surveys,
    summary,
    loading,
    activeTab,
    setActiveTab,
  } = useEvaluation();

  if (loading && surveys.length === 0) {
    return <EvaluationSkeleton />;
  }

  const handleOpenSurvey = (item: SurveyItem) => {
    navigate(`/student/evaluations/${item.id}`);
  };

  const tabs: Array<{
    key: "pending" | "completed" | "all";
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
      label: "Tất cả khảo sát",
      icon: "file",
      count: summary?.total ?? 0,
    },
  ];

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
                  <Icon name="checkCircle" size={13} className="text-blue-600 shrink-0" />
                  <span>Đánh giá & Khảo sát</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              Đánh giá & Khảo sát Học tập
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
            Khảo sát ý kiến học sinh về chất lượng giảng dạy môn học, cơ sở vật chất, hoạt động ngoại khóa và tự đánh giá rèn luyện
          </p>
        </div>
      </div>

      {/* 2. Overview Summary Cards (Dashboard & Announcements style) */}
      {summary && <EvaluationSummaryCards summary={summary} />}

      {/* 3. Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* 4. Survey List / Grid */}
      {surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {surveys.map((item) => (
            <SurveyCard
              key={item.id}
              item={item}
              onTakeSurvey={handleOpenSurvey}
              onViewResponse={handleOpenSurvey}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <p className="text-slate-700 font-semibold text-sm">
                  {activeTab === "pending"
                    ? "Không có phiếu khảo sát nào cần thực hiện"
                    : activeTab === "completed"
                    ? "Bạn chưa hoàn thành phiếu khảo sát nào"
                    : "Chưa có khảo sát nào được phát hành"}
                </p>
                <p className="text-xs text-slate-400">
                  {activeTab === "pending"
                    ? "Tất cả các phiếu đánh giá của học kỳ hiện tại đã được gửi thành công."
                    : "Nhà trường sẽ thông báo khi có các đợt khảo sát mới."}
                </p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};
